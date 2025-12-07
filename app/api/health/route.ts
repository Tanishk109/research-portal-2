import { testDatabaseConnection, getDatabaseInfo } from "@/lib/db"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { cache } from '@/lib/cache'
import { connectToMongoDB } from "@/lib/mongodb"
import { User, FacultyProfile, StudentProfile, Project, Application, LoginActivity } from "@/lib/models"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Cache key for health check
    const cacheKey = 'health:status'
    const cached = cache.get(cacheKey)
    if (cached) {
      return NextResponse.json({
        success: true,
        message: "System is healthy (cached)",
        data: cached,
      })
    }

    console.log("Health check starting...")

    // Test database connection
    const dbConnected = await testDatabaseConnection()

    if (!dbConnected) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          data: {
            status: "unhealthy",
            database: { connected: false },
            timestamp: new Date().toISOString(),
          },
        },
        { status: 503 }
      )
    }

    // Get database information
    const dbInfo = await getDatabaseInfo()

    // Get collection counts
    const collectionCounts = await getCollectionCounts()

    const result = {
      status: "healthy",
      database: {
        connected: true,
        info: dbInfo,
        counts: collectionCounts,
      },
      timestamp: new Date().toISOString(),
    }
    cache.set(cacheKey, result, 30)
    return NextResponse.json({
      success: true,
      message: "System is healthy",
      data: result,
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

async function getCollectionCounts() {
  try {
    await connectToMongoDB()

    const counts = await Promise.all([
      User.countDocuments().then((count) => ({ users_count: count })).catch(() => ({ users_count: 0 })),
      FacultyProfile.countDocuments().then((count) => ({ faculty_count: count })).catch(() => ({ faculty_count: 0 })),
      StudentProfile.countDocuments().then((count) => ({ student_count: count })).catch(() => ({ student_count: 0 })),
      Project.countDocuments().then((count) => ({ projects_count: count })).catch(() => ({ projects_count: 0 })),
      Application.countDocuments().then((count) => ({ applications_count: count })).catch(() => ({ applications_count: 0 })),
      LoginActivity.countDocuments().then((count) => ({ login_activity_count: count })).catch(() => ({ login_activity_count: 0 })),
    ])

    return counts.reduce((acc, count) => ({ ...acc, ...count }), {})
  } catch (error) {
    console.error("Failed to get collection counts:", error)
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
