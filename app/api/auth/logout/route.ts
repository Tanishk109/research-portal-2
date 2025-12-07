import { cookies } from "next/headers"
import { createApiResponse, handleApiError } from "@/lib/api-utils"

// Force dynamic rendering for this route (uses cookies)
export const dynamic = 'force-dynamic'

// POST /api/auth/logout - Logout
export async function POST() {
  try {
    cookies().delete("session")
    return createApiResponse(true, "Logout successful")
  } catch (error) {
    return handleApiError(error, "Logout failed")
  }
}
