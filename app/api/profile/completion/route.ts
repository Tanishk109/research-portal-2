import { NextResponse } from "next/server"
import { getCurrentProfileCompletionStatus } from "@/app/actions/profiles"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const result = await getCurrentProfileCompletionStatus()
    const status = result.success ? 200 : 401
    return NextResponse.json(result, { status })
  } catch (error) {
    console.error("Profile completion check failed:", error)
    return NextResponse.json(
      { success: false, complete: false, role: null, missing: ["Profile completion check"] },
      { status: 500 },
    )
  }
}
