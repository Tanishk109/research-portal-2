import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"
import { User, FacultyProfile, StudentProfile, LoginActivity } from "@/lib/models"
import { hashPassword } from "@/lib/db"
import { jwtVerify, SignJWT } from "jose"
import { nanoid } from "nanoid"
import { JWT_SECRET, JWT_EXPIRATION, COOKIE_SETTINGS } from "@/lib/env"
import { cookies } from "next/headers"
import { randomBytes } from "crypto"

// Force dynamic rendering for this route (uses cookies)
export const dynamic = 'force-dynamic'

type GoogleRegistrationPayload = {
  sub?: string
  email?: string
  firstName?: string
  lastName?: string
  role?: "faculty" | "student"
}

const PENDING_PROFILE_PREFIX = "__pending__"

function getPendingProfileValue(kind: "faculty" | "student", userId: unknown) {
  return `${PENDING_PROFILE_PREFIX}${kind}_${String(userId)}`
}

async function getGoogleRegistrationPayload() {
  const cookieStore = await cookies()
  const token = cookieStore.get("google_registration")?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    const googlePayload = payload as GoogleRegistrationPayload
    if (!googlePayload.sub || !googlePayload.email || (googlePayload.role !== "faculty" && googlePayload.role !== "student")) {
      return null
    }
    return googlePayload
  } catch (error) {
    console.error("Invalid Google registration token:", error)
    return null
  }
}

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB()
    console.log("Registration request received")
    const body = await request.json()
    const googleRegistration = await getGoogleRegistrationPayload()
    const isGoogleRegistration = !!googleRegistration

    const {
      role,
      firstName,
      lastName,
      email,
      password,
      // Additional fields
      userAgent,
      ipAddress,
    } = body

    const effectiveRole = isGoogleRegistration ? googleRegistration.role : role
    const effectiveEmail = isGoogleRegistration ? googleRegistration.email : email
    const effectiveFirstName = isGoogleRegistration ? googleRegistration.firstName || firstName : firstName
    const effectiveLastName = isGoogleRegistration ? googleRegistration.lastName || lastName : lastName

    console.log(`Registration attempt for: ${effectiveEmail}, role: ${effectiveRole}`)
    const normalizedEmail = String(effectiveEmail || "").toLowerCase()

    // Validate required fields
    if (!effectiveRole || !effectiveFirstName || !effectiveLastName || !effectiveEmail || (!isGoogleRegistration && !password)) {
      console.log("Missing required fields")
      return NextResponse.json(
        {
          success: false,
          message: isGoogleRegistration ? "Google account details are missing. Please restart Google sign-up." : "All required fields must be provided",
        },
        { status: 400 }
      )
    }

    if (effectiveRole !== "faculty" && effectiveRole !== "student") {
      console.log(`Invalid role: ${effectiveRole}`)
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
      email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    })

    if (existingUser) {
      console.log(`Email already exists: ${normalizedEmail}`)
      return NextResponse.json(
        {
          success: false,
          message: "Email address is already registered",
        },
        { status: 400 }
      )
    }

    console.log("Hashing password...")
    const hashedPassword = await hashPassword(isGoogleRegistration ? randomBytes(32).toString("base64url") : password)

    const session = await User.startSession()
    let user: any = null

    try {
      await session.withTransaction(async () => {
        console.log("Inserting user...")
        const users = await User.create(
          [
            {
              role: effectiveRole as "faculty" | "student",
              first_name: effectiveFirstName,
              last_name: effectiveLastName,
              email: normalizedEmail,
              password_hash: hashedPassword,
              google_id: googleRegistration?.sub,
              auth_provider: isGoogleRegistration ? "google" : "credentials",
            },
          ],
          { session }
        )
        user = users[0]

        console.log(`User created with ID: ${user._id}`)

        if (effectiveRole === "faculty") {
          console.log("Creating faculty profile...")
          await FacultyProfile.create(
            [
              {
                user_id: user._id,
                faculty_id: getPendingProfileValue("faculty", user._id),
                department: PENDING_PROFILE_PREFIX,
                specialization: PENDING_PROFILE_PREFIX,
                date_of_joining: new Date(0),
                date_of_birth: new Date(0),
              },
            ],
            { session }
          )
        } else {
          console.log("Creating student profile...")
          await StudentProfile.create(
            [
              {
                user_id: user._id,
                registration_number: getPendingProfileValue("student", user._id),
                department: PENDING_PROFILE_PREFIX,
                year: PENDING_PROFILE_PREFIX,
                cgpa: 0,
              },
            ],
            { session }
          )
        }

        console.log("Recording login activity...")
        await LoginActivity.create(
          [
            {
              user_id: user._id,
              timestamp: new Date(),
              ip_address: ipAddress || "unknown",
              user_agent: userAgent || "unknown",
              success: true,
              device_type: "Web",
            },
          ],
          { session }
        )
      })
    } finally {
      await session.endSession()
    }

    if (!user) {
      throw new Error("User creation failed")
    }

    console.log("Transaction completed successfully")

    // Create JWT token
    console.log("Creating JWT token...")
    const token = await new SignJWT({
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      profilePictureUrl: user.profile_picture_url || null,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION)
      .sign(new TextEncoder().encode(JWT_SECRET))

    // Set cookie
    console.log("Setting session cookie...")
    const cookieStore = await cookies()
    cookieStore.set("session", token, COOKIE_SETTINGS)
    cookieStore.delete("google_registration")

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
          profilePictureUrl: user.profile_picture_url || null,
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
