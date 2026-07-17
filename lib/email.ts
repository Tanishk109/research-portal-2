import nodemailer from "nodemailer"
import dns from "dns"
import {
  EMAIL_FROM,
  IS_SMTP_CONFIGURED,
  NEXT_PUBLIC_APP_URL,
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
} from "@/lib/env"

type VerificationEmailInput = {
  to: string
  name: string
  verificationUrl: string
}

let dnsConfigured = false

export function ensureEmailConfigured() {
  if (!IS_SMTP_CONFIGURED) {
    throw new Error("Email verification is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and EMAIL_FROM.")
  }
}

function preferIpv4() {
  if (dnsConfigured) return

  try {
    dns.setDefaultResultOrder("ipv4first")
  } catch {
    // Older Node runtimes may not support this setting; the SMTP socket still asks for IPv4 below.
  }

  dnsConfigured = true
}

function createTransport() {
  ensureEmailConfigured()
  preferIpv4()

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    family: 4,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  } as any)
}

export function createVerificationUrl(token: string) {
  if (!NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL is required to create verification links.")
  }

  const url = new URL("/verify-email", NEXT_PUBLIC_APP_URL)
  url.searchParams.set("token", token)
  return url.toString()
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function sendVerificationEmail({ to, name, verificationUrl }: VerificationEmailInput) {
  const transporter = createTransport()
  const from = EMAIL_FROM.includes("<") ? EMAIL_FROM : `"MUJ Research Portal" <${EMAIL_FROM}>`
  const safeName = escapeHtml(name)
  const safeVerificationUrl = escapeHtml(verificationUrl)

  await transporter.sendMail({
    from,
    to,
    subject: "Verify your MUJ Research Portal account",
    text: [
      `Hi ${name},`,
      "",
      "Please verify your email address to finish creating your MUJ Research Portal account:",
      verificationUrl,
      "",
      "This link expires in 24 hours. If you did not request this account, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin: 0 0 12px;">Verify your email address</h2>
        <p>Hi ${safeName},</p>
        <p>Please verify your email address to finish creating your MUJ Research Portal account.</p>
        <p>
          <a href="${safeVerificationUrl}" style="display: inline-block; padding: 12px 18px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px;">
            Verify email
          </a>
        </p>
        <p style="font-size: 14px; color: #4b5563;">This link expires in 24 hours. If you did not request this account, you can ignore this email.</p>
      </div>
    `,
  })
}
