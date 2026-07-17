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
  NEXT_PUBLIC_APP_URL,
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

class GoogleOAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly googleError?: string,
    public readonly googleDescription?: string,
  ) {
    super(message)
  }
}

function getFirstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || ""
}

function getPublicOrigin(request: NextRequest) {
  const forwardedHost = getFirstHeaderValue(request.headers.get("x-forwarded-host"))
  const forwardedProto = getFirstHeaderValue(request.headers.get("x-forwarded-proto")) || "https"
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  if (NEXT_PUBLIC_APP_URL) {
    return NEXT_PUBLIC_APP_URL
  }

  return request.nextUrl.origin
}

function getRedirectUri(request: NextRequest) {
  if (GOOGLE_REDIRECT_URI) return GOOGLE_REDIRECT_URI
  return new URL("/api/auth/google/callback", getPublicOrigin(request)).toString()
}

function getAppUrl(request: NextRequest, path: string) {
  return new URL(path, getPublicOrigin(request))
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
    let googleError = ""
    let googleDescription = ""
    try {
      const parsed = JSON.parse(errorText)
      googleError = typeof parsed.error === "string" ? parsed.error : ""
      googleDescription = typeof parsed.error_description === "string" ? parsed.error_description : ""
    } catch {
      // Keep the raw text in the server log below.
    }

    console.error("Google token exchange failed", {
      status: response.status,
      redirectUri,
      googleError,
      googleDescription,
      error: errorText,
    })
    throw new GoogleOAuthError(`google_token_exchange_failed_${response.status}`, response.status, googleError, googleDescription)
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
  const loginUrl = getAppUrl(request, "/login")

  try {
    if (!IS_GOOGLE_AUTH_CONFIGURED) {
      loginUrl.searchParams.set("error", "google_not_configured")
      return NextResponse.redirect(loginUrl)
    }

    if (GOOGLE_REDIRECT_URI && new URL(GOOGLE_REDIRECT_URI).origin !== getPublicOrigin(request)) {
      loginUrl.searchParams.set("error", "google_redirect_mismatch")
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
      const registerUrl = getAppUrl(request, "/register")
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
    const response = NextResponse.redirect(getAppUrl(request, destination))
    response.cookies.set("session", token, COOKIE_SETTINGS)
    response.cookies.delete("google_oauth_nonce")
    return response
  } catch (error) {
    console.error("Google authentication error:", error)
    const googleError = error instanceof GoogleOAuthError ? error.googleError : ""
    loginUrl.searchParams.set("error", googleError === "invalid_grant" ? "google_invalid_grant" : "google_auth_failed")
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete("google_oauth_nonce")
    return response
  }
}
