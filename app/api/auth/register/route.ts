import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import crypto from "crypto"
import { connectToMongoDB } from "@/lib/mongodb"
import { PendingRegistration, User } from "@/lib/models"
import { hashPassword } from "@/lib/db"
import { createVerificationUrl, sendVerificationEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000

function normalizeEmail(email: unknown) {
  return String(email || "").trim().toLowerCase()
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function createVerificationToken() {
  const token = crypto.randomBytes(32).toString("base64url")
  const hash = crypto.createHash("sha256").update(token).digest("hex")
  return { token, hash }
}

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB()
    const body = await request.json()

    const role = body.role
    const firstName = String(body.firstName || "").trim()
    const lastName = String(body.lastName || "").trim()
    const email = normalizeEmail(body.email)
    const password = String(body.password || "")
    const userAgent = String(body.userAgent || "unknown")
    const ipAddress = String(body.ipAddress || "unknown")

    if ((role !== "faculty" && role !== "student") || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, role, email, and password are required.",
        },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters.",
        },
        { status: 400 },
      )
    }

    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${escapeRegex(email)}$`, "i") },
    }).lean()

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is already registered.",
        },
        { status: 400 },
      )
    }

    const passwordHash = await hashPassword(password)
    const { token, hash } = createVerificationToken()
    const now = new Date()

    await PendingRegistration.findOneAndUpdate(
      { email },
      {
        $set: {
          role,
          first_name: firstName,
          last_name: lastName,
          email,
          password_hash: passwordHash,
          verification_token_hash: hash,
          expires_at: new Date(now.getTime() + VERIFICATION_TOKEN_TTL_MS),
          last_sent_at: now,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
        $setOnInsert: {
          created_at: now,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    await sendVerificationEmail({
      to: email,
      name: `${firstName} ${lastName}`,
      verificationUrl: createVerificationUrl(token),
    })

    return NextResponse.json({
      success: true,
      message: "A verification link has been sent to your email. Please verify your email to finish creating your account.",
      data: { email },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed.",
      },
      { status: 500 },
    )
  }
}
