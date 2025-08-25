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
      INSERT INTO applications (project_id, student_id, message)
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
    const applications = await sql.unsafe(`
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
    cache.set(cacheKey, applications, 30)
    return applications
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
    const applications = await sql.unsafe(`
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
    cache.set(cacheKey, applications, 30)
    return applications
  } catch (error) {
    console.error("Get faculty applications error:", error)
    throw error
  }
}

// Update application status
export async function updateApplicationStatus(id: number, status: "approved" | "rejected", feedback?: string) {
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
    await sql`
      UPDATE applications
      SET status = ${status}, feedback = ${feedback || null}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    revalidatePath("/dashboard/faculty")
    revalidatePath("/dashboard/faculty/applications")
    revalidatePath("/dashboard/student/applications")

    return { success: true }
  } catch (error) {
    console.error("Update application status error:", error)
    return { success: false, message: "An error occurred while updating the application" }
  }
}
