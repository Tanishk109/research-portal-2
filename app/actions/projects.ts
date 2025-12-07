"use server"

import { connectToMongoDB } from "@/lib/mongodb"
import { Project, User, FacultyProfile, Application } from "@/lib/models"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"
import { cache } from "@/lib/cache"
import { toObjectId, toPlainObject } from "@/lib/db"

// Types
export type ProjectFormData = {
  title: string
  description: string
  longDescription: string
  researchArea: string
  positions: number
  startDate: string
  deadline: string
  minCgpa: number
  eligibility: string
  prerequisites: string
  tags: string[]
  status: "draft" | "active" | "closed" | "completed"
}

export type ProjectWithFaculty = {
  id: string
  title: string
  description: string
  research_area: string
  positions: number
  start_date: string
  deadline: string
  status: string
  min_cgpa: number
  eligibility: string
  prerequisites: string
  created_at: string
  faculty_name: string
  department: string
  tags: string[]
}

// Get all projects
export async function getProjects(
  filters: { status?: string; department?: string; researchArea?: string; searchTerm?: string } = {},
) {
  try {
    await connectToMongoDB()

    const matchStage: any = {}

    if (filters.status) {
      matchStage.status = filters.status
    }

    if (filters.researchArea && filters.researchArea !== "all") {
      matchStage.research_area = filters.researchArea
    }

    if (filters.searchTerm) {
      matchStage.$or = [
        { title: { $regex: filters.searchTerm, $options: "i" } },
        { description: { $regex: filters.searchTerm, $options: "i" } },
      ]
    }

    const projects = await Project.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "facultyprofiles",
          localField: "faculty_id",
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
        $match: filters.department && filters.department !== "all"
          ? { "facultyProfile.department": filters.department }
          : {},
      },
      {
        $project: {
          id: { $toString: "$_id" },
          title: 1,
          description: 1,
          research_area: 1,
          positions: 1,
          start_date: 1,
          deadline: 1,
          status: 1,
          min_cgpa: 1,
          eligibility: 1,
          prerequisites: 1,
          created_at: 1,
          faculty_name: { $concat: ["$facultyUser.first_name", " ", "$facultyUser.last_name"] },
          department: "$facultyProfile.department",
          tags: { $ifNull: ["$tags", []] },
        },
      },
      { $sort: { created_at: -1 } },
    ])

    return projects as ProjectWithFaculty[]
  } catch (error) {
    console.error("Get all projects error:", error)
    throw error
  }
}

// Get active projects
export async function getActiveProjects() {
  try {
    await connectToMongoDB()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const projects = await Project.aggregate([
      {
        $match: {
          status: "active",
          $or: [{ deadline: { $exists: false } }, { deadline: { $gte: today } }],
        },
      },
      {
        $lookup: {
          from: "facultyprofiles",
          localField: "faculty_id",
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
          title: 1,
          description: 1,
          research_area: 1,
          positions: 1,
          start_date: 1,
          deadline: 1,
          status: 1,
          min_cgpa: 1,
          eligibility: 1,
          prerequisites: 1,
          created_at: 1,
          faculty_name: { $concat: ["$facultyUser.first_name", " ", "$facultyUser.last_name"] },
          department: "$facultyProfile.department",
          tags: { $ifNull: ["$tags", []] },
        },
      },
      { $sort: { created_at: -1 } },
    ])

    return projects as ProjectWithFaculty[]
  } catch (error) {
    console.error("Get active projects error:", error)
    throw error
  }
}

// Get project by ID
export async function getProjectById(id: number | string) {
  try {
    await connectToMongoDB()

    const projectId = toObjectId(id)
    if (!projectId) {
      return null
    }

    const projects = await Project.aggregate([
      { $match: { _id: projectId } },
      {
        $lookup: {
          from: "facultyprofiles",
          localField: "faculty_id",
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
          title: 1,
          description: 1,
          long_description: 1,
          research_area: 1,
          positions: 1,
          start_date: 1,
          deadline: 1,
          status: 1,
          min_cgpa: 1,
          eligibility: 1,
          prerequisites: 1,
          created_at: 1,
          faculty_id: { $toString: "$facultyProfile._id" },
          faculty_name: { $concat: ["$facultyUser.first_name", " ", "$facultyUser.last_name"] },
          department: "$facultyProfile.department",
          specialization: "$facultyProfile.specialization",
          faculty_email: "$facultyUser.email",
          faculty_bio: "$facultyProfile.bio",
          tags: { $ifNull: ["$tags", []] },
        },
      },
    ])

    if (projects.length === 0) {
      return null
    }

    return projects[0]
  } catch (error) {
    console.error("Get project by ID error:", error)
    throw error
  }
}

