import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { createApiResponse, handleApiError, parseJsonBody } from "@/lib/api-utils"

// POST /api/users/[id]/skills - Save skills for a user
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return createApiResponse(false, "Invalid user ID")
    }
    const body = await parseJsonBody<{ skills: string[] }>(request)
    if (!body || !Array.isArray(body.skills)) {
      return createApiResponse(false, "Missing or invalid skills array")
    }
    // Remove existing skills
    await sql`DELETE FROM student_skills WHERE user_id = ${userId}`
    // Insert new skills
    for (const skill of body.skills) {
      await sql`INSERT INTO student_skills (user_id, skill) VALUES (${userId}, ${skill})`
    }
    return createApiResponse(true, "Skills saved successfully")
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/users/[id]/skills - Get all skills for a user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return createApiResponse(false, "Invalid user ID")
    }
    const result = await sql`SELECT skill FROM student_skills WHERE user_id = ${userId}`
    const skills = result.map((row: any) => row.skill)
    return createApiResponse(true, "Skills found", skills)
  } catch (error) {
    return handleApiError(error)
  }
} 