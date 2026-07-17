import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"

import {
  GOOGLE_CLIENT_ID,
  GOOGLE_REDIRECT_URI,
  IS_GOOGLE_AUTH_CONFIGURED,
  NEXT_PUBLIC_APP_URL,
} from "@/lib/env"

export const dynamic = "force-dynamic"

const allowedRoles = new Set(["student", "faculty"])

function appUrl(request: NextRequest, path: string) {
  return new URL(path, NEXT_PUBLIC_APP_URL || request.nextUrl.origin)
}

export async function GET(request: NextRequest) {
  if (!IS_GOOGLE_AUTH_CONFIGURED || !NEXT_PUBLIC_APP_URL) {
    return NextResponse.redirect(appUrl(request, "/login?error=google_not_configured"))
  }

  const requestedRole = request.nextUrl.searchParams.get("role") || "student"
  const role = allowedRoles.has(requestedRole) ? requestedRole : "student"

  const requestedRedirect = request.nextUrl.searchParams.get("redirect") || ""
  const redirect =
    requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//") ? requestedRedirect : ""

  const nonce = randomBytes(32).toString("base64url")
  const state = Buffer.from(JSON.stringify({ nonce, role, redirect })).toString("base64url")

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  googleUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID)
  googleUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI)
  googleUrl.searchParams.set("response_type", "code")
  googleUrl.searchParams.set("scope", "openid email profile")
  googleUrl.searchParams.set("state", state)
  googleUrl.searchParams.set("prompt", "select_account")

  const response = NextResponse.redirect(googleUrl)
  response.cookies.set("google_oauth_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  })

  return response
}
