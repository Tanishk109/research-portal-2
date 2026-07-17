import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// POST /api/registration-test - disabled to prevent hardcoded test data writes.
export async function POST(request: NextRequest) {
  await request.text().catch(() => "")
  return NextResponse.json(
    { success: false, message: "Test registration endpoint is disabled. Use /api/auth/register for MongoDB-backed user creation." },
    { status: 410 },
  )
}
