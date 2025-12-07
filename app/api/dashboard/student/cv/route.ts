import { NextResponse } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { StudentCV } from "@/lib/models"
import { getCurrentUser } from "@/app/actions/auth"
import { toObjectId, toPlainObject } from "@/lib/db"

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
    const { file_url } = body

    if (!file_url) {
      return NextResponse.json({ success: false, message: "Missing file_url" }, { status: 400 })
    }

    // Insert or update CV metadata
    const existing = await StudentCV.findOne({ user_id: userId })
    if (existing) {
      await StudentCV.findByIdAndUpdate(existing._id, {
        file_url,
        uploaded_at: new Date(),
      })
    } else {
      await StudentCV.create({
        user_id: userId,
        file_url,
        uploaded_at: new Date(),
      })
    }

    return NextResponse.json({ success: true, message: "CV saved successfully" })
  } catch (error) {
    console.error("Error saving CV:", error)
    return NextResponse.json({ success: false, message: "Failed to save CV" }, { status: 500 })
  }
}

