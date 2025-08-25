import { NextResponse } from "next/server"
import { JWT_SECRET } from "@/lib/env"

export async function GET() {
  return NextResponse.json({
    isSet: !!JWT_SECRET && JWT_SECRET !== "fallback-dev-secret-do-not-use-in-production",
  })
}
