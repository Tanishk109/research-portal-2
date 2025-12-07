"use server"

import { connectToMongoDB } from "@/lib/mongodb"
import { Project, Application, FacultyProfile, StudentProfile } from "@/lib/models"
import { getCurrentUser } from "./auth"
import { toObjectId, toPlainObject } from "@/lib/db"

// Get project analytics
export async function getProjectAnalytics() {
  try {
    await connectToMongoDB()
    const userResult = await getCurrentUser()

    if (!userResult.success) {
      throw new Error("Not authenticated")
    }

    const user = userResult.user

    if (user.role !== "faculty") {
      throw new Error("Unauthorized")
    }

    const userId = toObjectId(user.id)
    if (!userId) {
      throw new Error("Invalid user ID")
    }

    // Get faculty profile
    const facultyProfile = await FacultyProfile.findOne({ user_id: userId })
    if (!facultyProfile) {
      throw new Error("Faculty profile not found")
    }

    const facultyId = facultyProfile._id

    // Get total projects
    const totalProjects = await Project.countDocuments({ faculty_id: facultyId })

    // Get projects by status
    const projectsByStatusResult = await Project.aggregate([
      { $match: { faculty_id: facultyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: { $toUpper: { $substr: ["$_id", 0, 1] } }, count: 1 } },
    ])
    const projectsByStatus = projectsByStatusResult.map((row) => ({
      status: row._id.charAt(0).toUpperCase() + row._id.slice(1),
      count: row.count,
    }))

    // Get projects by research area
    const projectsByResearchAreaResult = await Project.aggregate([
      { $match: { faculty_id: facultyId, research_area: { $exists: true, $ne: null } } },
      { $group: { _id: "$research_area", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])
    const projectsByResearchArea = projectsByResearchAreaResult.map((row) => ({
      research_area: row._id,
      count: row.count,
    }))

    // Get projects over time (by month)
    const projectsOverTimeResult = await Project.aggregate([
      { $match: { faculty_id: facultyId } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$created_at" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", count: 1, _id: 0 } },
    ])
    const projectsOverTime = projectsOverTimeResult.map((row) => ({
      month: row.month,
      count: row.count,
    }))

    // Get average applications per project
    const avgApplicationsResult = await Project.aggregate([
      { $match: { faculty_id: facultyId } },
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
          application_count: { $size: "$applications" },
        },
      },
      {
        $group: {
          _id: null,
          avg_applications: { $avg: "$application_count" },
        },
      },
    ])
    const avgApplications = avgApplicationsResult.length > 0
      ? Number.parseFloat(avgApplicationsResult[0].avg_applications || 0).toFixed(1)
      : "0.0"

    return {
      totalProjects,
      projectsByStatus,
      projectsByResearchArea,
      projectsOverTime,
      avgApplications,
    }
  } catch (error) {
    console.error("Get project analytics error:", error)
    throw error
  }
}

