"use server"

import { connectToMongoDB } from "@/lib/mongodb"
import { LoginActivity } from "@/lib/models"
import { getCurrentUser } from "./auth"
import { toObjectId, toPlainObject } from "@/lib/db"

export async function getLoginActivity(page = 1, limit = 10) {
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10))
  const safePage = Math.max(1, Number(page) || 1)

  try {
    await connectToMongoDB()
    const currentUserResult = await getCurrentUser()

    if (!currentUserResult.success || !currentUserResult.user) {
      return { success: false, message: "Not authenticated" }
    }

    const currentUser = currentUserResult.user
    const userId = toObjectId(currentUser.id)
    if (!userId) {
      return { success: false, message: "Invalid user ID" }
    }

    const offset = (safePage - 1) * safeLimit

    // Get activities with pagination
    const activities = await LoginActivity.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(safeLimit)
      .lean()

    // Get total count
    const totalCount = await LoginActivity.countDocuments({ user_id: userId })

    return {
      success: true,
      activities: activities.map(toPlainObject),
      totalCount,
      totalPages: Math.ceil(totalCount / safeLimit),
      currentPage: safePage,
    }
  } catch (error) {
    console.error("Error fetching login activity:", error)
    return { success: false, message: "Failed to fetch login activity" }
  }
}

export async function getRecentLoginActivity(limit = 5) {
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 5))

  try {
    await connectToMongoDB()
    const currentUserResult = await getCurrentUser()

    if (!currentUserResult.success || !currentUserResult.user) {
      return { success: false, message: "Not authenticated" }
    }

    const currentUser = currentUserResult.user
    const userId = toObjectId(currentUser.id)
    if (!userId) {
      return { success: false, message: "Invalid user ID" }
    }

    // Get recent activities
    const activities = await LoginActivity.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(safeLimit)
      .lean()

    return {
      success: true,
      activities: activities.map(toPlainObject),
    }
  } catch (error) {
    console.error("Error fetching recent login activity:", error)
    return { success: false, message: "Failed to fetch recent login activity" }
  }
}
