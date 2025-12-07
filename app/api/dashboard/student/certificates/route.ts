import { NextResponse } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { StudentCertificate } from "@/lib/models"
import { getCurrentUser } from "@/app/actions/auth"
import { toObjectId, toPlainObject } from "@/lib/db"

// Force dynamic rendering for this route (uses cookies)
export const dynamic = 'force-dynamic'

// GET /api/dashboard/student/certificates - Get certificates for current user
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

    const certificates = await StudentCertificate.find({ user_id: userId })
      .sort({ uploaded_at: -1 })
      .lean()

    return NextResponse.json({ 
      success: true, 
      data: certificates.map(toPlainObject) 
    })
  } catch (error) {
    console.error("Error fetching certificates:", error)
    return NextResponse.json({ success: false, message: "Failed to load certificates" }, { status: 500 })
  }
}

// POST /api/dashboard/student/certificates - Add certificate for current user
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
    const { file_url, name } = body

    if (!file_url || !name) {
      return NextResponse.json({ success: false, message: "Missing file_url or name" }, { status: 400 })
    }

    await StudentCertificate.create({
      user_id: userId,
      file_url,
      name,
      uploaded_at: new Date(),
    })

    return NextResponse.json({ success: true, message: "Certificate saved successfully" })
  } catch (error) {
    console.error("Error saving certificate:", error)
    return NextResponse.json({ success: false, message: "Failed to save certificate" }, { status: 500 })
  }
}

// DELETE /api/dashboard/student/certificates?id=... - Delete certificate
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const certId = searchParams.get("id")

    if (!certId) {
      return NextResponse.json({ success: false, message: "Missing certificate ID" }, { status: 400 })
    }

    const certObjectId = toObjectId(certId)
    if (!certObjectId) {
      return NextResponse.json({ success: false, message: "Invalid certificate ID" }, { status: 400 })
    }

    // Verify the certificate belongs to the user
    const certificate = await StudentCertificate.findOne({ _id: certObjectId, user_id: userId })
    if (!certificate) {
      return NextResponse.json({ success: false, message: "Certificate not found" }, { status: 404 })
    }

    await StudentCertificate.findByIdAndDelete(certObjectId)

    return NextResponse.json({ success: true, message: "Certificate deleted successfully" })
  } catch (error) {
    console.error("Error deleting certificate:", error)
    return NextResponse.json({ success: false, message: "Failed to delete certificate" }, { status: 500 })
  }
}

