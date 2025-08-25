"use server"

import { sql } from "@/lib/db"

// Type for test entry
type TestEntry = {
  id?: number
  title: string
  description: string
  created_at?: string
}

// Create a test entry
export async function createTestEntry(data: { title: string; description: string }) {
  try {
    // Validate input
    if (!data.title || !data.title.trim()) {
      return { success: false, message: "Title is required" }
    }

    // Create test entry
    const result = await sql`
      INSERT INTO test_entries (title, description)
      VALUES (${data.title}, ${data.description})
      RETURNING id, title, description, created_at
    `

    if (result && result.length > 0) {
      return {
        success: true,
        message: "Test entry created successfully",
        entry: result[0],
      }
    } else {
      return {
        success: false,
        message: "Failed to create test entry - no result returned",
      }
    }
  } catch (error) {
    console.error("Error creating test entry:", error)

    // Check if the error is due to the table not existing
    if (error instanceof Error && error.message.includes("relation") && error.message.includes("does not exist")) {
      // Try to create the table
      try {
        await sql`
          CREATE TABLE test_entries (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `

        // Try the insert again
        const result = await sql`
          INSERT INTO test_entries (title, description)
          VALUES (${data.title}, ${data.description})
          RETURNING id, title, description, created_at
        `

        if (result && result.length > 0) {
          return {
            success: true,
            message: "Test table created and entry added successfully",
            entry: result[0],
          }
        }
      } catch (tableError) {
        console.error("Error creating test_entries table:", tableError)
        return {
          success: false,
          message: `Failed to create test_entries table: ${
            tableError instanceof Error ? tableError.message : String(tableError)
          }`,
        }
      }
    }

    return {
      success: false,
      message: `Database error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Get all test entries
export async function getTestEntries() {
  try {
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'test_entries'
      )
    `

    if (!tableExists[0].exists) {
      // Create the table if it doesn't exist
      await sql`
        CREATE TABLE test_entries (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
      return {
        success: true,
        message: "Test table created successfully",
        entries: [],
      }
    }

    // Get all entries
    const entries = await sql`
      SELECT id, title, description, created_at
      FROM test_entries
      ORDER BY created_at DESC
    `

    return {
      success: true,
      message: `Retrieved ${entries.length} entries`,
      entries,
    }
  } catch (error) {
    console.error("Error getting test entries:", error)
    return {
      success: false,
      message: `Database error: ${error instanceof Error ? error.message : String(error)}`,
      entries: [],
    }
  }
}

// Update a test entry
export async function updateTestEntry(id: number, data: { title: string; description: string }) {
  try {
    // Validate input
    if (!id) {
      return { success: false, message: "Entry ID is required" }
    }

    if (!data.title || !data.title.trim()) {
      return { success: false, message: "Title is required" }
    }

    // Update entry
    const result = await sql`
      UPDATE test_entries
      SET title = ${data.title}, description = ${data.description}
      WHERE id = ${id}
      RETURNING id, title, description, created_at
    `

    if (result && result.length > 0) {
      return {
        success: true,
        message: "Test entry updated successfully",
        entry: result[0],
      }
    } else {
      return {
        success: false,
        message: "Entry not found or update failed",
      }
    }
  } catch (error) {
    console.error("Error updating test entry:", error)
    return {
      success: false,
      message: `Database error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Delete a test entry
export async function deleteTestEntry(id: number) {
  try {
    // Validate input
    if (!id) {
      return { success: false, message: "Entry ID is required" }
    }

    // Delete entry
    const result = await sql`
      DELETE FROM test_entries
      WHERE id = ${id}
      RETURNING id
    `

    if (result && result.length > 0) {
      return {
        success: true,
        message: "Test entry deleted successfully",
        id: result[0].id,
      }
    } else {
      return {
        success: false,
        message: "Entry not found or delete failed",
      }
    }
  } catch (error) {
    console.error("Error deleting test entry:", error)
    return {
      success: false,
      message: `Database error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Delete all test entries
export async function deleteAllTestEntries() {
  try {
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'test_entries'
      )
    `

    if (!tableExists[0].exists) {
      return {
        success: true,
        message: "No test entries table exists",
      }
    }

    // Delete all entries
    const result = await sql`
      DELETE FROM test_entries
      RETURNING id
    `

    return {
      success: true,
      message: `Deleted ${result.length} test entries`,
      count: result.length,
    }
  } catch (error) {
    console.error("Error deleting all test entries:", error)
    return {
      success: false,
      message: `Database error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Get database stats
export async function getDatabaseStats() {
  try {
    // Get database connection info
    const connectionInfo = await sql`
      SELECT current_database() as database_name,
             current_user as username,
             version() as version
    `

    // Get table counts
    const tableCounts = await sql`
      SELECT 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count,
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM login_activity) as login_activity_count
    `

    // Get database size
    const dbSize = await sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as database_size
    `

    return {
      success: true,
      stats: {
        connection: connectionInfo[0],
        counts: tableCounts[0],
        size: dbSize[0].database_size,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Error getting database stats:", error)
    return {
      success: false,
      message: `Database error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
