import { NextResponse } from "next/server";
import { testDatabaseConnection, getDatabaseInfo } from "@/lib/db";

export async function GET() {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        hasMongoDbUri: !!process.env.MONGODB_URI,
      },
      connection: {
        test: false,
        error: null,
      },
    };

    // Mask sensitive info in environment check
    if (process.env.MONGODB_URI) {
      const url = new URL(process.env.MONGODB_URI);
      diagnostics.environment.mongodb = `${url.protocol}//${url.hostname}${url.pathname}`;
    }

    // Test connection
    try {
      const connected = await testDatabaseConnection();
      diagnostics.connection.test = connected;
      
      if (connected) {
        try {
          const dbInfo = await getDatabaseInfo();
          diagnostics.connection.info = dbInfo;
        } catch (infoError: any) {
          diagnostics.connection.infoError = infoError?.message;
        }
      }
    } catch (error: any) {
      diagnostics.connection.test = false;
      diagnostics.connection.error = {
        message: error?.message || String(error),
        code: error?.code,
        errno: error?.errno,
      };
    }

    return NextResponse.json({
      success: diagnostics.connection.test,
      diagnostics,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || String(error),
        diagnostics: {
          timestamp: new Date().toISOString(),
          error: "Failed to run diagnostics",
        },
      },
      { status: 500 }
    );
  }
}
