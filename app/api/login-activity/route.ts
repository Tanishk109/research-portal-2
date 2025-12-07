import type { NextRequest } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { LoginActivity, User } from "@/lib/models"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { cache } from '@/lib/cache'
import { toObjectId, toPlainObject } from "@/lib/db"

// Force dynamic rendering for this route (uses request.url)
export const dynamic = 'force-dynamic'

// GET /api/login-activity - Get login activity
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB()
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const success = searchParams.get("success")
    
    // Cache key based on params
    const cacheKey = `login-activity:list:${userId || 'all'}:${success || 'all'}:${limit}:${offset}`
    const cacheCountKey = `login-activity:count:${userId || 'all'}:${success || 'all'}`
    const cachedActivities = cache.get(cacheKey)
    const cachedCount = cache.get(cacheCountKey)
    if (cachedActivities && cachedCount) {
      return createApiResponse(true, {
        activities: cachedActivities,
        pagination: {
          total: cachedCount,
          limit,
          offset,
        },
      }, "Login activity retrieved successfully (cached)")
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]

    // Add filters
    const matchStage: any = {}
    if (userId) {
      const userIdObj = toObjectId(userId)
      if (userIdObj) {
        matchStage.user_id = userIdObj
      }
    }
    if (success !== null) {
      matchStage.success = success === "true"
    }
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage })
    }

    // Add projection
    pipeline.push({
      $project: {
        id: { $toString: "$_id" },
        user_id: { $toString: "$user_id" },
        timestamp: 1,
        ip_address: 1,
        user_agent: 1,
        success: 1,
        location: 1,
        device_type: 1,
        first_name: "$user.first_name",
        last_name: "$user.last_name",
        email: "$user.email",
        role: "$user.role",
      },
    })

    // Add sorting and pagination
    pipeline.push({ $sort: { timestamp: -1 } })
    pipeline.push({ $skip: offset })
    pipeline.push({ $limit: limit })

    // Execute query
    const activities = await LoginActivity.aggregate(pipeline)

    // Get total count
    const countPipeline: any[] = []
    if (Object.keys(matchStage).length > 0) {
      countPipeline.push({ $match: matchStage })
    }
    countPipeline.push({ $count: "total" })
    const countResult = await LoginActivity.aggregate(countPipeline)
    const total = countResult.length > 0 ? countResult[0].total : 0

    const activitiesPlain = activities.map(toPlainObject)

    // Set cache for 30 seconds
    cache.set(cacheKey, activitiesPlain, 30)
    cache.set(cacheCountKey, total, 30)

    return createApiResponse(true, {
      activities: activitiesPlain,
      pagination: {
        total,
        limit,
        offset,
      },
    }, "Login activity retrieved successfully")
  } catch (error) {
    return handleApiError(error)
  }
}
