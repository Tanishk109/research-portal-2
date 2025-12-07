import { NextResponse } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { StudentSkill } from "@/lib/models"
import { getCurrentUser } from "@/app/actions/auth"
import { toObjectId } from "@/lib/db"

// Force dynamic rendering for this route (uses cookies)
export const dynamic = 'force-dynamic'

// GET /api/dashboard/student/skills - Get skills for current user
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

    const skills = await StudentSkill.find({ user_id: userId }).lean()
    const skillList = skills.map((row: any) => row.skill)

    return NextResponse.json({ 
      success: true, 
      data: skillList 
    })
  } catch (error) {
    console.error("Error fetching skills:", error)
    return NextResponse.json({ success: false, message: "Failed to load skills" }, { status: 500 })
  }
}

// POST /api/dashboard/student/skills - Save skills for current user
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
    const { skills } = body

    if (!Array.isArray(skills)) {
      return NextResponse.json({ success: false, message: "Missing or invalid skills array" }, { status: 400 })
    }

    // Remove existing skills
    await StudentSkill.deleteMany({ user_id: userId })

    // Insert new skills
    if (skills.length > 0) {
      const skillsToInsert = skills.map((skill: string) => ({
        user_id: userId,
        skill: skill.trim(),
        added_at: new Date(),
      }))
      await StudentSkill.insertMany(skillsToInsert)
    }

    return NextResponse.json({ success: true, message: "Skills saved successfully" })
  } catch (error) {
    console.error("Error saving skills:", error)
    return NextResponse.json({ success: false, message: "Failed to save skills" }, { status: 500 })
  }
}

