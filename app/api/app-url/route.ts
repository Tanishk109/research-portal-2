import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  })
}
