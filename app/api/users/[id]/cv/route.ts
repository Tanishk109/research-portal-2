import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { createApiResponse, handleApiError, parseJsonBody } from "@/lib/api-utils"

// POST /api/users/[id]/cv - Save CV metadata for a user
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return createApiResponse(false, "Invalid user ID")
    }
    const body = await parseJsonBody<{ file_url: string }>(request)
    if (!body || !body.file_url) {
      return createApiResponse(false, "Missing file_url")
    }
    // Insert or update CV metadata
    await sql`
      INSERT INTO student_cvs (user_id, file_url, uploaded_at)
      VALUES (${userId}, ${body.file_url}, NOW())
      ON DUPLICATE KEY UPDATE file_url = VALUES(file_url), uploaded_at = VALUES(uploaded_at)
    `
    return createApiResponse(true, "CV metadata saved successfully")
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/users/[id]/cv - Get latest CV metadata for a user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return createApiResponse(false, "Invalid user ID")
    }
    const result = await sql`SELECT file_url, uploaded_at FROM student_cvs WHERE user_id = ${userId}`
    if (result.length === 0) {
      return createApiResponse(false, "CV not found", undefined, "NOT_FOUND")
    }
    return createApiResponse(true, "CV found", result[0])
  } catch (error) {
    return handleApiError(error)
  }
} 