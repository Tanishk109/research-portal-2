"use server"

import { sql } from "@/lib/db"

export async function testDatabase() {
  try {
    console.log("Testing database connection...")

    // Test basic connection
    const connectionTest = await sql`SELECT 1 as connection_test`
    if (!connectionTest || connectionTest.length === 0 || connectionTest[0].connection_test !== 1) {
      return {
        success: false,
        message: "Database connection test failed - unexpected response",
      }
    }

    // Get database time to verify connection
    const timeResult = await sql`SELECT NOW() as current_time`

    // Check if tables exist
    const tablesExist = await sql`
      SELECT 
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')) as users_table,
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'faculty_profiles')) as faculty_profiles_table,
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_profiles')) as student_profiles_table,
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'login_activity')) as login_activity_table
    `

    return {
      success: true,
      message: "Database connection successful",
      currentTime: timeResult[0].current_time,
      tables: tablesExist[0],
    }
  } catch (error) {
    console.error("Database test error:", error)
    return {
      success: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
