import type { NextRequest } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { User, LoginActivity } from "@/lib/models"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { cache } from '@/lib/cache'
import { toObjectId, toPlainObject } from "@/lib/db"

// Force dynamic rendering for this route (uses request.url)
export const dynamic = 'force-dynamic'

// GET /api/users/[id]/login-activity - Get login activity for a specific user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const success = searchParams.get("success")

    // Cache key based on params
    const cacheKey = `user-login-activity:list:${params.id}:${success || 'all'}:${limit}:${offset}`
    const cacheCountKey = `user-login-activity:count:${params.id}:${success || 'all'}`
    const cachedActivities = cache.get(cacheKey)
    const cachedCount = cache.get(cacheCountKey)
    if (cachedActivities && cachedCount) {
      return createApiResponse(true, "Login activity retrieved successfully (cached)", {
        activities: cachedActivities,
        pagination: {
          total: cachedCount,
          limit,
          offset,
        },
      })
    }

    // Build query
    const query: any = { user_id: userId }
    if (success !== null) {
      query.success = success === "true"
    }

    // Execute query
    const activities = await LoginActivity.find(query)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .lean()

    // Get total count
    const total = await LoginActivity.countDocuments(query)

    const activitiesPlain = activities.map(toPlainObject)

    // Set cache for 30 seconds
    cache.set(cacheKey, activitiesPlain, 30)
    cache.set(cacheCountKey, total, 30)

    return createApiResponse(true, "Login activity retrieved successfully", {
      activities: activitiesPlain,
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
