"use server"

import { sql } from "@/lib/db"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"
import { cache } from "@/lib/cache"

// Types
export type ApplicationFormData = {
  projectId: number
  message: string
}

// Apply to project action
export async function applyToProject(data: ApplicationFormData) {
  try {
    const userResult = await getCurrentUser()

    if (!userResult.success) {
      return { success: false, message: "Not authenticated" }
    }

    const user = userResult.user

    if (user.role !== "student") {
      return { success: false, message: "Unauthorized" }
    }

    // Get student profile ID
    const studentProfiles = await sql`
      SELECT id FROM student_profiles WHERE user_id = ${user.id}
    `

    if (studentProfiles.length === 0) {
      return { success: false, message: "Student profile not found" }
    }

    const studentId = studentProfiles[0].id

    // Check if project exists and is active
    const projects = await sql`
      SELECT id, deadline FROM projects 
      WHERE id = ${data.projectId} AND status = 'active'
    `

    if (projects.length === 0) {
      return { success: false, message: "Project not found or not accepting applications" }
    }

    const project = projects[0]

    // Check if deadline has passed
    const deadline = new Date(project.deadline)
    if (deadline < new Date()) {
      return { success: false, message: "Application deadline has passed" }
    }

    // Check if already applied
    const existingApplications = await sql`
      SELECT id FROM applications 
      WHERE project_id = ${data.projectId} AND student_id = ${studentId}
    `

    if (existingApplications.length > 0) {
      return { success: false, message: "You have already applied to this project" }
    }

    // Create application
    await sql`
      INSERT INTO applications (project_id, student_id, cover_letter)
      VALUES (${data.projectId}, ${studentId}, ${data.message})
    `

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
  // Ensure parameters are valid numbers
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
  const safeOffset = Math.max(0, Number(offset) || 0);
  
  try {
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
    // Get student profile ID
    const studentProfiles = await sql.unsafe(`
      SELECT id FROM student_profiles WHERE user_id = ?
    `, [user.id])
    if (studentProfiles.length === 0) {
      return []
    }
    const studentId = studentProfiles[0].id
    // Get applications with project and faculty details
    // Note: feedback column may not exist, so we'll handle it gracefully
    let applications: any[]
    try {
      applications = await sql.unsafe(`
        SELECT 
          a.id, a.status, a.cover_letter as message, a.feedback, a.applied_at,
          p.id as project_id, p.title as project_title,
          CONCAT(u.first_name, ' ', u.last_name) as faculty_name
        FROM applications a
        JOIN projects p ON a.project_id = p.id
        JOIN faculty_profiles fp ON p.faculty_id = fp.id
        JOIN users u ON fp.user_id = u.id
        WHERE a.student_id = ?
        ORDER BY a.applied_at DESC
        LIMIT ${safeLimit} OFFSET ${safeOffset}
      `, [studentId])
    } catch (error: any) {
      // If feedback column doesn't exist, select without it
      if (error.message?.includes("Unknown column 'feedback'")) {
        applications = await sql.unsafe(`
          SELECT 
            a.id, a.status, a.cover_letter as message, NULL as feedback, a.applied_at,
            p.id as project_id, p.title as project_title,
            CONCAT(u.first_name, ' ', u.last_name) as faculty_name
          FROM applications a
          JOIN projects p ON a.project_id = p.id
          JOIN faculty_profiles fp ON p.faculty_id = fp.id
          JOIN users u ON fp.user_id = u.id
          WHERE a.student_id = ?
          ORDER BY a.applied_at DESC
          LIMIT ${safeLimit} OFFSET ${safeOffset}
        `, [studentId])
      } else {
        throw error
      }
    }
    // Map "accepted" to "approved" for frontend compatibility
    const mappedApplications = applications.map((app: any) => ({
      ...app,
      status: app.status === "accepted" ? "approved" : app.status
    }))
    cache.set(cacheKey, mappedApplications, 30)
    return mappedApplications
  } catch (error) {
    console.error("Get student applications error:", error)
    throw error
  }
}

// Get faculty applications
export async function getFacultyApplications(limit = 10, offset = 0) {
  // Ensure parameters are valid numbers
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
  const safeOffset = Math.max(0, Number(offset) || 0);
  
  try {
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
    // Get faculty profile ID
    const facultyProfiles = await sql.unsafe(`
      SELECT id FROM faculty_profiles WHERE user_id = ?
    `, [user.id])
    if (facultyProfiles.length === 0) {
      return []
    }
    const facultyId = facultyProfiles[0].id
    // Get applications with project and student details
    // Note: feedback column may not exist, so we'll handle it gracefully
    let applications: any[]
    try {
      applications = await sql.unsafe(`
        SELECT 
          a.id, a.status, a.cover_letter as message, a.feedback, a.applied_at,
          p.id as project_id, p.title as project_title,
          s.id as student_id,
          CONCAT(u.first_name, ' ', u.last_name) as student_name,
          s.registration_number, s.year, s.cgpa, s.department
        FROM applications a
        JOIN projects p ON a.project_id = p.id
        JOIN student_profiles s ON a.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE p.faculty_id = ?
        ORDER BY a.applied_at DESC
        LIMIT ${safeLimit} OFFSET ${safeOffset}
      `, [facultyId])
    } catch (error: any) {
      // If feedback column doesn't exist, select without it
      if (error.message?.includes("Unknown column 'feedback'")) {
        applications = await sql.unsafe(`
          SELECT 
            a.id, a.status, a.cover_letter as message, NULL as feedback, a.applied_at,
            p.id as project_id, p.title as project_title,
            s.id as student_id,
            CONCAT(u.first_name, ' ', u.last_name) as student_name,
            s.registration_number, s.year, s.cgpa, s.department
          FROM applications a
          JOIN projects p ON a.project_id = p.id
          JOIN student_profiles s ON a.student_id = s.id
          JOIN users u ON s.user_id = u.id
          WHERE p.faculty_id = ?
          ORDER BY a.applied_at DESC
          LIMIT ${safeLimit} OFFSET ${safeOffset}
        `, [facultyId])
      } else {
        throw error
      }
    }
    // Map "accepted" to "approved" for frontend compatibility
    const mappedApplications = applications.map((app: any) => ({
      ...app,
      status: app.status === "accepted" ? "approved" : app.status
    }))
    cache.set(cacheKey, mappedApplications, 30)
    return mappedApplications
  } catch (error) {
    console.error("Get faculty applications error:", error)
    throw error
  }
}

// Update application status
export async function updateApplicationStatus(id: number, status: "accepted" | "rejected", feedback?: string) {
  try {
    const userResult = await getCurrentUser()

    if (!userResult.success) {
      return { success: false, message: "Not authenticated" }
    }

    const user = userResult.user

    if (user.role !== "faculty") {
      return { success: false, message: "Unauthorized" }
    }

    // Get faculty profile ID
    const facultyProfiles = await sql`
      SELECT id FROM faculty_profiles WHERE user_id = ${user.id}
    `

    if (facultyProfiles.length === 0) {
      return { success: false, message: "Faculty profile not found" }
    }

    const facultyId = facultyProfiles[0].id

    // Check if the application belongs to a project owned by the faculty
    const applications = await sql`
      SELECT a.id
      FROM applications a
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = ${id} AND p.faculty_id = ${facultyId}
    `

    if (applications.length === 0) {
      return { success: false, message: "Application not found or you don't have permission to update it" }
    }

    // Update application status
    // Update reviewed_at timestamp when status changes
    await sql`
      UPDATE applications
      SET 
        status = ${status}, 
        reviewed_at = CURRENT_TIMESTAMP, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `
    
    // If feedback is provided, try to update it (column may not exist in all schemas)
    // This is a separate update to avoid errors if feedback column doesn't exist
    if (feedback) {
      try {
        await sql.unsafe(
          `UPDATE applications SET feedback = ? WHERE id = ?`,
          [feedback, id]
        )
      } catch (error: any) {
        // If feedback column doesn't exist, log but don't fail
        if (!error.message?.includes("Unknown column 'feedback'")) {
          throw error
        }
        console.warn("Feedback column not found in applications table, skipping feedback update")
      }
    }

    revalidatePath("/dashboard/faculty")
    revalidatePath("/dashboard/faculty/applications")
    revalidatePath("/dashboard/student/applications")

    return { success: true }
  } catch (error) {
    console.error("Update application status error:", error)
    return { success: false, message: "An error occurred while updating the application" }
  }
}
