"use server"

import { toPlainObject } from "@/lib/db"
import { connectToMongoDB, getMongoDBInfo } from "@/lib/mongodb"
import { Application, FacultyProfile, LoginActivity, Project, StudentProfile, TestEntry, User } from "@/lib/models"

export async function createTestEntry(data: { title: string; description: string }) {
  try {
    if (!data.title?.trim()) {
      return { success: false, message: "Title is required" }
    }

    await connectToMongoDB()
    const entry = await TestEntry.create({
      title: data.title.trim(),
      description: data.description,
    })

    return {
      success: true,
      message: "Test entry created successfully",
      entry: toPlainObject(entry),
    }
  } catch (error) {
    console.error("Error creating test entry:", error)
    return {
      success: false,
      message: `MongoDB error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function getTestEntries() {
  try {
    await connectToMongoDB()
    const entries = await TestEntry.find().sort({ created_at: -1 }).lean()

    return {
      success: true,
      message: `Retrieved ${entries.length} entries`,
      entries: entries.map(toPlainObject),
    }
  } catch (error) {
    console.error("Error getting test entries:", error)
    return {
      success: false,
      message: `MongoDB error: ${error instanceof Error ? error.message : String(error)}`,
      entries: [],
    }
  }
}

export async function updateTestEntry(id: string, data: { title: string; description: string }) {
  try {
    if (!id) {
      return { success: false, message: "Entry ID is required" }
    }

    if (!data.title?.trim()) {
      return { success: false, message: "Title is required" }
    }

    await connectToMongoDB()
    const entry = await TestEntry.findByIdAndUpdate(
      id,
      { title: data.title.trim(), description: data.description, updated_at: new Date() },
      { new: true },
    )

    if (!entry) {
      return { success: false, message: "Entry not found or update failed" }
    }

    return {
      success: true,
      message: "Test entry updated successfully",
      entry: toPlainObject(entry),
    }
  } catch (error) {
    console.error("Error updating test entry:", error)
    return {
      success: false,
      message: `MongoDB error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function deleteTestEntry(id: string) {
  try {
    if (!id) {
      return { success: false, message: "Entry ID is required" }
    }

    await connectToMongoDB()
    const result = await TestEntry.findByIdAndDelete(id)

    if (!result) {
      return { success: false, message: "Entry not found or delete failed" }
    }

    return {
      success: true,
      message: "Test entry deleted successfully",
      id,
    }
  } catch (error) {
    console.error("Error deleting test entry:", error)
    return {
      success: false,
      message: `MongoDB error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function deleteAllTestEntries() {
  try {
    await connectToMongoDB()
    const result = await TestEntry.deleteMany({})

    return {
      success: true,
      message: `Deleted ${result.deletedCount} test entries`,
      count: result.deletedCount,
    }
  } catch (error) {
    console.error("Error deleting all test entries:", error)
    return {
      success: false,
      message: `MongoDB error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function getDatabaseStats() {
  try {
    await connectToMongoDB()
    const info = await getMongoDBInfo()

    return {
      success: true,
      stats: {
        connection: {
          database_name: info.database_name,
          host: info.host,
          port: info.port,
          ready_state: info.readyState,
          version: info.version,
        },
        counts: {
          collection_count: info.collections,
          user_count: await User.countDocuments(),
          faculty_profile_count: await FacultyProfile.countDocuments(),
          student_profile_count: await StudentProfile.countDocuments(),
          project_count: await Project.countDocuments(),
          application_count: await Application.countDocuments(),
          login_activity_count: await LoginActivity.countDocuments(),
          test_entry_count: await TestEntry.countDocuments(),
        },
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Error getting database stats:", error)
    return {
      success: false,
      message: `MongoDB error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
