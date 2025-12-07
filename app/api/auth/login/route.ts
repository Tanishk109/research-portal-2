import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { User, FacultyProfile, StudentProfile, LoginActivity } from "@/lib/models"
import { comparePassword, toObjectId, toPlainObject } from "@/lib/db"
import { SignJWT } from "jose"
import { nanoid } from "nanoid"
import { JWT_SECRET, JWT_EXPIRATION, COOKIE_SETTINGS } from "@/lib/env"
import { cookies } from "next/headers"

// POST /api/auth/login - Login user
export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB()
    console.log("Login request received")
    const body = await request.json()

    const { email, password, userAgent, ipAddress } = body

    // Validate input
    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      )
    }

    console.log(`Login attempt for email: ${email}`)

    // Get user from database (case-insensitive email search)
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
    }).lean()

    if (!user) {
      console.log(`User not found: ${email}`)
      // Skip logging for non-existent users since user_id cannot be NULL
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    console.log(`User found: ${user._id}, role: ${user.role}`)

    // Verify password
    const passwordValid = await comparePassword(password, user.password_hash)

    // Record login attempt
    await LoginActivity.create({
      user_id: user._id,
      timestamp: new Date(),
      ip_address: ipAddress || "unknown",
      user_agent: userAgent || "unknown",
      success: passwordValid,
      device_type: "Web",
    })

    if (!passwordValid) {
      console.log(`Invalid password for user: ${user._id}`)
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    console.log(`Login successful for user: ${user._id}`)

    // Get user profile
    let profile = null
    if (user.role === "faculty") {
      const facultyProfile = await FacultyProfile.findOne({ user_id: user._id }).lean()
      profile = facultyProfile ? toPlainObject(facultyProfile) : null
    } else if (user.role === "student") {
      const studentProfile = await StudentProfile.findOne({ user_id: user._id }).lean()
      profile = studentProfile ? toPlainObject(studentProfile) : null
    }

    // Create JWT token
    const token = await new SignJWT({
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION)
      .sign(new TextEncoder().encode(JWT_SECRET))

    // Set cookie
    cookies().set("session", token, COOKIE_SETTINGS)

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id.toString(),
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          profile,
        },
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
