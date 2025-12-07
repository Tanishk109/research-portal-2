// Helper function to safely parse DATABASE_URL
function parseDatabaseUrl() {
  if (!process.env.DATABASE_URL) return null
  try {
    const url = new URL(process.env.DATABASE_URL)
    return {
      host: url.hostname,
      port: Number.parseInt(url.port || "3306", 10),
      user: url.username,
      password: url.password,
      database: url.pathname.replace(/^\//, ''),
    }
  } catch {
    return null
  }
}

const parsedUrl = parseDatabaseUrl()

// Environment configuration for MySQL database
// Support both individual env vars and DATABASE_URL (Vercel style)
export const DB_HOST = process.env.DB_HOST || parsedUrl?.host || "localhost"
export const DB_PORT = process.env.DB_PORT 
  ? Number.parseInt(process.env.DB_PORT, 10)
  : (parsedUrl?.port || 3306)
export const DB_USER = process.env.DB_USER || parsedUrl?.user || "root"
export const DB_PASSWORD = process.env.DB_PASSWORD || parsedUrl?.password || ""
export const DB_NAME = process.env.DB_NAME || parsedUrl?.database || "research_portal"

// Legacy DATABASE_URL for compatibility (only if not already set)
export const DATABASE_URL = process.env.DATABASE_URL || `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`

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
