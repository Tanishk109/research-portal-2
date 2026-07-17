import { NextResponse } from "next/server"
import {
  MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRATION,
  IS_DB_CONFIGURED,
  API_URL,
  EMAIL_FROM,
  EMAIL_PROVIDER,
  GMAIL_CLIENT_ID,
  GMAIL_REFRESH_TOKEN,
  GMAIL_SENDER_EMAIL,
  IS_GMAIL_CONFIGURED,
  IS_RESEND_CONFIGURED,
  NEXT_PUBLIC_APP_URL,
  RESEND_API_KEY,
} from "@/lib/env"

export async function GET() {
  // Mask sensitive values for security
  const maskedMongoUri = MONGODB_URI ? MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//****:****@") : "Not configured"

  const maskedJwtSecret = JWT_SECRET
    ? JWT_SECRET.substring(0, 3) + "..." + JWT_SECRET.substring(JWT_SECRET.length - 3)
    : "Not configured"

  return NextResponse.json({
    success: true,
    environment: {
      NODE_ENV: process.env.NODE_ENV || "not set",
      VERCEL_ENV: process.env.VERCEL_ENV || "not set",
      MONGODB_URI: maskedMongoUri,
      JWT_SECRET: maskedJwtSecret,
      JWT_EXPIRATION: JWT_EXPIRATION || "not set",
      IS_DB_CONFIGURED: IS_DB_CONFIGURED,
      NEXT_PUBLIC_APP_URL: NEXT_PUBLIC_APP_URL || "not configured",
      API_URL: API_URL || "same origin",
      EMAIL_FROM: EMAIL_FROM || "Not configured",
      EMAIL_PROVIDER: EMAIL_PROVIDER || "Not configured",
      GMAIL_CLIENT_ID: GMAIL_CLIENT_ID ? `${GMAIL_CLIENT_ID.slice(0, 8)}...` : "Not configured",
      GMAIL_REFRESH_TOKEN: GMAIL_REFRESH_TOKEN ? "Configured" : "Not configured",
      GMAIL_SENDER_EMAIL: GMAIL_SENDER_EMAIL || "Not configured",
      IS_GMAIL_CONFIGURED,
      RESEND_API_KEY: RESEND_API_KEY ? `${RESEND_API_KEY.slice(0, 6)}...` : "Not configured",
      IS_RESEND_CONFIGURED,
    },
  })
}
