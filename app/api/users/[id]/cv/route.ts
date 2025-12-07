import type { NextRequest } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { StudentCV } from "@/lib/models"
import { createApiResponse, handleApiError, parseJsonBody } from "@/lib/api-utils"
import { toObjectId } from "@/lib/db"

// POST /api/users/[id]/cv - Save CV metadata for a user
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToMongoDB()
    const userId = toObjectId(params.id)
    if (!userId) {
      return createApiResponse(false, "Invalid user ID")
    }

    const body = await parseJsonBody<{ file_url: string }>(request)
    if (!body || !body.file_url) {
      return createApiResponse(false, "Missing file_url")
    }

    // Insert or update CV metadata
    const existing = await StudentCV.findOne({ user_id: userId })
    if (existing) {
      await StudentCV.findByIdAndUpdate(existing._id, {
        file_url: body.file_url,
        uploaded_at: new Date(),
      })
    } else {
      await StudentCV.create({
        user_id: userId,
        file_url: body.file_url,
        uploaded_at: new Date(),
      })
    }

    return createApiResponse(true, "CV metadata saved successfully")
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/users/[id]/cv - Get latest CV metadata for a user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToMongoDB()
    const userId = toObjectId(params.id)
    if (!userId) {
      return createApiResponse(false, "Invalid user ID")
    }

    const result = await StudentCV.findOne({ user_id: userId }).lean()
    if (!result) {
      return createApiResponse(false, "CV not found", undefined, "NOT_FOUND")
    }

    return createApiResponse(true, "CV found", {
      file_url: result.file_url,
      uploaded_at: result.uploaded_at,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
