import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./env"

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Create standardized API response
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string,
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(error && { error }),
  }

  return NextResponse.json(response, {
    status: success ? 200 : 400,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

// Handle API errors consistently
export function handleApiError(error: any, context?: string): NextResponse<ApiResponse> {
  console.error(`API Error${context ? ` in ${context}` : ""}:`, error)

  const message = error instanceof Error ? error.message : "An unexpected error occurred"

  return createApiResponse(false, null, undefined, message)
}

// Parse JSON body from request
export async function parseJsonBody<T = any>(request: NextRequest): Promise<T | null> {
  try {
    const body = await request.json()
    return body as T
  } catch (error) {
    console.error("Failed to parse JSON body:", error)
    return null
  }
}

// Validate required fields in request body
export function validateRequiredFields(
  body: Record<string, any>,
  requiredFields: string[],
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(
    (field) => !body[field] || (typeof body[field] === "string" && body[field].trim() === ""),
  )

  return {
    isValid: missingFields.length === 0,
    missingFields,
  }
}

// Get user ID from JWT token in request
export function getUserIdFromRequest(request: NextRequest): string | null {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.userId || null
  } catch (error) {
    console.error("Failed to get user ID from request:", error)
    return null
  }
}

// Get user role from JWT token in request
export function getUserRoleFromRequest(request: NextRequest): string | null {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.role || null
  } catch (error) {
    console.error("Failed to get user role from request:", error)
    return null
  }
}

// Get client IP address
export function getClientIpAddress(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return "unknown"
}

// CORS headers for API routes
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Handle CORS preflight requests
export function handleCors(request: NextRequest): NextResponse | null {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    })
  }
  return null
}
