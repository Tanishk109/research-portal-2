import { testDatabaseConnection, getDatabaseInfo } from "@/lib/db"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { cache } from '@/lib/cache'

export async function GET() {
  try {
    // Cache key for health check
    const cacheKey = 'health:status'
    const cached = cache.get(cacheKey)
    if (cached) {
      return createApiResponse(true, "System is healthy (cached)", cached)
    }

    console.log("Health check starting...")

    // Test database connection
    const dbConnected = await testDatabaseConnection()

    if (!dbConnected) {
      return createApiResponse(
        false,
        "Database connection failed",
        {
          status: "unhealthy",
          database: { connected: false },
          timestamp: new Date().toISOString(),
        },
        503,
      )
    }

    // Get database information
    const dbInfo = await getDatabaseInfo()

    // Get table counts
    const tableCounts = await getTableCounts()

    const result = {
      status: "healthy",
      database: {
        connected: true,
        info: dbInfo,
        counts: tableCounts,
      },
      timestamp: new Date().toISOString(),
    }
    cache.set(cacheKey, result, 30)
    return createApiResponse(true, "System is healthy", result)
  } catch (error) {
    console.error("Health check failed:", error)
    return handleApiError(error, "Health check failed")
  }
}

async function getTableCounts() {
  try {
    const { sql } = await import("@/lib/db")

    const counts = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`
        .then((r) => ({ users_count: Number(r[0].count) }))
        .catch(() => ({ users_count: 0 })),
      sql`SELECT COUNT(*) as count FROM faculty_profiles`
        .then((r) => ({ faculty_count: Number(r[0].count) }))
        .catch(() => ({ faculty_count: 0 })),
      sql`SELECT COUNT(*) as count FROM student_profiles`
        .then((r) => ({ student_count: Number(r[0].count) }))
        .catch(() => ({ student_count: 0 })),
      sql`SELECT COUNT(*) as count FROM projects`
        .then((r) => ({ projects_count: Number(r[0].count) }))
        .catch(() => ({ projects_count: 0 })),
      sql`SELECT COUNT(*) as count FROM applications`
        .then((r) => ({ applications_count: Number(r[0].count) }))
        .catch(() => ({ applications_count: 0 })),
      sql`SELECT COUNT(*) as count FROM login_activity`
        .then((r) => ({ login_activity_count: Number(r[0].count) }))
        .catch(() => ({ login_activity_count: 0 })),
    ])

    return counts.reduce((acc, count) => ({ ...acc, ...count }), {})
  } catch (error) {
    console.error("Failed to get table counts:", error)
    return {
      users_count: 0,
      faculty_count: 0,
      student_count: 0,
      projects_count: 0,
      applications_count: 0,
      login_activity_count: 0,
    }
  }
}
