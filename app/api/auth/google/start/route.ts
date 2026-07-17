import { randomBytes } from "crypto"
import { NextResponse, type NextRequest } from "next/server"
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, IS_GOOGLE_AUTH_CONFIGURED, NEXT_PUBLIC_APP_URL } from "@/lib/env"

export const dynamic = "force-dynamic"

const allowedRoles = new Set(["faculty", "student"])

function getRedirectUri(request: NextRequest) {
  if (GOOGLE_REDIRECT_URI) return GOOGLE_REDIRECT_URI
  return new URL("/api/auth/google/callback", request.url).toString()
}

function getAppUrl(request: NextRequest, path: string) {
  if (NEXT_PUBLIC_APP_URL) {
    return new URL(path, NEXT_PUBLIC_APP_URL)
  }

  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https"
  if (forwardedHost) {
    return new URL(path, `${forwardedProto}://${forwardedHost}`)
  }

  return new URL(path, request.url)
}

export async function GET(request: NextRequest) {
  if (!IS_GOOGLE_AUTH_CONFIGURED) {
    return NextResponse.redirect(getAppUrl(request, "/login?error=google_not_configured"))
  }

  const role = request.nextUrl.searchParams.get("role") || "student"
  const redirect = request.nextUrl.searchParams.get("redirect") || ""
  const safeRole = allowedRoles.has(role) ? role : "student"
  const safeRedirect = redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : ""
  const nonce = randomBytes(24).toString("base64url")
  const state = Buffer.from(JSON.stringify({ nonce, role: safeRole, redirect: safeRedirect })).toString("base64url")

  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  authorizationUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID)
  authorizationUrl.searchParams.set("redirect_uri", getRedirectUri(request))
  authorizationUrl.searchParams.set("response_type", "code")
  authorizationUrl.searchParams.set("scope", "openid email profile")
  authorizationUrl.searchParams.set("state", state)
  authorizationUrl.searchParams.set("prompt", "select_account")

  const response = NextResponse.redirect(authorizationUrl)
  response.cookies.set("google_oauth_nonce", nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
  })

  return response
}
