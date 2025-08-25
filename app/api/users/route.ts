import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { createApiResponse, handleApiError, parseJsonBody, validateRequiredFields } from "@/lib/api-utils"
import { cache } from '@/lib/cache'

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Cache key based on params
    const cacheKey = `users:list:${role || 'all'}:${limit}:${offset}`
    const cacheCountKey = `users:count:${role || 'all'}`
    const cachedUsers = cache.get(cacheKey)
    const cachedCount = cache.get(cacheCountKey)
    if (cachedUsers && cachedCount) {
      return createApiResponse(true, "Users retrieved successfully (cached)", {
        users: cachedUsers,
        pagination: {
          total: cachedCount,
          limit,
          offset,
        },
      })
    }

    // Base query
    let query = `
      SELECT 
        u.id, u.role, u.first_name, u.last_name, u.email, u.created_at, u.updated_at
      FROM 
        users u
    `

    // Add role filter if provided
    const params: any[] = []
    if (role) {
      query += ` WHERE u.role = $1`
      params.push(role)
    }

    // Add pagination
    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    // Execute query
    const users = await sql(query, params)

    // Get total count for pagination
    const countResult = await sql(
      `
      SELECT COUNT(*) as total FROM users ${role ? `WHERE role = $1` : ""}
    `,
      role ? [role] : [],
    )

    // Set cache for 30 seconds
    cache.set(cacheKey, users, 30)
    cache.set(cacheCountKey, Number.parseInt(countResult[0].total), 30)

    return createApiResponse(true, "Users retrieved successfully", {
      users,
      pagination: {
        total: Number.parseInt(countResult[0].total),
        limit,
        offset,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody<{
      role: string
      first_name: string
      last_name: string
      email: string
      password: string
      // Additional fields based on role
      faculty_id?: string
      department?: string
      specialization?: string
      date_of_joining?: string
      date_of_birth?: string
      registration_number?: string
      year?: string
      cgpa?: number
    }>(request)

    if (!body) {
      return createApiResponse(false, "Invalid request body")
    }

    // Validate required fields
    const requiredFields = ["role", "first_name", "last_name", "email", "password"]
    const missingField = validateRequiredFields(body, requiredFields)
    if (missingField) {
      return createApiResponse(false, missingField)
    }

    // Validate role-specific fields
    if (body.role === "faculty") {
      const facultyFields = ["faculty_id", "department", "specialization", "date_of_joining", "date_of_birth"]
      const missingFacultyField = validateRequiredFields(body, facultyFields)
      if (missingFacultyField) {
        return createApiResponse(false, missingFacultyField)
      }
    } else if (body.role === "student") {
      const studentFields = ["registration_number", "department", "year", "cgpa"]
      const missingStudentField = validateRequiredFields(body, studentFields)
      if (missingStudentField) {
        return createApiResponse(false, missingStudentField)
      }
    } else {
      return createApiResponse(false, "Invalid role. Must be 'faculty' or 'student'")
    }

    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${body.email}
    `

    if (existingUser.length > 0) {
      return createApiResponse(false, "Email already in use")
    }

    // Start a transaction
    const result = await sql.begin(async (sql) => {
      // Hash password
      const bcrypt = require("bcryptjs")
      const hashedPassword = await bcrypt.hash(body.password, 10)

      // Insert user
      const user = await sql`
        INSERT INTO users (
          role, first_name, last_name, email, password_hash
        ) VALUES (
          ${body.role}, ${body.first_name}, ${body.last_name}, ${body.email}, ${hashedPassword}
        ) RETURNING id, role, first_name, last_name, email, created_at, updated_at
      `

      // Insert role-specific profile
      if (body.role === "faculty") {
        await sql`
          INSERT INTO faculty_profiles (
            user_id, faculty_id, department, specialization, date_of_joining, date_of_birth
          ) VALUES (
            ${user[0].id}, ${body.faculty_id}, ${body.department}, ${body.specialization}, 
            ${body.date_of_joining}, ${body.date_of_birth}
          )
        `
      } else if (body.role === "student") {
        await sql`
          INSERT INTO student_profiles (
            user_id, registration_number, department, year, cgpa
          ) VALUES (
            ${user[0].id}, ${body.registration_number}, ${body.department}, ${body.year}, ${body.cgpa}
          )
        `
      }

      return user[0]
    })

    return createApiResponse(true, "User created successfully", { user: result })
  } catch (error) {
    return handleApiError(error)
  }
}
