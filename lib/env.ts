function normalizeUrl(value?: string) {
  if (!value) return ""
  return value.trim().replace(/\/+$/, "")
}

function normalizeEnv(value?: string) {
  return value?.trim() || ""
}

export const MONGODB_URI = normalizeEnv(process.env.MONGODB_URI)

export const IS_DB_CONFIGURED = MONGODB_URI.startsWith("mongodb://") || MONGODB_URI.startsWith("mongodb+srv://")

// JWT configuration
export const JWT_SECRET = normalizeEnv(process.env.JWT_SECRET) || "your-super-secret-jwt-key-change-in-production"
export const JWT_EXPIRATION = normalizeEnv(process.env.JWT_EXPIRATION) || "7d"

// Deployment URLs
export const NEXT_PUBLIC_APP_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    process.env.RENDER_EXTERNAL_URL ||
    "",
)
export const NEXT_PUBLIC_API_URL = normalizeUrl(process.env.NEXT_PUBLIC_API_URL || "")
export const API_URL = normalizeUrl(NEXT_PUBLIC_API_URL || NEXT_PUBLIC_APP_URL)

// Google OAuth configuration
export const GOOGLE_CLIENT_ID = normalizeEnv(process.env.GOOGLE_CLIENT_ID)
export const GOOGLE_CLIENT_SECRET = normalizeEnv(process.env.GOOGLE_CLIENT_SECRET)
export const GOOGLE_REDIRECT_URI = normalizeUrl(process.env.GOOGLE_REDIRECT_URI || "")
export const IS_GOOGLE_AUTH_CONFIGURED = !!GOOGLE_CLIENT_ID && !!GOOGLE_CLIENT_SECRET

// Cookie settings
export const COOKIE_SETTINGS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
}

// Environment check
export const isDevelopment = process.env.NODE_ENV === "development"
export const isProduction = process.env.NODE_ENV === "production"
