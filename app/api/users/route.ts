import type { NextRequest } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { User } from "@/lib/models"
import { createApiResponse, handleApiError, parseJsonBody, validateRequiredFields } from "@/lib/api-utils"
import { cache } from '@/lib/cache'
import { hashPassword, toPlainObject } from "@/lib/db"
import { FacultyProfile, StudentProfile } from "@/lib/models"

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB()
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

    // Build query
    const query: any = {}
    if (role) {
      query.role = role
    }

    // Get users with pagination
    const users = await User.find(query)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const total = await User.countDocuments(query)

    const usersPlain = users.map(toPlainObject)

    // Set cache for 30 seconds
    cache.set(cacheKey, usersPlain, 30)
    cache.set(cacheCountKey, total, 30)

    return createApiResponse(true, "Users retrieved successfully", {
      users: usersPlain,
      pagination: {
        total,
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
    await connectToMongoDB()
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
    const existingUser = await User.findOne({ email: body.email })

    if (existingUser) {
      return createApiResponse(false, "Email already in use")
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password)

    // Create user
    const user = await User.create({
      role: body.role as "faculty" | "student",
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      password_hash: hashedPassword,
    })

    // Create role-specific profile
    if (body.role === "faculty") {
      await FacultyProfile.create({
        user_id: user._id,
        faculty_id: body.faculty_id!,
        department: body.department!,
        specialization: body.specialization!,
        date_of_joining: new Date(body.date_of_joining!),
        date_of_birth: new Date(body.date_of_birth!),
      })
    } else if (body.role === "student") {
      await StudentProfile.create({
        user_id: user._id,
        registration_number: body.registration_number!,
        department: body.department!,
        year: body.year!,
        cgpa: body.cgpa!,
      })
    }

    return createApiResponse(true, "User created successfully", { user: toPlainObject(user) })
  } catch (error) {
    return handleApiError(error)
  }
}
