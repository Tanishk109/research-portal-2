import { NextResponse } from "next/server"
import { DATABASE_URL, JWT_SECRET, JWT_EXPIRATION, IS_DB_CONFIGURED } from "@/lib/env"

export async function GET() {
  // Mask sensitive values for security
  const maskedDbUrl = DATABASE_URL ? DATABASE_URL.replace(/\/\/([^:]+):([^@]+)@/, "//****:****@") : "Not configured"

  const maskedJwtSecret = JWT_SECRET
    ? JWT_SECRET.substring(0, 3) + "..." + JWT_SECRET.substring(JWT_SECRET.length - 3)
    : "Not configured"

  return NextResponse.json({
    success: true,
    environment: {
      NODE_ENV: process.env.NODE_ENV || "not set",
      VERCEL_ENV: process.env.VERCEL_ENV || "not set",
      DATABASE_URL: maskedDbUrl,
      JWT_SECRET: maskedJwtSecret,
      JWT_EXPIRATION: JWT_EXPIRATION || "not set",
      IS_DB_CONFIGURED: IS_DB_CONFIGURED,
    },
  })
}
