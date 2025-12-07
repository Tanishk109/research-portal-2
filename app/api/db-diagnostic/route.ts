import { NextResponse } from "next/server";
import { testDatabaseConnection, getDatabaseInfo } from "@/lib/db";

export async function GET() {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDbHost: !!process.env.DB_HOST,
        hasDbUser: !!process.env.DB_USER,
        hasDbPassword: !!process.env.DB_PASSWORD,
        hasDbName: !!process.env.DB_NAME,
      },
      connection: {
        test: false,
        error: null,
      },
    };

    // Mask sensitive info in environment check
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      diagnostics.environment.databaseUrl = `${url.protocol}//${url.hostname}:${url.port}/${url.pathname.replace(/^\//, '')}`;
    }
    if (process.env.DB_HOST) {
      diagnostics.environment.dbHost = process.env.DB_HOST;
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
        sqlState: error?.sqlState,
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

