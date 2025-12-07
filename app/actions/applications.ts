"use server"

import { connectToMongoDB } from "@/lib/mongodb"
import { Application, Project, User, FacultyProfile, StudentProfile } from "@/lib/models"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"
import { cache } from "@/lib/cache"
import { toObjectId, toPlainObject } from "@/lib/db"

// Types
export type ApplicationFormData = {
  projectId: number | string
  message: string
}

// Apply to project action
export async function applyToProject(data: ApplicationFormData) {
  try {
    await connectToMongoDB()
    const userResult = await getCurrentUser()

    if (!userResult.success) {
      return { success: false, message: "Not authenticated" }
    }

    const user = userResult.user

    if (user.role !== "student") {
      return { success: false, message: "Unauthorized" }
    }

    const userId = toObjectId(user.id)
    if (!userId) {
      return { success: false, message: "Invalid user ID" }
    }

    // Get student profile
    const studentProfile = await StudentProfile.findOne({ user_id: userId })
    if (!studentProfile) {
      return { success: false, message: "Student profile not found" }
    }

    const projectId = toObjectId(data.projectId)
    if (!projectId) {
      return { success: false, message: "Invalid project ID" }
    }

    // Check if project exists and is active
    const project = await Project.findById(projectId).lean()
    if (!project || project.status !== "active") {
      return { success: false, message: "Project not found or not accepting applications" }
    }
    if (!project) {
      return { success: false, message: "Project not found or not accepting applications" }
    }

    // Check if deadline has passed
    if (project.deadline && new Date(project.deadline) < new Date()) {
      return { success: false, message: "Application deadline has passed" }
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      project_id: projectId,
      student_id: userId,
    })

    if (existingApplication) {
      return { success: false, message: "You have already applied to this project" }
    }

    // Create application
    await Application.create({
      project_id: projectId,
      student_id: userId,
      cover_letter: data.message,
      status: "pending",
    })

    revalidatePath("/dashboard/student")
    revalidatePath("/dashboard/student/applications")
    revalidatePath(`/projects/${data.projectId}`)

    return { success: true }
  } catch (error) {
    console.error("Apply to project error:", error)
    return { success: false, message: "An error occurred while applying to the project" }
  }
}

// Get student applications
export async function getStudentApplications(limit = 10, offset = 0) {
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10))
  const safeOffset = Math.max(0, Number(offset) || 0)
  
  try {
    await connectToMongoDB()
    const userResult = await getCurrentUser()
    if (!userResult.success) {
      return []
    }
    const user = userResult.user
    if (user.role !== "student") {
      return []
    }

    // Use cache per student user
    const cacheKey = `student-applications-${user.id}-${safeLimit}-${safeOffset}`
    const cached = cache.get<any[]>(cacheKey)
    if (cached) return cached

    const userId = toObjectId(user.id)
    if (!userId) {
      return []
    }

    // Get applications with project and faculty details
    const applications = await Application.aggregate([
      { $match: { student_id: userId } },
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $lookup: {
          from: "facultyprofiles",
          localField: "project.faculty_id",
          foreignField: "_id",
          as: "facultyProfile",
        },
      },
      { $unwind: "$facultyProfile" },
      {
        $lookup: {
          from: "users",
          localField: "facultyProfile.user_id",
          foreignField: "_id",
          as: "facultyUser",
        },
      },
      { $unwind: "$facultyUser" },
      {
        $project: {
          id: { $toString: "$_id" },
          status: {
            $cond: [{ $eq: ["$status", "accepted"] }, "approved", "$status"],
          },
          message: "$cover_letter",
          feedback: { $ifNull: ["$feedback", null] },
          applied_at: "$applied_at",
          project_id: { $toString: "$project._id" },
          project_title: "$project.title",
          faculty_name: { $concat: ["$facultyUser.first_name", " ", "$facultyUser.last_name"] },
        },
      },
      { $sort: { applied_at: -1 } },
      { $skip: safeOffset },
      { $limit: safeLimit },
    ])

    cache.set(cacheKey, applications, 30)
    return applications
  } catch (error) {
    console.error("Get student applications error:", error)
    throw error
  }
}

