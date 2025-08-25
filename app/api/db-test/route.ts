import type { NextRequest } from "next/server"
import { sql, testDatabaseConnection, getDatabaseInfo } from "@/lib/db"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { cache } from '@/lib/cache'

// GET /api/db-test - Test database connection
export async function GET() {
  try {
    // Cache key for db-test
    const cacheKey = 'db-test:status'
    const cached = cache.get(cacheKey)
    if (cached) {
      return createApiResponse(true, "Database connection successful (cached)", cached)
    }

    console.log("Testing MySQL database connection...")

    // Test basic connection
    const isConnected = await testDatabaseConnection()

    if (!isConnected) {
      return createApiResponse(false, "Database connection failed", null, 500)
    }

    // Get database info
    const dbInfo = await getDatabaseInfo()

    // Test table existence
    const tableChecks = await checkTables()

    console.log("MySQL database connection successful:", dbInfo)

    const result = {
      info: dbInfo,
      status: "connected",
      tables: tableChecks,
      timestamp: new Date().toISOString(),
    }
    cache.set(cacheKey, result, 30)
    return createApiResponse(true, "Database connection successful", result)
  } catch (error) {
    console.error("MySQL database connection failed:", error)
    return handleApiError(error, "Database connection failed")
  }
}

// POST /api/db-test - Test specific table
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { table } = body

    if (!table) {
      return createApiResponse(false, "Table name is required", null, 400)
    }

    console.log(`Testing table: ${table}`)

    // Check if table exists first
    const tableExists = await sql`
      SELECT COUNT(*) as table_exists 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = ?
    `

    if (tableExists[0].table_exists === 0) {
      return createApiResponse(false, `Table '${table}' does not exist`, {
        table,
        exists: false,
        count: 0,
      })
    }

    // Get record count
    const result = await sql.unsafe(`SELECT COUNT(*) as count FROM ${table}`)
    const count = Number(result[0].count)

    console.log(`Table ${table} exists with ${count} records`)

    return createApiResponse(true, `Table ${table} is accessible`, {
      table,
      count,
      exists: true,
    })
  } catch (error) {
    console.error(`Table test failed:`, error)

    // Check if it's a table not found error
    if (
      error instanceof Error &&
      (error.message.includes("doesn't exist") ||
        (error.message.includes("Table") && error.message.includes("doesn't exist")))
    ) {
      return createApiResponse(false, `Table does not exist`, {
        exists: false,
      })
    }

    return handleApiError(error, "Table test failed")
  }
}

// Helper function to check all required tables
async function checkTables() {
  const requiredTables = ["users", "faculty_profiles", "student_profiles", "projects", "applications", "login_activity"]

  const tableStatus: Record<string, any> = {}

  for (const table of requiredTables) {
    try {
      // Check if table exists
      const exists = await sql`
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = ?
      `

      if (exists[0].table_exists > 0) {
        // Get record count
        const count = await sql.unsafe(`SELECT COUNT(*) as count FROM ${table}`)
        tableStatus[table] = {
          exists: true,
          count: Number(count[0].count),
          status: "ok",
        }
      } else {
        tableStatus[table] = {
          exists: false,
          count: 0,
          status: "missing",
        }
      }
    } catch (error) {
      tableStatus[table] = {
        exists: false,
        count: 0,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  return tableStatus
}
