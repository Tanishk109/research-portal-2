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

// Email verification configuration. Render free services block SMTP ports, so email is sent over HTTPS.
export const EMAIL_PROVIDER = normalizeEnv(process.env.EMAIL_PROVIDER).toLowerCase()
export const RESEND_API_KEY = normalizeEnv(process.env.RESEND_API_KEY)
export const EMAIL_FROM = normalizeEnv(process.env.EMAIL_FROM)
export const IS_RESEND_CONFIGURED = Boolean(RESEND_API_KEY) && Boolean(EMAIL_FROM)
export const GMAIL_CLIENT_ID = normalizeEnv(process.env.GMAIL_CLIENT_ID)
export const GMAIL_CLIENT_SECRET = normalizeEnv(process.env.GMAIL_CLIENT_SECRET)
export const GMAIL_REFRESH_TOKEN = normalizeEnv(process.env.GMAIL_REFRESH_TOKEN)
export const GMAIL_SENDER_EMAIL = normalizeEnv(process.env.GMAIL_SENDER_EMAIL) || EMAIL_FROM
export const IS_GMAIL_CONFIGURED =
  Boolean(GMAIL_CLIENT_ID) && Boolean(GMAIL_CLIENT_SECRET) && Boolean(GMAIL_REFRESH_TOKEN) && Boolean(GMAIL_SENDER_EMAIL)

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
