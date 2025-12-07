import type { NextRequest } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { StudentSkill } from "@/lib/models"
import { createApiResponse, handleApiError, parseJsonBody } from "@/lib/api-utils"
import { toObjectId } from "@/lib/db"

// POST /api/users/[id]/skills - Save skills for a user
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToMongoDB()
    const userId = toObjectId(params.id)
    if (!userId) {
      return createApiResponse(false, "Invalid user ID")
    }

    const body = await parseJsonBody<{ skills: string[] }>(request)
    if (!body || !Array.isArray(body.skills)) {
      return createApiResponse(false, "Missing or invalid skills array")
    }

    // Remove existing skills
    await StudentSkill.deleteMany({ user_id: userId })

    // Insert new skills
    if (body.skills.length > 0) {
      const skillsToInsert = body.skills.map((skill) => ({
        user_id: userId,
        skill: skill.trim(),
        added_at: new Date(),
      }))
      await StudentSkill.insertMany(skillsToInsert)
    }

    return createApiResponse(true, "Skills saved successfully")
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/users/[id]/skills - Get all skills for a user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToMongoDB()
    const userId = toObjectId(params.id)
    if (!userId) {
      return createApiResponse(false, "Invalid user ID")
    }

    const results = await StudentSkill.find({ user_id: userId }).lean()
    const skills = results.map((row) => row.skill)

    return createApiResponse(true, "Skills found", skills)
  } catch (error) {
    return handleApiError(error)
  }
}
