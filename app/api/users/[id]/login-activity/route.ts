import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { cache } from '@/lib/cache'

// GET /api/users/[id]/login-activity - Get login activity for a specific user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const success = searchParams.get("success")

    // Cache key based on params
    const cacheKey = `user-login-activity:list:${userId}:${success || 'all'}:${limit}:${offset}`
    const cacheCountKey = `user-login-activity:count:${userId}:${success || 'all'}`
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
    let query = `
      SELECT 
        id, timestamp, ip_address, user_agent, success, location, device_type
      FROM 
        login_activity
      WHERE 
        user_id = $1
    `

    const params: any[] = [userId]

    if (success !== null) {
      query += ` AND success = $2`
      params.push(success === "true")
    }

    query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    // Execute query
    const activities = await sql(query, params)

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM login_activity 
      WHERE user_id = $1 ${success !== null ? "AND success = $2" : ""}
    `

    const countParams = [userId]
    if (success !== null) {
      countParams.push(success === "true")
    }

    const countResult = await sql(countQuery, countParams)

    // Set cache for 30 seconds
    cache.set(cacheKey, activities, 30)
    cache.set(cacheCountKey, Number.parseInt(countResult[0].total), 30)

    return createApiResponse(true, "Login activity retrieved successfully", {
      activities,
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
