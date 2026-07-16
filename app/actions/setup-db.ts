"use server"

import { connectToMongoDB } from "@/lib/mongodb"
import "@/lib/models"

export async function checkAndSetupDatabase() {
  try {
    await connectToMongoDB()
    return { success: true, message: "MongoDB models are loaded and indexes are managed by Mongoose" }
  } catch (error) {
    console.error("MongoDB setup error:", error)
    return {
      success: false,
      message: `Failed to initialize MongoDB models: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
