import {
  EMAIL_FROM,
  EMAIL_PROVIDER,
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  GMAIL_SENDER_EMAIL,
  NEXT_PUBLIC_APP_URL,
  RESEND_API_KEY,
} from "@/lib/env"

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

function buildEmailContent({ to, firstName, verificationUrl }: VerificationEmailInput) {
  const subject = "Verify your MUJ Research Portal account"
  const text = [
    `Hello ${firstName},`,
    "",
    "Verify your email address to create your Research Portal account:",
    verificationUrl,
    "",
    "This link expires in 30 minutes.",
    "If you did not request this account, ignore this email.",
  ].join("\n")
  const html = `
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
  `

  return { to, subject, text, html }
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function encodeMimeSubject(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`
}

function buildMimeMessage({
  from,
  html,
  subject,
  text,
  to,
}: {
  from: string
  html: string
  subject: string
  text: string
  to: string
}) {
  const boundary = `muj_${crypto.randomUUID()}`

  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeMimeSubject(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    html,
    "",
    `--${boundary}--`,
  ].join("\r\n")
}

async function getGmailAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: requireEnvironmentVariable("GMAIL_CLIENT_ID", GMAIL_CLIENT_ID),
      client_secret: requireEnvironmentVariable("GMAIL_CLIENT_SECRET", GMAIL_CLIENT_SECRET),
      refresh_token: requireEnvironmentVariable("GMAIL_REFRESH_TOKEN", GMAIL_REFRESH_TOKEN),
      grant_type: "refresh_token",
    }),
  })

  const responseBody = await response.text()
  const result = parseJsonBody(responseBody)

  if (!response.ok || !result?.access_token) {
    const message = result?.error_description || result?.error || responseBody || "Unable to refresh Gmail access token"
    console.error("Gmail token error:", {
      status: response.status,
      message,
    })
    throw new Error(`Gmail authorization failed: ${message}`)
  }

  return result.access_token as string
}

async function sendWithGmail(input: VerificationEmailInput) {
  const accessToken = await getGmailAccessToken()
  const senderEmail = requireEnvironmentVariable("GMAIL_SENDER_EMAIL", GMAIL_SENDER_EMAIL)
  const from = EMAIL_FROM.includes("<") ? EMAIL_FROM : `"MUJ Research Portal" <${senderEmail}>`
  const email = buildEmailContent(input)
  const raw = encodeBase64Url(
    buildMimeMessage({
      from,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  )

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  })

  const responseBody = await response.text()
  const result = parseJsonBody(responseBody)

  if (!response.ok || !result?.id) {
    const message = result?.error?.message || responseBody || "Gmail did not accept the email"
    console.error("Gmail email error:", {
      status: response.status,
      message,
    })
    throw new Error(`Email delivery failed: ${message}`)
  }

  console.log("Verification email accepted by Gmail:", result.id)
  return result.id as string
}

async function sendWithResend(input: VerificationEmailInput) {
  const email = buildEmailContent(input)
  const from = requireEnvironmentVariable("EMAIL_FROM", EMAIL_FROM)

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireEnvironmentVariable("RESEND_API_KEY", RESEND_API_KEY)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email.to],
      subject: email.subject,
      text: email.text,
      html: email.html,
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
  return result.id as string
}

export async function sendVerificationEmail({
  to,
  firstName,
  verificationUrl,
}: VerificationEmailInput): Promise<string> {
  const provider = EMAIL_PROVIDER || process.env.EMAIL_PROVIDER?.trim().toLowerCase()

  if (provider === "gmail") {
    return sendWithGmail({ to, firstName, verificationUrl })
  }

  if (provider === "resend") {
    return sendWithResend({ to, firstName, verificationUrl })
  }

  throw new Error(`Unsupported email provider: ${provider || "not configured"}`)
}
