import { NextResponse } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { StudentCV } from "@/lib/models"
import { getCurrentUser } from "@/app/actions/auth"
import { toObjectId, toPlainObject } from "@/lib/db"

// Force dynamic rendering for this route (uses cookies)
export const dynamic = 'force-dynamic'

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

// GET /api/dashboard/student/cv - Get CV for current user
export async function GET() {
  try {
    await connectToMongoDB()
    const userResult = await getCurrentUser()
    
    if (!userResult.success || !userResult.user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const userId = toObjectId(userResult.user.id)
    if (!userId) {
      return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 })
    }

    const cv = await StudentCV.findOne({ user_id: userId }).lean()
    
    if (!cv) {
      return NextResponse.json({ success: true, data: null })
    }

    return NextResponse.json({ 
      success: true, 
      data: toPlainObject(cv) 
    })
  } catch (error) {
    console.error("Error fetching CV:", error)
    return NextResponse.json({ success: false, message: "Failed to load CV" }, { status: 500 })
  }
}

// POST /api/dashboard/student/cv - Save CV for current user
export async function POST(request: Request) {
  try {
    await connectToMongoDB()
    const userResult = await getCurrentUser()
    
    if (!userResult.success || !userResult.user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const userId = toObjectId(userResult.user.id)
    if (!userId) {
      return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 })
    }

    const body = await request.json()
    const { file_url, file_name } = body

    if (!file_url) {
      return NextResponse.json({ success: false, message: "Missing file_url" }, { status: 400 })
    }

    if (!isPdfDataUrl(file_url)) {
      return NextResponse.json({ success: false, message: "Please upload your resume as a PDF file." }, { status: 400 })
    }

    const resumeFileName = sanitizeResumeFileName(file_name)

    const uploadedAt = new Date()

    // Insert or update resume metadata
    const existing = await StudentCV.findOne({ user_id: userId })
    if (existing) {
      await StudentCV.findByIdAndUpdate(existing._id, {
        file_url,
        file_name: resumeFileName,
        mime_type: "application/pdf",
        uploaded_at: uploadedAt,
      })
    } else {
      await StudentCV.create({
        user_id: userId,
        file_url,
        file_name: resumeFileName,
        mime_type: "application/pdf",
        uploaded_at: uploadedAt,
      })
    }

    const savedResume = await StudentCV.findOne({ user_id: userId }).lean()

    return NextResponse.json({
      success: true,
      message: "Resume saved successfully",
      data: savedResume ? toPlainObject(savedResume) : null,
    })
  } catch (error) {
    console.error("Error saving CV:", error)
    return NextResponse.json({ success: false, message: "Failed to save resume" }, { status: 500 })
  }
}

// DELETE /api/dashboard/student/cv - Delete CV for current user
export async function DELETE() {
  try {
    await connectToMongoDB()
    const userResult = await getCurrentUser()

    if (!userResult.success || !userResult.user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const userId = toObjectId(userResult.user.id)
    if (!userId) {
      return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 })
    }

    await StudentCV.deleteOne({ user_id: userId })

    return NextResponse.json({ success: true, message: "Resume removed successfully" })
  } catch (error) {
    console.error("Error deleting CV:", error)
    return NextResponse.json({ success: false, message: "Failed to remove resume" }, { status: 500 })
  }
}
