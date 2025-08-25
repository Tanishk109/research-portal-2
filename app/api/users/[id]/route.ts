import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { createApiResponse, handleApiError, parseJsonBody } from "@/lib/api-utils"

// GET /api/users/[id] - Get a specific user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return createApiResponse(false, "Invalid user ID")
    }

    // Get user
    const user = await sql`
      SELECT 
        u.id, u.role, u.first_name, u.last_name, u.email, u.created_at, u.updated_at
      FROM 
        users u
      WHERE 
        u.id = ${userId}
    `

    if (user.length === 0) {
      return createApiResponse(false, "User not found", undefined, "NOT_FOUND")
    }

    // Get role-specific profile
    let profile = null
    if (user[0].role === "faculty") {
      const facultyProfile = await sql`
        SELECT 
          faculty_id, department, specialization, date_of_joining, date_of_birth
        FROM 
          faculty_profiles
        WHERE 
          user_id = ${userId}
      `
      profile = facultyProfile[0]
    } else if (user[0].role === "student") {
      const studentProfile = await sql`
        SELECT 
          registration_number, department, year, cgpa
        FROM 
          student_profiles
        WHERE 
          user_id = ${userId}
      `
      profile = studentProfile[0]
    }

    return createApiResponse(true, "User retrieved successfully", {
      user: user[0],
      profile,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return createApiResponse(false, "Invalid user ID")
    }

    const body = await parseJsonBody<{
      first_name?: string
      last_name?: string
      email?: string
      // Profile fields
      department?: string
      specialization?: string
      date_of_joining?: string
      date_of_birth?: string
      year?: string
      cgpa?: number
    }>(request)

    if (!body) {
      return createApiResponse(false, "Invalid request body")
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id, role FROM users WHERE id = ${userId}
    `

    if (existingUser.length === 0) {
      return createApiResponse(false, "User not found", undefined, "NOT_FOUND")
    }

    const userRole = existingUser[0].role

    // Start a transaction
    const result = await sql.begin(async (sql) => {
      // Update user fields if provided
      if (body.first_name || body.last_name || body.email) {
        const updates = []
        const values: any[] = []

        if (body.first_name) {
          updates.push(`first_name = $${updates.length + 1}`)
          values.push(body.first_name)
        }

        if (body.last_name) {
          updates.push(`last_name = $${updates.length + 1}`)
          values.push(body.last_name)
        }

        if (body.email) {
          updates.push(`email = $${updates.length + 1}`)
          values.push(body.email)
        }

        updates.push(`updated_at = $${updates.length + 1}`)
        values.push(new Date())

        values.push(userId)

        await sql(
          `
          UPDATE users 
          SET ${updates.join(", ")} 
          WHERE id = $${values.length}
        `,
          values,
        )
      }

      // Update profile fields if provided
      if (userRole === "faculty") {
        if (body.department || body.specialization || body.date_of_joining || body.date_of_birth) {
          const updates = []
          const values: any[] = []

          if (body.department) {
            updates.push(`department = $${updates.length + 1}`)
            values.push(body.department)
          }

          if (body.specialization) {
            updates.push(`specialization = $${updates.length + 1}`)
            values.push(body.specialization)
          }

          if (body.date_of_joining) {
            updates.push(`date_of_joining = $${updates.length + 1}`)
            values.push(body.date_of_joining)
          }

          if (body.date_of_birth) {
            updates.push(`date_of_birth = $${updates.length + 1}`)
            values.push(body.date_of_birth)
          }

          updates.push(`updated_at = $${updates.length + 1}`)
          values.push(new Date())

          values.push(userId)

          await sql(
            `
            UPDATE faculty_profiles 
            SET ${updates.join(", ")} 
            WHERE user_id = $${values.length}
          `,
            values,
          )
        }
      } else if (userRole === "student") {
        if (body.department || body.year || body.cgpa) {
          const updates = []
          const values: any[] = []

          if (body.department) {
            updates.push(`department = $${updates.length + 1}`)
            values.push(body.department)
          }

          if (body.year) {
            updates.push(`year = $${updates.length + 1}`)
            values.push(body.year)
          }

          if (body.cgpa) {
            updates.push(`cgpa = $${updates.length + 1}`)
            values.push(body.cgpa)
          }

          updates.push(`updated_at = $${updates.length + 1}`)
          values.push(new Date())

          values.push(userId)

          await sql(
            `
            UPDATE student_profiles 
            SET ${updates.join(", ")} 
            WHERE user_id = $${values.length}
          `,
            values,
          )
        }
      }

      // Get updated user
      const updatedUser = await sql`
        SELECT 
          u.id, u.role, u.first_name, u.last_name, u.email, u.created_at, u.updated_at
        FROM 
          users u
        WHERE 
          u.id = ${userId}
      `

      return updatedUser[0]
    })

    return createApiResponse(true, "User updated successfully", { user: result })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return createApiResponse(false, "Invalid user ID")
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `

    if (existingUser.length === 0) {
      return createApiResponse(false, "User not found", undefined, "NOT_FOUND")
    }

    // Delete user (cascade will delete profile)
    await sql`
      DELETE FROM users WHERE id = ${userId}
    `

    return createApiResponse(true, "User deleted successfully")
  } catch (error) {
    return handleApiError(error)
  }
}
