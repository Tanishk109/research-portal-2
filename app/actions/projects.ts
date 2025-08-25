"use server"

import { sql } from "@/lib/db"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"
import { cache } from "@/lib/cache"
import { getPool } from "@/lib/db"

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
  id: number
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
    let query = `
      SELECT 
        p.id, p.title, p.description, p.research_area, p.positions, 
        p.start_date, p.deadline, p.status, p.min_cgpa, p.eligibility, 
        p.prerequisites, p.created_at,
        CONCAT(u.first_name, ' ', u.last_name) as faculty_name,
        fp.department,
        GROUP_CONCAT(pt.tag) as tags
      FROM projects p
      JOIN faculty_profiles fp ON p.faculty_id = fp.id
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN project_tags pt ON p.id = pt.project_id
      WHERE 1=1
    `
    const params: any[] = []

    if (filters.status) {
      query += ` AND p.status = ${filters.status}`
    }

    if (filters.department && filters.department !== "all") {
      query += ` AND fp.department = ${filters.department}`
    }

    if (filters.researchArea && filters.researchArea !== "all") {
      query += ` AND p.research_area = ${filters.researchArea}`
    }

    if (filters.searchTerm) {
      const searchTerm = `%${filters.searchTerm}%`
      query += ` AND (p.title ILIKE ${searchTerm} OR p.description ILIKE ${searchTerm} OR CONCAT(u.first_name, ' ', u.last_name) ILIKE ${searchTerm})`
    }

    query += `
      GROUP BY p.id, u.first_name, u.last_name, fp.department
      ORDER BY p.created_at DESC
    `

    const projects = await sql.unsafe(query)
    // Ensure tags is always an array
    for (const project of projects) {
      if (project.tags == null) {
        project.tags = []
      } else if (typeof project.tags === 'string') {
        project.tags = project.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      }
    }
    return projects as ProjectWithFaculty[]
  } catch (error) {
    console.error("Get all projects error:", error)
    throw error
  }
}

// Get active projects
export async function getActiveProjects() {
  try {
    const projects = await sql`
      SELECT 
        p.id, p.title, p.description, p.research_area, p.positions, 
        p.start_date, p.deadline, p.status, p.min_cgpa, p.eligibility, 
        p.prerequisites, p.created_at,
        CONCAT(u.first_name, ' ', u.last_name) as faculty_name,
        fp.department,
        GROUP_CONCAT(pt.tag) as tags
      FROM projects p
      JOIN faculty_profiles fp ON p.faculty_id = fp.id
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN project_tags pt ON p.id = pt.project_id
      WHERE p.status = 'active' AND p.deadline >= CURRENT_DATE
      GROUP BY p.id, u.first_name, u.last_name, fp.department
      ORDER BY p.created_at DESC
    `

    return projects as ProjectWithFaculty[]
  } catch (error) {
    console.error("Get active projects error:", error)
    throw error
  }
}

