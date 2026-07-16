export const MONGODB_URI = process.env.MONGODB_URI || ""

export const IS_DB_CONFIGURED = MONGODB_URI.startsWith("mongodb://") || MONGODB_URI.startsWith("mongodb+srv://")

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "7d"

// Google OAuth configuration
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || ""
export const IS_GOOGLE_AUTH_CONFIGURED = !!GOOGLE_CLIENT_ID && !!GOOGLE_CLIENT_SECRET

// Cookie settings
export const COOKIE_SETTINGS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
}

// API configuration
export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Environment check
export const isDevelopment = process.env.NODE_ENV === "development"
export const isProduction = process.env.NODE_ENV === "production"
