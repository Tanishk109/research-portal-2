import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { cache } from '@/lib/cache'

// GET /api/login-activity - Get login activity
export async function GET(request: NextRequest) {
  try {
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

    // Base query
    let query = `
      SELECT 
        la.id, la.user_id, la.timestamp, la.ip_address, la.user_agent, 
        la.success, la.location, la.device_type,
        u.first_name, u.last_name, u.email, u.role
      FROM 
        login_activity la
      JOIN
        users u ON la.user_id = u.id
    `

    // Add filters
    const conditions = []

    if (userId) {
      conditions.push(`la.user_id = ${Number.parseInt(userId)}`)
    }

    if (success !== null) {
      conditions.push(`la.success = ${success === "true"}`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    // Add pagination
    query += ` ORDER BY la.timestamp DESC LIMIT ${limit} OFFSET ${offset}`

    // Execute query
    const activities = await sql.unsafe(query)

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM login_activity la
    `

    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(" AND ")}`
    }

    const countResult = await sql.unsafe(countQuery)

    // Set cache for 30 seconds
    cache.set(cacheKey, activities, 30)
    cache.set(cacheCountKey, Number.parseInt(countResult[0].total), 30)

    return createApiResponse(true, {
      activities,
      pagination: {
        total: Number.parseInt(countResult[0].total),
        limit,
        offset,
      },
    }, "Login activity retrieved successfully")
  } catch (error) {
    return handleApiError(error)
  }
}