// Get project by ID
export async function getProjectById(id: number) {
  try {
    const projects = await sql`
      SELECT 
        p.id, p.title, p.description, p.long_description, p.research_area, 
        p.positions, p.start_date, p.deadline, p.status, p.min_cgpa, 
        p.eligibility, p.prerequisites, p.created_at,
        fp.id as faculty_id,
        CONCAT(u.first_name, ' ', u.last_name) as faculty_name,
        fp.department, fp.specialization,
        GROUP_CONCAT(pt.tag) as tags,
        u.email as faculty_email,
        fp.bio as faculty_bio
      FROM projects p
      JOIN faculty_profiles fp ON p.faculty_id = fp.id
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN project_tags pt ON p.id = pt.project_id
      WHERE p.id = ${id}
      GROUP BY p.id, fp.id, u.first_name, u.last_name, fp.department, fp.specialization, u.email, fp.bio
    `

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

    // Get faculty profile ID
    const facultyProfiles = await sql`
      SELECT id FROM faculty_profiles WHERE user_id = ${user.id}
    `

    if (facultyProfiles.length === 0) {
      console.error(`Faculty profile not found for user_id: ${user.id}`);
      return []
    }

    const facultyId = facultyProfiles[0].id

    // Get projects with application counts
    const projects = await sql`
      SELECT 
        p.id, p.title, p.description, p.research_area, p.positions, 
        p.start_date, p.deadline, p.status, p.created_at,
        COUNT(a.id) as application_count,
        GROUP_CONCAT(pt.tag) as tags
      FROM projects p
      LEFT JOIN applications a ON p.id = a.project_id
      LEFT JOIN project_tags pt ON p.id = pt.project_id
      WHERE p.faculty_id = ${facultyId}
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `

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
      console.error(`Faculty profile not found for user_id: ${user.id}`);
      return { success: false, message: "Faculty profile not found. Please contact admin." }
    }

    const facultyId = facultyProfiles[0].id

    // Transaction using mysql2/promise
    const pool = getPool()
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      // Create project
      const [newProjectResult] = await connection.query(
        `INSERT INTO projects (
          faculty_id, title, description, long_description, research_area, 
          positions, start_date, deadline, status, min_cgpa, 
          eligibility, prerequisites
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          facultyId,
          data.title,
          data.description,
          data.longDescription,
          data.researchArea,
          data.positions,
          data.startDate,
          data.deadline,
          data.status,
          data.minCgpa,
          data.eligibility,
          data.prerequisites,
        ]
      )
      // @ts-ignore
      const projectId = newProjectResult.insertId

      // Add tags
      if (data.tags && data.tags.length > 0) {
        for (const tag of data.tags) {
          await connection.query(
            `INSERT INTO project_tags (project_id, tag) VALUES (?, ?)`,
            [projectId, tag]
          )
        }
      }
      await connection.commit()
      connection.release()

      revalidatePath("/dashboard/faculty")
      revalidatePath("/dashboard/faculty/projects")
      revalidatePath("/projects")

      return { success: true, projectId }
    } catch (err) {
      await connection.rollback()
      connection.release()
      throw err
    }
  } catch (error) {
    console.error("Create project error:", error)
    return { success: false, message: "An error occurred while creating the project" }
  }
}

// Update project action
export async function updateProject(id: number, data: ProjectFormData) {
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

    // Check if the project belongs to the faculty
    const projects = await sql`
      SELECT id FROM projects WHERE id = ${id} AND faculty_id = ${facultyId}
    `

    if (projects.length === 0) {
      return { success: false, message: "Project not found or you don't have permission to update it" }
    }

    // Begin transaction
    const pool = getPool()
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      // Update project
      await connection.query(
        `UPDATE projects
        SET 
          title = ?,
          description = ?,
          long_description = ?,
          research_area = ?,
          positions = ?,
          start_date = ?,
          deadline = ?,
          status = ?,
          min_cgpa = ?,
          eligibility = ?,
          prerequisites = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          data.title,
          data.description,
          data.longDescription,
          data.researchArea,
          data.positions,
          data.startDate,
          data.deadline,
          data.status,
          data.minCgpa,
          data.eligibility,
          data.prerequisites,
          id,
        ]
      )

      // Delete existing tags
      await connection.query(
        `DELETE FROM project_tags WHERE project_id = ?`,
        [id]
      )

      // Add new tags
      if (data.tags && data.tags.length > 0) {
        for (const tag of data.tags) {
          await connection.query(
            `INSERT INTO project_tags (project_id, tag) VALUES (?, ?)`,
            [id, tag]
          )
        }
      }
      await connection.commit()
      connection.release()
    } catch (err) {
      await connection.rollback()
      connection.release()
      throw err
    }

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
export async function deleteProject(id: number) {
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

    // Check if the project belongs to the faculty
    const projects = await sql`
      SELECT id FROM projects WHERE id = ${id} AND faculty_id = ${facultyId}
    `

    if (projects.length === 0) {
      return { success: false, message: "Project not found or you don't have permission to delete it" }
    }

    // Check if there are any approved applications
    const approvedApplications = await sql`
      SELECT id FROM applications 
      WHERE project_id = ${id} AND status = 'approved'
    `

    if (approvedApplications.length > 0) {
      return {
        success: false,
        message: "Cannot delete project with approved applications. Change the status to 'closed' instead.",
      }
    }

    // Begin transaction
    const pool = getPool()
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      // Delete applications
      await connection.query(
        `DELETE FROM applications WHERE project_id = ?`,
        [id]
      )

      // Delete tags
      await connection.query(
        `DELETE FROM project_tags WHERE project_id = ?`,
        [id]
      )

      // Delete project
      await connection.query(
        `DELETE FROM projects WHERE id = ?`,
        [id]
      )
      await connection.commit()
      connection.release()
    } catch (err) {
      await connection.rollback()
      connection.release()
      throw err
    }

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
export async function hasStudentAppliedToProject(projectId: number) {
  try {
    const userResult = await getCurrentUser()

    if (!userResult.success) {
      return false
    }

    const user = userResult.user

    if (user.role !== "student") {
      return false
    }

    // Get student profile ID
    const studentProfiles = await sql`
      SELECT id FROM student_profiles WHERE user_id = ${user.id}
    `

    if (studentProfiles.length === 0) {
      return false
    }

    const studentId = studentProfiles[0].id

    // Check if student has applied
    const applications = await sql`
      SELECT id FROM applications 
      WHERE project_id = ${projectId} AND student_id = ${studentId}
    `

    return applications.length > 0
  } catch (error) {
    console.error("Check student application error:", error)
    return false
  }
}


