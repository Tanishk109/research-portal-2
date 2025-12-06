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
    // Check if CV exists first
    const existing = await sql`SELECT id FROM student_cvs WHERE user_id = ${userId} LIMIT 1`
    if (existing.length > 0) {
      await sql`UPDATE student_cvs SET file_url = ${body.file_url}, uploaded_at = CURRENT_TIMESTAMP WHERE user_id = ${userId}`
    } else {
      await sql`INSERT INTO student_cvs (user_id, file_url, uploaded_at) VALUES (${userId}, ${body.file_url}, CURRENT_TIMESTAMP)`
    }
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