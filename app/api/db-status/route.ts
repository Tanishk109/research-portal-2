import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    const isConnected = await testDatabaseConnection()

    if (isConnected) {
      return NextResponse.json({
        status: "connected",
        message: "Database connection successful",
      })
    } else {
      return NextResponse.json(
        {
          status: "disconnected",
          message: "Database connection failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: `Database connection error: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
