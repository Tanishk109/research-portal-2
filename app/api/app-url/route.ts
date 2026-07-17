import { NextResponse } from "next/server"
import { API_URL, NEXT_PUBLIC_APP_URL } from "@/lib/env"

export async function GET() {
  return NextResponse.json({
    success: true,
    appUrl: NEXT_PUBLIC_APP_URL || "not configured",
    apiUrl: API_URL || "same origin",
  })
}
