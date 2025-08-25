import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { JWT_SECRET } from "@/lib/env"

// Paths that require authentication
const protectedPaths = ["/dashboard", "/api/auth/me", "/api/users", "/api/projects", "/api/applications"]

// Paths that are public (no authentication required)
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/about",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/db-test",
  "/api/registration-test",
  "/api/health",
  "/debug",
  "/admin",
]

// Role-based path restrictions
const roleBasedPaths = {
  faculty: ["/dashboard/faculty"],
  student: ["/dashboard/student"],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log(`Middleware: ${request.method} ${pathname}`)

  // Check if path is public
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(path))

  if (isPublicPath) {
    console.log(`Public path: ${pathname}`)
    return NextResponse.next()
  }

  // Check if path requires authentication
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  if (!isProtectedPath) {
    console.log(`Unprotected path: ${pathname}`)
    return NextResponse.next()
  }

  // Get session cookie
  const sessionCookie = request.cookies.get("session")

  if (!sessionCookie) {
    console.log(`No session cookie found for: ${pathname}`)

    // Redirect to login for pages, return 401 for API routes
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
          error: "UNAUTHORIZED",
        },
        { status: 401 },
      )
    } else {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Verify JWT token
  try {
    const { payload } = await jwtVerify(sessionCookie.value, new TextEncoder().encode(JWT_SECRET))

    console.log(`Token verified for user: ${payload.id}, role: ${payload.role}`)

    // Check role-based access
    const userRole = payload.role as string
    const hasRoleAccess = Object.entries(roleBasedPaths).every(([role, paths]) => {
      if (role !== userRole) {
        return !paths.some((path) => pathname.startsWith(path))
      }
      return true
    })

    if (!hasRoleAccess) {
      console.log(`Role access denied for ${userRole} to ${pathname}`)

      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          {
            success: false,
            message: "Access denied for your role",
            error: "FORBIDDEN",
          },
          { status: 403 },
        )
      } else {
        // Redirect to appropriate dashboard
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url))
      }
    }

    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", payload.id?.toString() || "")
    requestHeaders.set("x-user-role", payload.role?.toString() || "")
    requestHeaders.set("x-user-email", payload.email?.toString() || "")

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error(`Token verification failed for ${pathname}:`, error)

    // Clear invalid session cookie
    const response = pathname.startsWith("/api/")
      ? NextResponse.json(
          {
            success: false,
            message: "Invalid session token",
            error: "UNAUTHORIZED",
          },
          { status: 401 },
        )
      : NextResponse.redirect(new URL("/login", request.url))

    response.cookies.delete("session")
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}
