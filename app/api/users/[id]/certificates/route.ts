import type { NextRequest } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { StudentCertificate } from "@/lib/models"
import { createApiResponse, handleApiError, parseJsonBody } from "@/lib/api-utils"
import { toObjectId, toPlainObject } from "@/lib/db"

// POST /api/users/[id]/certificates - Save certificate metadata for a user
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToMongoDB()
    const userId = toObjectId(params.id)
    if (!userId) {
      return createApiResponse(false, "Invalid user ID")
    }

    const body = await parseJsonBody<{ file_url: string; name: string }>(request)
    if (!body || !body.file_url || !body.name) {
      return createApiResponse(false, "Missing file_url or name")
    }

    // Insert certificate metadata
    await StudentCertificate.create({
      user_id: userId,
      file_url: body.file_url,
      name: body.name,
      uploaded_at: new Date(),
    })

    return createApiResponse(true, "Certificate metadata saved successfully")
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/users/[id]/certificates - Get all certificates for a user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToMongoDB()
    const userId = toObjectId(params.id)
    if (!userId) {
      return createApiResponse(false, "Invalid user ID")
    }

    const results = await StudentCertificate.find({ user_id: userId })
      .sort({ uploaded_at: -1 })
      .lean()

    const certificates = results.map((cert) => ({
      id: cert._id.toString(),
      file_url: cert.file_url,
      name: cert.name,
      uploaded_at: cert.uploaded_at,
    }))

    return createApiResponse(true, "Certificates found", certificates)
  } catch (error) {
    return handleApiError(error)
  }
}
