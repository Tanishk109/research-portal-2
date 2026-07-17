import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import crypto from "crypto"
import { SignJWT } from "jose"
import { nanoid } from "nanoid"
import { connectToMongoDB } from "@/lib/mongodb"
import { FacultyProfile, LoginActivity, PendingRegistration, StudentProfile, User } from "@/lib/models"
import { COOKIE_SETTINGS, JWT_EXPIRATION, JWT_SECRET } from "@/lib/env"

export const dynamic = "force-dynamic"

const PENDING_PROFILE_PREFIX = "__pending__"

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

function getPendingProfileValue(kind: "faculty" | "student", userId: unknown) {
  return `${PENDING_PROFILE_PREFIX}${kind}_${String(userId)}`
}

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB()
    const body = await request.json()
    const token = String(body.token || "").trim()

    if (!token) {
      return NextResponse.json({ success: false, message: "Verification token is required." }, { status: 400 })
    }

    const pending = await PendingRegistration.findOne({
      verification_token_hash: hashToken(token),
      expires_at: { $gt: new Date() },
    })

    if (!pending) {
      return NextResponse.json(
        {
          success: false,
          message: "This verification link is invalid or has expired. Please register again or request a new link.",
        },
        { status: 400 },
      )
    }

    const session = await User.startSession()
    let user: any = null

    try {
      await session.withTransaction(async () => {
        const existingUser = await User.findOne({ email: pending.email }).session(session)

        if (existingUser) {
          user = existingUser
          await PendingRegistration.deleteOne({ _id: pending._id }).session(session)
          return
        }

        const users = await User.create(
          [
            {
              role: pending.role,
              first_name: pending.first_name,
              last_name: pending.last_name,
              email: pending.email,
              password_hash: pending.password_hash,
              email_verified_at: new Date(),
            },
          ],
          { session },
        )

        user = users[0]

        if (pending.role === "faculty") {
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
            { session },
          )
        } else {
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
            { session },
          )
        }

        await LoginActivity.create(
          [
            {
              user_id: user._id,
              timestamp: new Date(),
              ip_address: pending.ip_address || "unknown",
              user_agent: pending.user_agent || "unknown",
              success: true,
              device_type: "Web",
            },
          ],
          { session },
        )

        await PendingRegistration.deleteOne({ _id: pending._id }).session(session)
      })
    } finally {
      await session.endSession()
    }

    if (!user) {
      throw new Error("Account verification failed.")
    }

    const tokenJwt = await new SignJWT({
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

    const redirectTo = `/dashboard/${user.role}`
    const response = NextResponse.json({
      success: true,
      message: "Email verified. Your account is ready.",
      redirectTo,
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

    response.cookies.set("session", tokenJwt, COOKIE_SETTINGS)
    return response
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Email verification failed.",
      },
      { status: 500 },
    )
  }
}
