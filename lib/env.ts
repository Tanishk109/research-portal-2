// Environment configuration for MySQL database
export const DB_HOST = process.env.DB_HOST || "localhost"
export const DB_PORT = Number.parseInt(process.env.DB_PORT || "3306", 10)
export const DB_USER = process.env.DB_USER || "root"
export const DB_PASSWORD = process.env.DB_PASSWORD || "Tanishk183109"
export const DB_NAME = process.env.DB_NAME || "research_portal"

// Legacy DATABASE_URL for compatibility
export const DATABASE_URL = `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`

// Database configuration check
export const IS_DB_CONFIGURED = !!(DB_HOST && DB_USER && DB_NAME)

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "7d"

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
