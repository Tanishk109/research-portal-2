import type { NextRequest } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { StudentCV } from "@/lib/models"
import { createApiResponse, handleApiError, parseJsonBody } from "@/lib/api-utils"
import { toObjectId } from "@/lib/db"

function isPdfDataUrl(fileUrl: unknown) {
  return typeof fileUrl === "string" && /^data:application\/pdf(?:;[^,]*)?,/i.test(fileUrl)
}

function sanitizeResumeFileName(fileName: unknown) {
  if (typeof fileName !== "string") {
    return "Resume.pdf"
  }

  const trimmed = fileName.trim().replace(/[\\/:*?"<>|]/g, "")
  return trimmed ? trimmed.slice(0, 255) : "Resume.pdf"
}

// POST /api/users/[id]/cv - Save resume metadata for a user
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToMongoDB()
    const { id } = await params
    const userId = toObjectId(id)
    if (!userId) {
      return createApiResponse(false, "Invalid user ID")
    }

    const body = await parseJsonBody<{ file_url: string; file_name?: string }>(request)
    if (!body || !body.file_url) {
      return createApiResponse(false, "Missing file_url")
    }

    if (!isPdfDataUrl(body.file_url)) {
      return createApiResponse(false, "Please upload your resume as a PDF file.")
    }

    const resumeFileName = sanitizeResumeFileName(body.file_name)

    // Insert or update resume metadata
    const existing = await StudentCV.findOne({ user_id: userId })
    if (existing) {
      await StudentCV.findByIdAndUpdate(existing._id, {
        file_url: body.file_url,
        file_name: resumeFileName,
        mime_type: "application/pdf",
        uploaded_at: new Date(),
      })
    } else {
      await StudentCV.create({
        user_id: userId,
        file_url: body.file_url,
        file_name: resumeFileName,
        mime_type: "application/pdf",
        uploaded_at: new Date(),
      })
    }

    return createApiResponse(true, "Resume metadata saved successfully")
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/users/[id]/cv - Get latest resume metadata for a user
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToMongoDB()
    const { id } = await params
    const userId = toObjectId(id)
    if (!userId) {
      return createApiResponse(false, "Invalid user ID")
    }

    const result = await StudentCV.findOne({ user_id: userId }).lean()
    if (!result) {
      return createApiResponse(false, "CV not found", undefined, "NOT_FOUND")
    }

    return createApiResponse(true, "CV found", {
      file_url: result.file_url,
      file_name: result.file_name || "Resume.pdf",
      mime_type: result.mime_type || "application/pdf",
      uploaded_at: result.uploaded_at?.toISOString?.() || result.uploaded_at,
    })
  } catch (error) {
    return handleApiError(error)
  }
} 
