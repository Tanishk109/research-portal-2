function normalizeUrl(value?: string) {
  if (!value) return ""
  return value.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "")
}

function normalizeEnv(value?: string) {
  return value?.trim().replace(/^["']|["']$/g, "") || ""
}

export const MONGODB_URI = normalizeEnv(process.env.MONGODB_URI)

export const IS_DB_CONFIGURED = MONGODB_URI.startsWith("mongodb://") || MONGODB_URI.startsWith("mongodb+srv://")

// JWT configuration
export const JWT_SECRET = normalizeEnv(process.env.JWT_SECRET)
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

// Email verification configuration
export const SMTP_HOST = normalizeEnv(process.env.SMTP_HOST)
export const SMTP_PORT = Number.parseInt(normalizeEnv(process.env.SMTP_PORT) || "587", 10)
export const SMTP_SECURE = normalizeEnv(process.env.SMTP_SECURE).toLowerCase() === "true"
export const SMTP_USER = normalizeEnv(process.env.SMTP_USER)
export const SMTP_PASSWORD = normalizeEnv(process.env.SMTP_PASSWORD)
export const EMAIL_FROM = normalizeEnv(process.env.EMAIL_FROM) || SMTP_USER
export const IS_SMTP_CONFIGURED =
  Boolean(SMTP_HOST) && Boolean(SMTP_PORT) && Boolean(SMTP_USER) && Boolean(SMTP_PASSWORD) && Boolean(EMAIL_FROM)

if (process.env.NODE_ENV === "production" && !JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production")
}

// Cookie settings
export const COOKIE_SETTINGS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60,
  path: "/",
}

// Environment check
export const isDevelopment = process.env.NODE_ENV === "development"
export const isProduction = process.env.NODE_ENV === "production"
