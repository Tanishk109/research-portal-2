"use server"

import { connectToMongoDB, getMongoDBInfo } from "@/lib/mongodb"
import { Application, FacultyProfile, LoginActivity, Project, StudentProfile, User } from "@/lib/models"

export async function testDatabase() {
  try {
    await connectToMongoDB()
    const info = await getMongoDBInfo()
    const collections = {
      users: await User.countDocuments(),
      faculty_profiles: await FacultyProfile.countDocuments(),
      student_profiles: await StudentProfile.countDocuments(),
      projects: await Project.countDocuments(),
      applications: await Application.countDocuments(),
      login_activity: await LoginActivity.countDocuments(),
    }

    return {
      success: true,
      message: "MongoDB connection successful",
      currentTime: info.timestamp,
      database: info,
      tables: collections,
    }
  } catch (error) {
    console.error("Database test error:", error)
    return {
      success: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