// Get application analytics
export async function getApplicationAnalytics() {
  try {
    await connectToMongoDB()
    const userResult = await getCurrentUser()

    if (!userResult.success) {
      throw new Error("Not authenticated")
    }

    const user = userResult.user

    if (user.role !== "faculty") {
      throw new Error("Unauthorized")
    }

    const userId = toObjectId(user.id)
    if (!userId) {
      throw new Error("Invalid user ID")
    }

    // Get faculty profile
    const facultyProfile = await FacultyProfile.findOne({ user_id: userId })
    if (!facultyProfile) {
      throw new Error("Faculty profile not found")
    }

    const facultyId = facultyProfile._id

    // Get total applications
    const totalApplicationsResult = await Application.aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $match: { "project.faculty_id": facultyId } },
      { $count: "count" },
    ])
    const totalApplications = totalApplicationsResult.length > 0 ? totalApplicationsResult[0].count : 0

    // Get approved applications
    const approvedApplicationsResult = await Application.aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $match: { "project.faculty_id": facultyId, status: "accepted" } },
      { $count: "count" },
    ])
    const approvedApplications = approvedApplicationsResult.length > 0 ? approvedApplicationsResult[0].count : 0

    // Get applications by status
    const applicationsByStatusResult = await Application.aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $match: { "project.faculty_id": facultyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    const applicationsByStatus = applicationsByStatusResult.map((row) => ({
      status: row._id.charAt(0).toUpperCase() + row._id.slice(1),
      count: row.count,
    }))

    // Get top projects by applications
    const topProjectsByApplicationsResult = await Application.aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $match: { "project.faculty_id": facultyId } },
      {
        $group: {
          _id: "$project._id",
          title: { $first: "$project.title" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])
    const topProjectsByApplications = topProjectsByApplicationsResult.map((row) => ({
      title: row.title.length > 20 ? row.title.substring(0, 20) + "..." : row.title,
      count: row.count,
    }))

    // Get applications over time (by month)
    const applicationsOverTimeResult = await Application.aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $match: { "project.faculty_id": facultyId } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$applied_at" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", count: 1, _id: 0 } },
    ])
    const applicationsOverTime = applicationsOverTimeResult.map((row) => ({
      month: row.month,
      count: row.count,
    }))

    // Get applicants by department
    const applicantsByDepartmentResult = await Application.aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $match: { "project.faculty_id": facultyId } },
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
        $group: {
          _id: "$studentProfile.department",
          count: { $addToSet: "$student_id" },
        },
      },
      {
        $project: {
          department: "$_id",
          count: { $size: "$count" },
        },
      },
      { $sort: { count: -1 } },
    ])
    const applicantsByDepartment = applicantsByDepartmentResult.map((row) => ({
      department: row.department,
      count: row.count,
    }))

    // Get applicants by year
    const applicantsByYearResult = await Application.aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $match: { "project.faculty_id": facultyId } },
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
        $group: {
          _id: "$studentProfile.year",
          count: { $addToSet: "$student_id" },
        },
      },
      {
        $project: {
          year: "$_id",
          count: { $size: "$count" },
        },
      },
      { $sort: { year: 1 } },
    ])
    const applicantsByYear = applicantsByYearResult.map((row) => ({
      year: row.year,
      count: row.count,
    }))

    // Get applicants by CGPA range
    const applicantsByCGPAResult = await Application.aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $match: { "project.faculty_id": facultyId } },
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
        $project: {
          student_id: 1,
          cgpa_range: {
            $switch: {
              branches: [
                { case: { $gte: ["$studentProfile.cgpa", 9.0] }, then: "9.0 - 10.0" },
                { case: { $gte: ["$studentProfile.cgpa", 8.0] }, then: "8.0 - 8.99" },
                { case: { $gte: ["$studentProfile.cgpa", 7.0] }, then: "7.0 - 7.99" },
              ],
              default: "Below 7.0",
            },
          },
        },
      },
      {
        $group: {
          _id: "$cgpa_range",
          count: { $addToSet: "$student_id" },
        },
      },
      {
        $project: {
          range: "$_id",
          count: { $size: "$count" },
        },
      },
      { $sort: { range: -1 } },
    ])
    const applicantsByCGPA = applicantsByCGPAResult.map((row) => ({
      range: row.range,
      count: row.count,
    }))

    // Get success rate by department
    const successRateByDepartmentResult = await Application.aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $match: { "project.faculty_id": facultyId } },
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
        $group: {
          _id: "$studentProfile.department",
          total_applications: { $sum: 1 },
          approved_applications: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          department: "$_id",
          rate: {
            $cond: [
              { $eq: ["$total_applications", 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$approved_applications", "$total_applications"] },
                      100,
                    ],
                  },
                  0,
                ],
              },
            ],
          },
        },
      },
      { $sort: { rate: -1 } },
    ])
    const successRateByDepartment = successRateByDepartmentResult.map((row) => ({
      department: row.department,
      rate: row.rate,
    }))

    // Calculate conversion rate
    const totalProjects = await Project.countDocuments({ faculty_id: facultyId })
    const conversionRate = totalProjects > 0 ? Math.round((totalApplications / totalProjects) * 100) : 0

    return {
      totalApplications,
      approvedApplications,
      applicationsByStatus,
      topProjectsByApplications,
      applicationsOverTime,
      applicantsByDepartment,
      applicantsByYear,
      applicantsByCGPA,
      successRateByDepartment,
      conversionRate,
    }
  } catch (error) {
    console.error("Get application analytics error:", error)
    throw error
  }
}
