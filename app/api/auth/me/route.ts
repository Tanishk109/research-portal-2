import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { createApiResponse, handleApiError, getUserIdFromRequest, getUserRoleFromRequest } from "@/lib/api-utils"

// GET /api/auth/me - Get current user info
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    const userRole = getUserRoleFromRequest(request)

    if (!userId) {
      return createApiResponse(false, "User not authenticated", null, 401)
    }

    console.log(`Getting user info for ID: ${userId}, Role: ${userRole}`)

    // Get user basic info
    const users = await sql`
      SELECT 
        id, role, first_name, last_name, email, created_at, updated_at
      FROM 
        users 
      WHERE 
        id = ${userId}
    `

    if (users.length === 0) {
      return createApiResponse(false, "User not found", null, 404)
    }

    const user = users[0]

    // Get role-specific profile
    let profile = null
    if (user.role === "faculty") {
      const facultyProfiles = await sql`
        SELECT 
          faculty_id, department, specialization, date_of_joining, date_of_birth
        FROM 
          faculty_profiles 
        WHERE 
          user_id = ${userId}
      `
      profile = facultyProfiles[0] || null
    } else if (user.role === "student") {
      const studentProfiles = await sql`
        SELECT 
          registration_number, department, year, cgpa
        FROM 
          student_profiles 
        WHERE 
          user_id = ${userId}
      `
      profile = studentProfiles[0] || null
    }

    return createApiResponse(true, "User info retrieved successfully", {
      user: {
        id: user.id,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        profile,
      },
    })
  } catch (error) {
    console.error("Get user info error:", error)
    return handleApiError(error, "Failed to get user info")
  }
}
