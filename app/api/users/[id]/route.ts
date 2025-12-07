import type { NextRequest } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { User, FacultyProfile, StudentProfile } from "@/lib/models"
import { createApiResponse, handleApiError, parseJsonBody } from "@/lib/api-utils"
import { toObjectId, toPlainObject } from "@/lib/db"

// GET /api/users/[id] - Get a specific user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToMongoDB()
    const userId = toObjectId(params.id)

    if (!userId) {
      return createApiResponse(false, "Invalid user ID")
    }

    // Get user
    const user = await User.findById(userId).lean()

    if (!user) {
      return createApiResponse(false, "User not found", undefined, "NOT_FOUND")
    }

    // Get role-specific profile
    let profile = null
    if (user.role === "faculty") {
      const facultyProfile = await FacultyProfile.findOne({ user_id: userId }).lean()
      profile = facultyProfile ? toPlainObject(facultyProfile) : null
    } else if (user.role === "student") {
      const studentProfile = await StudentProfile.findOne({ user_id: userId }).lean()
      profile = studentProfile ? toPlainObject(studentProfile) : null
    }

    return createApiResponse(true, "User retrieved successfully", {
      user: toPlainObject(user),
      profile,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToMongoDB()
    const userId = toObjectId(params.id)

    if (!userId) {
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
    const existingUser = await User.findById(userId).lean()

    if (!existingUser) {
      return createApiResponse(false, "User not found", undefined, "NOT_FOUND")
    }

    const userRole = existingUser.role

    // Update user fields if provided
    if (body.first_name || body.last_name || body.email) {
      const updateData: any = {}
      if (body.first_name) updateData.first_name = body.first_name
      if (body.last_name) updateData.last_name = body.last_name
      if (body.email) updateData.email = body.email
      updateData.updated_at = new Date()

      await User.findByIdAndUpdate(userId, updateData)
    }

    // Update profile fields if provided
    if (userRole === "faculty") {
      if (body.department || body.specialization || body.date_of_joining || body.date_of_birth) {
        const updateData: any = {}
        if (body.department) updateData.department = body.department
        if (body.specialization) updateData.specialization = body.specialization
        if (body.date_of_joining) updateData.date_of_joining = new Date(body.date_of_joining)
        if (body.date_of_birth) updateData.date_of_birth = new Date(body.date_of_birth)
        updateData.updated_at = new Date()

        await FacultyProfile.findOneAndUpdate({ user_id: userId }, updateData, { upsert: false })
      }
    } else if (userRole === "student") {
      if (body.department || body.year || body.cgpa) {
        const updateData: any = {}
        if (body.department) updateData.department = body.department
        if (body.year) updateData.year = body.year
        if (body.cgpa) updateData.cgpa = body.cgpa
        updateData.updated_at = new Date()

        await StudentProfile.findOneAndUpdate({ user_id: userId }, updateData, { upsert: false })
      }
    }

    // Get updated user
    const updatedUser = await User.findById(userId).lean()

    return createApiResponse(true, "User updated successfully", { user: toPlainObject(updatedUser!) })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToMongoDB()
    const userId = toObjectId(params.id)

    if (!userId) {
      return createApiResponse(false, "Invalid user ID")
    }

    // Check if user exists
    const existingUser = await User.findById(userId)

    if (!existingUser) {
      return createApiResponse(false, "User not found", undefined, "NOT_FOUND")
    }

    // Delete user (MongoDB will handle related documents if configured)
    await User.findByIdAndDelete(userId)
    // Also delete related profiles
    await FacultyProfile.deleteMany({ user_id: userId })
    await StudentProfile.deleteMany({ user_id: userId })

    return createApiResponse(true, "User deleted successfully")
  } catch (error) {
    return handleApiError(error)
  }
}
