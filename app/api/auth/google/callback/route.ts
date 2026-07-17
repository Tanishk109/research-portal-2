import { randomBytes } from "crypto"
import { nanoid } from "nanoid"
import { SignJWT } from "jose"
import { NextRequest, NextResponse } from "next/server"

import { hashPassword } from "@/lib/db"
import { connectToMongoDB } from "@/lib/mongodb"
import { FacultyProfile, LoginActivity, StudentProfile, User } from "@/lib/models"
import {
  COOKIE_SETTINGS,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  IS_GOOGLE_AUTH_CONFIGURED,
  JWT_EXPIRATION,
  JWT_SECRET,
  NEXT_PUBLIC_APP_URL,
} from "@/lib/env"

export const dynamic = "force-dynamic"

type GoogleState = {
  nonce: string
  role: "student" | "faculty"
  redirect?: string
}

type GoogleUser = {
  sub: string
  email: string
  email_verified?: boolean
  given_name?: string
  family_name?: string
  name?: string
  picture?: string
}

function appUrl(request: NextRequest, path: string) {
  return new URL(path, NEXT_PUBLIC_APP_URL || request.nextUrl.origin)
}

function decodeState(value: string | null): GoogleState | null {
  if (!value) return null

  try {
    const state = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as GoogleState
    if (!state.nonce || !["student", "faculty"].includes(state.role)) {
      return null
    }

    return state
  } catch {
    return null
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function exchangeCode(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    console.error("Google token exchange failed:", await response.text())
    throw new Error("Google token exchange failed")
  }

  const tokens = await response.json()
  if (!tokens.access_token) {
    throw new Error("Google access token missing")
  }

  return tokens.access_token as string
}

async function getGoogleUser(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Unable to retrieve Google profile")
  }

  return (await response.json()) as GoogleUser
}

async function createGoogleUser(googleUser: GoogleUser, role: "student" | "faculty") {
  const temporaryPassword = randomBytes(48).toString("base64url")
  const passwordHash = await hashPassword(temporaryPassword)
  const names = googleUser.name?.trim().split(/\s+/) || []
  const firstName = googleUser.given_name || names[0] || "Google"
  const lastName = googleUser.family_name || names.slice(1).join(" ") || "User"

  const user = await User.create({
    role,
    first_name: firstName,
    last_name: lastName,
    email: googleUser.email.toLowerCase(),
    password_hash: passwordHash,
    google_id: googleUser.sub,
    auth_provider: "google",
    profile_picture_url: googleUser.picture,
  })

  try {
    if (role === "faculty") {
      await FacultyProfile.create({
        user_id: user._id,
        faculty_id: `__pending__faculty_${user._id}`,
        department: "__pending__",
        specialization: "__pending__",
        date_of_joining: new Date(0),
        date_of_birth: new Date(0),
      })
    } else {
      await StudentProfile.create({
        user_id: user._id,
        registration_number: `__pending__student_${user._id}`,
        department: "__pending__",
        year: "__pending__",
        cgpa: 0,
      })
    }

    return user
  } catch (error) {
    await User.deleteOne({ _id: user._id })
    throw error
  }
}

export async function GET(request: NextRequest) {
  const loginUrl = appUrl(request, "/login")

  try {
    if (!IS_GOOGLE_AUTH_CONFIGURED || !JWT_SECRET || !NEXT_PUBLIC_APP_URL) {
      loginUrl.searchParams.set("error", "google_not_configured")
      return NextResponse.redirect(loginUrl)
    }

    const googleError = request.nextUrl.searchParams.get("error")
    if (googleError) {
      loginUrl.searchParams.set("error", "google_access_denied")
      return NextResponse.redirect(loginUrl)
    }

    const code = request.nextUrl.searchParams.get("code")
    const state = decodeState(request.nextUrl.searchParams.get("state"))
    const storedNonce = request.cookies.get("google_oauth_nonce")?.value

    if (!code || !state || !storedNonce || state.nonce !== storedNonce) {
      loginUrl.searchParams.set("error", "google_state_invalid")
      return NextResponse.redirect(loginUrl)
    }

    const accessToken = await exchangeCode(code)
    const googleUser = await getGoogleUser(accessToken)

    if (!googleUser.sub || !googleUser.email || googleUser.email_verified === false) {
      loginUrl.searchParams.set("error", "google_email_unverified")
      return NextResponse.redirect(loginUrl)
    }

    await connectToMongoDB()

    const email = googleUser.email.toLowerCase()
    let user = await User.findOne({
      $or: [
        { google_id: googleUser.sub },
        {
          email: {
            $regex: new RegExp(`^${escapeRegex(email)}$`, "i"),
          },
        },
      ],
    })

    if (!user) {
      user = await createGoogleUser(googleUser, state.role)
    } else {
      if (!user.google_id) {
        user.google_id = googleUser.sub
      }

      user.auth_provider = "google"

      if (googleUser.picture && !user.profile_picture_url) {
        user.profile_picture_url = googleUser.picture
      }

      await user.save()
    }

    await LoginActivity.create({
      user_id: user._id,
      timestamp: new Date(),
      ip_address:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
      success: true,
      device_type: "Web",
    })

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

    const destination = state.redirect || `/dashboard/${user.role}`
    const response = NextResponse.redirect(appUrl(request, destination))
    response.cookies.set("session", token, COOKIE_SETTINGS)
    response.cookies.delete("google_oauth_nonce")

    return response
  } catch (error) {
    console.error("Google authentication failed:", error)
    loginUrl.searchParams.set("error", "google_auth_failed")

    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete("google_oauth_nonce")

    return response
  }
}