// Get faculty projects
export async function getFacultyProjects() {
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
    const cacheKey = `faculty-projects-${user.id}`
    const cached = cache.get<any[]>(cacheKey)
    if (cached) return cached

    const userId = toObjectId(user.id)
    if (!userId) {
      return []
    }

    // Get faculty profile
    const facultyProfile = await FacultyProfile.findOne({ user_id: userId }).lean()
    if (!facultyProfile) {
      console.error(`Faculty profile not found for user_id: ${user.id}`)
      return []
    }

    // Get projects with application counts
    const projects = await Project.aggregate([
      { $match: { faculty_id: facultyProfile._id } },
      {
        $lookup: {
          from: "applications",
          localField: "_id",
          foreignField: "project_id",
          as: "applications",
        },
      },
      {
        $project: {
          id: { $toString: "$_id" },
          title: 1,
          description: 1,
          research_area: 1,
          positions: 1,
          start_date: 1,
          deadline: 1,
          status: 1,
          created_at: 1,
          application_count: { $size: "$applications" },
          tags: { $ifNull: ["$tags", []] },
        },
      },
      { $sort: { created_at: -1 } },
    ])

    cache.set(cacheKey, projects, 30) // cache for 30 seconds
    return projects
  } catch (error) {
    console.error("Get faculty projects error:", error)
    throw error
  }
}

// Create project action
export async function createProject(data: ProjectFormData) {
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
      console.error(`Faculty profile not found for user_id: ${user.id}`)
      return { success: false, message: "Faculty profile not found. Please contact admin." }
    }

      // Create project
    const project = await Project.create({
      faculty_id: facultyProfile._id,
      title: data.title,
      description: data.longDescription || data.description, // Use longDescription if available, fallback to description
      research_area: data.researchArea,
      positions: data.positions,
      start_date: new Date(data.startDate),
      deadline: new Date(data.deadline),
      status: data.status,
      min_cgpa: String(data.minCgpa),
      eligibility: data.eligibility,
      prerequisites: data.prerequisites,
      tags: data.tags || [],
    })

      revalidatePath("/dashboard/faculty")
      revalidatePath("/dashboard/faculty/projects")
      revalidatePath("/projects")

    return { success: true, projectId: String(project._id) }
  } catch (error) {
    console.error("Create project error:", error)
    return { success: false, message: "An error occurred while creating the project" }
  }
}

// Update project action
export async function updateProject(id: number | string, data: ProjectFormData) {
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

    const projectId = toObjectId(id)
    if (!projectId) {
      return { success: false, message: "Invalid project ID" }
    }

    // Check if the project belongs to the faculty
    const project = await Project.findById(projectId)
    if (!project || String(project.faculty_id) !== String(facultyProfile._id)) {
      return { success: false, message: "Project not found or you don't have permission to update it" }
    }

      // Update project
    await Project.findByIdAndUpdate(projectId, {
      title: data.title,
      description: data.longDescription || data.description,
      research_area: data.researchArea,
      positions: data.positions,
      start_date: new Date(data.startDate),
      deadline: new Date(data.deadline),
      status: data.status,
      min_cgpa: String(data.minCgpa),
      eligibility: data.eligibility,
      prerequisites: data.prerequisites,
      tags: data.tags || [],
      updated_at: new Date(),
    })

    revalidatePath("/dashboard/faculty")
    revalidatePath("/dashboard/faculty/projects")
    revalidatePath(`/dashboard/faculty/projects/${id}`)
    revalidatePath("/projects")
    revalidatePath(`/projects/${id}`)

    return { success: true }
  } catch (error) {
    console.error("Update project error:", error)
    return { success: false, message: "An error occurred while updating the project" }
  }
}

// Delete project action
export async function deleteProject(id: number | string) {
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

    const projectId = toObjectId(id)
    if (!projectId) {
      return { success: false, message: "Invalid project ID" }
    }

    // Check if the project belongs to the faculty
    const project = await Project.findById(projectId)
    if (!project || String(project.faculty_id) !== String(facultyProfile._id)) {
      return { success: false, message: "Project not found or you don't have permission to delete it" }
    }

    // Check if there are any approved applications
    const approvedApplications = await Application.find({
      project_id: projectId,
      status: "accepted",
    })

    if (approvedApplications.length > 0) {
      return {
        success: false,
        message: "Cannot delete project with approved applications. Change the status to 'closed' instead.",
      }
    }

      // Delete applications
    await Application.deleteMany({ project_id: projectId })

      // Delete project
    await Project.findByIdAndDelete(projectId)

    revalidatePath("/dashboard/faculty")
    revalidatePath("/dashboard/faculty/projects")
    revalidatePath("/projects")

    return { success: true }
  } catch (error) {
    console.error("Delete project error:", error)
    return { success: false, message: "An error occurred while deleting the project" }
  }
}

// Check if student has applied to project
export async function hasStudentAppliedToProject(projectId: number | string) {
  try {
    await connectToMongoDB()
    const userResult = await getCurrentUser()

    if (!userResult.success) {
      return false
    }

    const user = userResult.user

    if (user.role !== "student") {
      return false
    }

    const userId = toObjectId(user.id)
    if (!userId) {
      return false
    }

    // Get student profile
    const studentProfile = await (await import("@/lib/models")).StudentProfile.findOne({ user_id: userId }).lean()
    if (!studentProfile) {
      return false
    }

    const projId = toObjectId(projectId)
    if (!projId) {
      return false
    }

    // Check if student has applied
    const application = await Application.findOne({
      project_id: projId,
      student_id: userId,
    })

    return !!application
  } catch (error) {
    console.error("Check student application error:", error)
    return false
  }
}
