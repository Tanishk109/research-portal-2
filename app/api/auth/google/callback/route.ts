import { NextResponse, type NextRequest } from "next/server"
import { SignJWT } from "jose"
import { nanoid } from "nanoid"
import { connectToMongoDB } from "@/lib/mongodb"
import { User, LoginActivity } from "@/lib/models"
import {
  COOKIE_SETTINGS,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  IS_GOOGLE_AUTH_CONFIGURED,
  JWT_EXPIRATION,
  JWT_SECRET,
} from "@/lib/env"

export const dynamic = "force-dynamic"

type GoogleState = {
  nonce: string
  role: "faculty" | "student"
  redirect?: string
}

type GoogleUserInfo = {
  sub: string
  email: string
  email_verified?: boolean
  given_name?: string
  family_name?: string
  name?: string
}

function getRedirectUri(request: NextRequest) {
  if (GOOGLE_REDIRECT_URI) return GOOGLE_REDIRECT_URI
  return new URL("/api/auth/google/callback", request.url).toString()
}

function decodeState(rawState: string | null): GoogleState | null {
  if (!rawState) return null

  try {
    const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8")) as GoogleState
    if (!parsed.nonce || (parsed.role !== "faculty" && parsed.role !== "student")) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

async function exchangeCodeForAccessToken(request: NextRequest, code: string) {
  const redirectUri = getRedirectUri(request)
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "")
    console.error("Google token exchange failed", {
      status: response.status,
      redirectUri,
      error: errorText,
    })
    throw new Error(`google_token_exchange_failed_${response.status}`)
  }

  const tokenPayload = await response.json()
  if (!tokenPayload.access_token) {
    throw new Error("Google did not return an access token")
  }

  return tokenPayload.access_token as string
}

async function fetchGoogleUser(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch Google user profile")
  }

  return (await response.json()) as GoogleUserInfo
}

export async function GET(request: NextRequest) {
  const loginUrl = new URL("/login", request.url)

  try {
    if (!IS_GOOGLE_AUTH_CONFIGURED) {
      loginUrl.searchParams.set("error", "google_not_configured")
      return NextResponse.redirect(loginUrl)
    }

    const code = request.nextUrl.searchParams.get("code")
    const state = decodeState(request.nextUrl.searchParams.get("state"))
    const nonceCookie = request.cookies.get("google_oauth_nonce")?.value

    if (!code || !state || !nonceCookie || state.nonce !== nonceCookie) {
      console.error("Google OAuth state validation failed", {
        hasCode: !!code,
        hasState: !!state,
        hasNonceCookie: !!nonceCookie,
        nonceMatches: !!state && !!nonceCookie && state.nonce === nonceCookie,
        callbackUrl: request.nextUrl.origin + request.nextUrl.pathname,
        configuredRedirectUri: getRedirectUri(request),
      })
      loginUrl.searchParams.set("error", "google_state_invalid")
      return NextResponse.redirect(loginUrl)
    }

    const accessToken = await exchangeCodeForAccessToken(request, code)
    const googleUser = await fetchGoogleUser(accessToken)

    if (!googleUser.email || googleUser.email_verified === false) {
      loginUrl.searchParams.set("error", "google_email_unverified")
      return NextResponse.redirect(loginUrl)
    }

    await connectToMongoDB()
    const email = googleUser.email.toLowerCase()
    const user = await User.findOne({
      $or: [{ google_id: googleUser.sub }, { email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } }],
    })

    if (!user) {
      const registerUrl = new URL("/register", request.url)
      registerUrl.searchParams.set("role", state.role)
      registerUrl.searchParams.set("email", email)
      registerUrl.searchParams.set("firstName", googleUser.given_name || "")
      registerUrl.searchParams.set("lastName", googleUser.family_name || "")
      registerUrl.searchParams.set("error", "google_account_not_found")
      const response = NextResponse.redirect(registerUrl)
      const registrationToken = await new SignJWT({
        sub: googleUser.sub,
        email,
        firstName: googleUser.given_name || "",
        lastName: googleUser.family_name || "",
        role: state.role,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("10m")
        .sign(new TextEncoder().encode(JWT_SECRET))

      response.cookies.set("google_registration", registrationToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 10 * 60,
        path: "/",
      })
      response.cookies.delete("google_oauth_nonce")
      return response
    }

    if (!user.google_id) {
      user.google_id = googleUser.sub
    }
    user.auth_provider = "google"
    await user.save()

    await LoginActivity.create({
      user_id: user._id,
      timestamp: new Date(),
      ip_address: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
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
    const response = NextResponse.redirect(new URL(destination, request.url))
    response.cookies.set("session", token, COOKIE_SETTINGS)
    response.cookies.delete("google_oauth_nonce")
    return response
  } catch (error) {
    console.error("Google authentication error:", error)
    loginUrl.searchParams.set("error", "google_auth_failed")
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete("google_oauth_nonce")
    return response
  }
}
