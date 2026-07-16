import type { NextRequest } from "next/server"
import { testDatabaseConnection, getDatabaseInfo } from "@/lib/db"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { cache } from '@/lib/cache'
import { Application, FacultyProfile, LoginActivity, Project, StudentProfile, User } from "@/lib/models"

// GET /api/db-test - Test database connection
export async function GET() {
  try {
    // Cache key for db-test
    const cacheKey = 'db-test:status'
    const cached = cache.get(cacheKey)
    if (cached) {
      return createApiResponse(true, "Database connection successful (cached)", cached)
    }

    console.log("Testing MongoDB database connection...")

    // Test basic connection
    const isConnected = await testDatabaseConnection()

    if (!isConnected) {
      return createApiResponse(false, "Database connection failed", null, 500)
    }

    // Get database info
    const dbInfo = await getDatabaseInfo()

    const collectionChecks = await checkCollections()

    console.log("MongoDB database connection successful:", dbInfo)

    const result = {
      info: dbInfo,
      status: "connected",
      collections: collectionChecks,
      timestamp: new Date().toISOString(),
    }
    cache.set(cacheKey, result, 30)
    return createApiResponse(true, "Database connection successful", result)
  } catch (error) {
    console.error("MongoDB database connection failed:", error)
    return handleApiError(error, "Database connection failed")
  }
}

// POST /api/db-test - Test specific MongoDB collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const collection = body.collection || body.table

    if (!collection) {
      return createApiResponse(false, "Collection name is required", null, 400)
    }

    console.log(`Testing collection: ${collection}`)

    const model = getModelForCollection(collection)

    if (!model) {
      return createApiResponse(false, `Collection '${collection}' does not exist`, {
        collection,
        exists: false,
        count: 0,
      })
    }

    const count = await model.countDocuments()

    console.log(`Collection ${collection} exists with ${count} documents`)

    return createApiResponse(true, `Collection ${collection} is accessible`, {
      collection,
      count,
      exists: true,
    })
  } catch (error) {
    console.error(`Collection test failed:`, error)
    return handleApiError(error, "Collection test failed")
  }
}

async function checkCollections() {
  const requiredCollections = ["users", "faculty_profiles", "student_profiles", "projects", "applications", "login_activity"]

  const collectionStatus: Record<string, any> = {}

  for (const collection of requiredCollections) {
    try {
      const model = getModelForCollection(collection)
      if (model) {
        const count = await model.countDocuments()
        collectionStatus[collection] = {
          exists: true,
          count,
          status: "ok",
        }
      } else {
        collectionStatus[collection] = {
          exists: false,
          count: 0,
          status: "missing",
        }
      }
    } catch (error) {
      collectionStatus[collection] = {
        exists: false,
        count: 0,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  return collectionStatus
}

function getModelForCollection(collection: string) {
  const models: Record<string, { countDocuments: () => Promise<number> }> = {
    users: User,
    faculty_profiles: FacultyProfile,
    student_profiles: StudentProfile,
    projects: Project,
    applications: Application,
    login_activity: LoginActivity,
  }

  return models[collection]
}
