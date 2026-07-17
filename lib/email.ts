import { EMAIL_FROM, EMAIL_PROVIDER, NEXT_PUBLIC_APP_URL, RESEND_API_KEY } from "@/lib/env"

type VerificationEmailInput = {
  to: string
  firstName: string
  verificationUrl: string
}

function requireEnvironmentVariable(name: string, value: string): string {
  if (!value?.trim()) {
    throw new Error(`${name} environment variable is required`)
  }

  return value.trim()
}

export function createVerificationUrl(token: string) {
  const appUrl = requireEnvironmentVariable("NEXT_PUBLIC_APP_URL", NEXT_PUBLIC_APP_URL)
  const url = new URL("/verify-email", appUrl)
  url.searchParams.set("token", token)
  return url.toString()
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function parseResendError(errorBody: string) {
  try {
    const parsed = JSON.parse(errorBody)
    return parsed?.message || parsed?.error || errorBody
  } catch {
    return errorBody
  }
}

function parseJsonBody(value: string) {
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export async function sendVerificationEmail({
  to,
  firstName,
  verificationUrl,
}: VerificationEmailInput): Promise<string> {
  const provider = EMAIL_PROVIDER || process.env.EMAIL_PROVIDER?.trim().toLowerCase()

  if (provider !== "resend") {
    throw new Error(`Unsupported email provider: ${provider || "not configured"}`)
  }

  const apiKey = requireEnvironmentVariable("RESEND_API_KEY", RESEND_API_KEY)
  const from = requireEnvironmentVariable("EMAIL_FROM", EMAIL_FROM)

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Verify your MUJ Research Portal account",
      text: [
        `Hello ${firstName},`,
        "",
        "Verify your email address to create your Research Portal account:",
        verificationUrl,
        "",
        "This link expires in 30 minutes.",
        "If you did not request this account, ignore this email.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
          <h2>Verify your email address</h2>

          <p>Hello ${escapeHtml(firstName)},</p>

          <p>
            Confirm your email address to create your
            MUJ Research Portal account.
          </p>

          <p style="margin:30px 0">
            <a
              href="${escapeHtml(verificationUrl)}"
              style="
                background:#2563eb;
                color:#ffffff;
                padding:12px 20px;
                border-radius:8px;
                text-decoration:none;
                font-weight:600;
              "
            >
              Verify email
            </a>
          </p>

          <p style="color:#64748b;font-size:14px">
            This link expires in 30 minutes.
          </p>
        </div>
      `,
    }),
  })

  const responseBody = await response.text()
  const result = parseJsonBody(responseBody)

  if (!response.ok) {
    const message = parseResendError(responseBody)
    console.error("Resend email error:", {
      status: response.status,
      message,
    })
    throw new Error(`Email delivery failed: ${message}`)
  }

  if (!result?.id) {
    throw new Error("Resend did not return an email ID")
  }

  console.log("Verification email accepted by Resend:", result.id)
  return result.id
}
