import type { NextRequest } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { User, FacultyProfile, StudentProfile } from "@/lib/models"
import { createApiResponse, handleApiError, getUserIdFromRequest, getUserRoleFromRequest } from "@/lib/api-utils"
import { toObjectId, toPlainObject } from "@/lib/db"

// GET /api/auth/me - Get current user info
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB()
    const userId = getUserIdFromRequest(request)
    const userRole = getUserRoleFromRequest(request)

    if (!userId) {
      return createApiResponse(false, "User not authenticated", null, 401)
    }

    console.log(`Getting user info for ID: ${userId}, Role: ${userRole}`)

    const userIdObj = toObjectId(userId)
    if (!userIdObj) {
      return createApiResponse(false, "Invalid user ID", null, 400)
    }

    // Get user basic info
    const user = await User.findById(userIdObj).lean()

    if (!user) {
      return createApiResponse(false, "User not found", null, 404)
    }

    // Get role-specific profile
    let profile = null
    if (user.role === "faculty") {
      const facultyProfile = await FacultyProfile.findOne({ user_id: userIdObj }).lean()
      profile = facultyProfile ? toPlainObject(facultyProfile) : null
    } else if (user.role === "student") {
      const studentProfile = await StudentProfile.findOne({ user_id: userIdObj }).lean()
      profile = studentProfile ? toPlainObject(studentProfile) : null
    }

    return createApiResponse(true, "User info retrieved successfully", {
      user: {
        id: user._id.toString(),
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
