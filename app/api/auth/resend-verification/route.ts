import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import crypto from "crypto"
import { connectToMongoDB } from "@/lib/mongodb"
import { PendingRegistration, User } from "@/lib/models"
import { createVerificationUrl, sendVerificationEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

const COOLDOWN_MS = 60 * 1000
const VERIFICATION_TOKEN_TTL_MS = 30 * 60 * 1000
const GENERIC_MESSAGE = "If a pending registration exists for this email, a new verification link will be sent."

function createVerificationToken() {
  const token = crypto.randomBytes(32).toString("base64url")
  const hash = crypto.createHash("sha256").update(token).digest("hex")
  return { token, hash }
}

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB()
    const body = await request.json()
    const email = String(body.email || "").trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE })
    }

    const [pending, existingUser] = await Promise.all([
      PendingRegistration.findOne({ email }),
      User.findOne({ email }).lean(),
    ])

    if (!pending || existingUser) {
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE })
    }

    const now = new Date()
    const lastSentAt = pending.last_sent_at ? new Date(pending.last_sent_at).getTime() : 0
    const secondsRemaining = Math.ceil((COOLDOWN_MS - (now.getTime() - lastSentAt)) / 1000)

    if (secondsRemaining > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${secondsRemaining} seconds before requesting another verification email.`,
        },
        { status: 429 },
      )
    }

    const { token, hash } = createVerificationToken()
    pending.verification_token_hash = hash
    pending.expires_at = new Date(now.getTime() + VERIFICATION_TOKEN_TTL_MS)
    pending.last_sent_at = now
    await pending.save()

    await sendVerificationEmail({
      to: pending.email,
      firstName: pending.first_name,
      verificationUrl: createVerificationUrl(token),
    })

    return NextResponse.json({ success: true, message: GENERIC_MESSAGE })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to resend verification email.",
      },
      { status: 500 },
    )
  }
}
