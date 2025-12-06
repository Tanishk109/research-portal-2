import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { createApiResponse, handleApiError, parseJsonBody } from "@/lib/api-utils"

// POST /api/users/[id]/certificates - Save certificate metadata for a user
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return createApiResponse(false, "Invalid user ID")
    }
    const body = await parseJsonBody<{ file_url: string, name: string }>(request)
    if (!body || !body.file_url || !body.name) {
      return createApiResponse(false, "Missing file_url or name")
    }
    // Insert certificate metadata
    await sql`
      INSERT INTO student_certificates (user_id, file_url, name, uploaded_at)
      VALUES (${userId}, ${body.file_url}, ${body.name}, CURRENT_TIMESTAMP)
    `
    return createApiResponse(true, "Certificate metadata saved successfully")
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/users/[id]/certificates - Get all certificates for a user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return createApiResponse(false, "Invalid user ID")
    }
    const result = await sql`SELECT id, file_url, name, uploaded_at FROM student_certificates WHERE user_id = ${userId} ORDER BY uploaded_at DESC`
    return createApiResponse(true, "Certificates found", result)
  } catch (error) {
    return handleApiError(error)
  }
} 