// Get faculty applications
export async function getFacultyApplications(limit = 10, offset = 0) {
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10))
  const safeOffset = Math.max(0, Number(offset) || 0)
  
  try {
    await connectToMongoDB()
    const userResult = await getCurrentUser()
    if (!userResult.success) {
      return []
    }
    const user = userResult.user
    if (user.role !== "faculty") {
      return []
    }

    // Use cache per faculty user
    const cacheKey = `faculty-applications-${user.id}-${safeLimit}-${safeOffset}`
    const cached = cache.get<any[]>(cacheKey)
    if (cached) return cached

    const userId = toObjectId(user.id)
    if (!userId) {
      return []
    }

    // Get faculty profile
    const facultyProfile = await FacultyProfile.findOne({ user_id: userId }).lean()
    if (!facultyProfile) {
      return []
    }

    // Get applications with project and student details
    const applications = await Application.aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $match: { "project.faculty_id": facultyProfile._id } },
      {
        $lookup: {
          from: "studentprofiles",
          localField: "student_id",
          foreignField: "user_id",
          as: "studentProfile",
        },
      },
      { $unwind: "$studentProfile" },
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "_id",
          as: "studentUser",
        },
      },
      { $unwind: "$studentUser" },
      {
        $project: {
          id: { $toString: "$_id" },
          status: {
            $cond: [{ $eq: ["$status", "accepted"] }, "approved", "$status"],
          },
          message: "$cover_letter",
          feedback: { $ifNull: ["$feedback", null] },
          applied_at: "$applied_at",
          project_id: { $toString: "$project._id" },
          project_title: "$project.title",
          student_id: { $toString: "$studentProfile._id" },
          student_name: { $concat: ["$studentUser.first_name", " ", "$studentUser.last_name"] },
          registration_number: "$studentProfile.registration_number",
          year: "$studentProfile.year",
          cgpa: "$studentProfile.cgpa",
          department: "$studentProfile.department",
        },
      },
      { $sort: { applied_at: -1 } },
      { $skip: safeOffset },
      { $limit: safeLimit },
    ])

    cache.set(cacheKey, applications, 30)
    return applications
  } catch (error) {
    console.error("Get faculty applications error:", error)
    throw error
  }
}

// Update application status
export async function updateApplicationStatus(
  id: number | string,
  status: "accepted" | "rejected",
  feedback?: string
) {
  try {
    await connectToMongoDB()
    const userResult = await getCurrentUser()

    if (!userResult.success) {
      return { success: false, message: "Not authenticated" }
    }

    const user = userResult.user

    if (user.role !== "faculty") {
      return { success: false, message: "Unauthorized" }
    }

    const userId = toObjectId(user.id)
    if (!userId) {
      return { success: false, message: "Invalid user ID" }
    }

    // Get faculty profile
    const facultyProfile = await FacultyProfile.findOne({ user_id: userId })
    if (!facultyProfile) {
      return { success: false, message: "Faculty profile not found" }
    }

    const applicationId = toObjectId(id)
    if (!applicationId) {
      return { success: false, message: "Invalid application ID" }
    }

    // Check if the application belongs to a project owned by the faculty
    const application = await Application.findById(applicationId).populate({
      path: "project_id",
      match: { faculty_id: facultyProfile._id },
    })

    if (!application || !application.project_id) {
      return { success: false, message: "Application not found or you don't have permission to update it" }
    }

    // Update application status
    const updateData: any = {
      status,
      reviewed_at: new Date(),
      updated_at: new Date(),
    }

    if (feedback) {
      updateData.feedback = feedback
    }

    await Application.findByIdAndUpdate(applicationId, updateData)

    revalidatePath("/dashboard/faculty")
    revalidatePath("/dashboard/faculty/applications")
    revalidatePath("/dashboard/student/applications")

    return { success: true }
  } catch (error) {
    console.error("Update application status error:", error)
    return { success: false, message: "An error occurred while updating the application" }
  }
}

// Get faculty application by ID (for detail view)
export async function getFacultyApplicationById(id: number | string) {
  try {
    await connectToMongoDB()
    const userResult = await getCurrentUser()

    if (!userResult.success) {
      return null
    }

    const user = userResult.user

    if (user.role !== "faculty") {
      return null
    }

    const userId = toObjectId(user.id)
    if (!userId) {
      return null
    }

    // Get faculty profile
    const facultyProfile = await FacultyProfile.findOne({ user_id: userId }).lean()
    if (!facultyProfile) {
      return null
    }

    const applicationId = toObjectId(id)
    if (!applicationId) {
      return null
    }

    // Get application with all related data
    const applications = await Application.aggregate([
      { $match: { _id: applicationId } },
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $match: { "project.faculty_id": facultyProfile._id } },
      {
        $lookup: {
          from: "studentprofiles",
          localField: "student_id",
          foreignField: "user_id",
          as: "studentProfile",
        },
      },
      { $unwind: "$studentProfile" },
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "_id",
          as: "studentUser",
        },
      },
      { $unwind: "$studentUser" },
      {
        $project: {
          id: { $toString: "$_id" },
          status: {
            $cond: [{ $eq: ["$status", "accepted"] }, "approved", "$status"],
          },
          cover_letter: "$cover_letter",
          feedback: { $ifNull: ["$feedback", null] },
          applied_at: "$applied_at",
          reviewed_at: "$reviewed_at",
          project: {
            id: { $toString: "$project._id" },
            title: "$project.title",
            description: "$project.description",
          },
          student: {
            id: { $toString: "$studentUser._id" },
            name: { $concat: ["$studentUser.first_name", " ", "$studentUser.last_name"] },
            email: "$studentUser.email",
            registration_number: "$studentProfile.registration_number",
            year: "$studentProfile.year",
            cgpa: "$studentProfile.cgpa",
            department: "$studentProfile.department",
          },
        },
      },
    ])

    return applications.length > 0 ? applications[0] : null
  } catch (error) {
    console.error("Get faculty application by ID error:", error)
    return null
  }
}
