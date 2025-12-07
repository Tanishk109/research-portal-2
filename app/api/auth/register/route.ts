import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { User, FacultyProfile, StudentProfile, LoginActivity } from "@/lib/models"
import { hashPassword, toPlainObject } from "@/lib/db"
import { SignJWT } from "jose"
import { nanoid } from "nanoid"
import { JWT_SECRET, JWT_EXPIRATION, COOKIE_SETTINGS } from "@/lib/env"
import { cookies } from "next/headers"

// Force dynamic rendering for this route (uses cookies)
export const dynamic = 'force-dynamic'

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB()
    console.log("Registration request received")
    const body = await request.json()

    const {
      role,
      firstName,
      lastName,
      email,
      password,
      // Faculty specific fields
      facultyId,
      department,
      specialization,
      dateOfJoining,
      dateOfBirth,
      // Student specific fields
      registrationNumber,
      year,
      cgpa,
      // Additional fields
      userAgent,
      ipAddress,
    } = body

    console.log(`Registration attempt for: ${email}, role: ${role}`)

    // Validate required fields
    if (!role || !firstName || !lastName || !email || !password) {
      console.log("Missing required fields")
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be provided",
        },
        { status: 400 }
      )
    }

    // Validate role-specific fields
    if (role === "faculty") {
      if (!facultyId || !department || !specialization || !dateOfJoining || !dateOfBirth) {
        console.log("Missing faculty-specific fields")
        return NextResponse.json(
          {
            success: false,
            message: "All faculty fields are required",
          },
          { status: 400 }
        )
      }
    } else if (role === "student") {
      if (!registrationNumber || !department || !year || !cgpa) {
        console.log("Missing student-specific fields")
        return NextResponse.json(
          {
            success: false,
            message: "All student fields are required",
          },
          { status: 400 }
        )
      }
    } else {
      console.log(`Invalid role: ${role}`)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role specified",
        },
        { status: 400 }
      )
    }

    // Check if email already exists (case-insensitive)
    console.log("Checking if email already exists...")
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    })

    if (existingUser) {
      console.log(`Email already exists: ${email}`)
      return NextResponse.json(
        {
          success: false,
          message: "Email address is already registered",
        },
        { status: 400 }
      )
    }

    // Hash password
    console.log("Hashing password...")
    const hashedPassword = await hashPassword(password)

    // Create user
    console.log("Inserting user...")
    const user = await User.create({
      role: role as "faculty" | "student",
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(), // Store email in lowercase for consistency
      password_hash: hashedPassword,
    })

    console.log(`User created with ID: ${user._id}`)

    // Create role-specific profile
    if (role === "faculty") {
      console.log("Creating faculty profile...")
      await FacultyProfile.create({
        user_id: user._id,
        faculty_id: facultyId,
        department,
        specialization,
        date_of_joining: new Date(dateOfJoining),
        date_of_birth: new Date(dateOfBirth),
      })
    } else if (role === "student") {
      console.log("Creating student profile...")
      await StudentProfile.create({
        user_id: user._id,
        registration_number: registrationNumber,
        department,
        year,
        cgpa: Number.parseFloat(cgpa),
      })
    }

    // Record login activity
    console.log("Recording login activity...")
    await LoginActivity.create({
      user_id: user._id,
      timestamp: new Date(),
      ip_address: ipAddress || "unknown",
      user_agent: userAgent || "unknown",
      success: true,
      device_type: "Web",
    })

    console.log("Transaction completed successfully")

    // Create JWT token
    console.log("Creating JWT token...")
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
    console.log("Setting session cookie...")
    cookies().set("session", token, COOKIE_SETTINGS)

    console.log(`Registration successful for user: ${user._id}`)

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user._id.toString(),
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
        },
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
