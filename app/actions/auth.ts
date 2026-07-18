"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import crypto from "crypto"
import { hashPassword, comparePassword, toPlainObject, toObjectId } from "@/lib/db"
import { connectToMongoDB } from "@/lib/mongodb"
import { User, LoginActivity, FacultyProfile, StudentProfile, PendingRegistration } from "@/lib/models"
import { jwtVerify, SignJWT } from "jose"
import { nanoid } from "nanoid"
import { JWT_SECRET, COOKIE_SETTINGS, JWT_EXPIRATION } from "@/lib/env"
import { createVerificationUrl, sendVerificationEmail } from "@/lib/email"

const VERIFICATION_TOKEN_TTL_MS = 30 * 60 * 1000

// Get user agent details
function getUserAgentDetails(userAgent: string) {
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent)
  const isTablet = /tablet|ipad/i.test(userAgent)
  const isDesktop = !isMobile && !isTablet

  let deviceType = "Unknown"
  if (isMobile) deviceType = "Mobile"
  if (isTablet) deviceType = "Tablet"
  if (isDesktop) deviceType = "Desktop"

  return {
    deviceType,
    userAgent,
  }
}

// Login user
export async function login(formData: FormData) {
  try {
    console.log("Login attempt started")
    await connectToMongoDB()
    
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const userAgent = (formData.get("userAgent") as string) || "Unknown"
    const ipAddress = (formData.get("ipAddress") as string) || "Unknown"

    if (!email || !password) {
      console.log("Missing email or password")
      return { success: false, message: "Email and password are required" }
    }

    console.log(`Login attempt for email: ${email}`)

    // Get user from database
    const user = await User.findOne({ email }).lean()

    if (!user) {
      console.log(`User not found: ${email}`)
      return { success: false, message: "Invalid email or password" }
    }

    console.log(`User found: ${user._id}, role: ${user.role}`)

    // Verify password
    const passwordValid = await comparePassword(password, user.password_hash)

    // Get user agent details
    const { deviceType } = getUserAgentDetails(userAgent)

    // Record login attempt
    await LoginActivity.create({
      user_id: user._id,
      timestamp: new Date(),
      ip_address: ipAddress,
      user_agent: userAgent,
      success: passwordValid,
      device_type: deviceType,
    })

    if (!passwordValid) {
      console.log(`Invalid password for user: ${user._id}`)
      return { success: false, message: "Invalid email or password" }
    }

    console.log(`Login successful for user: ${user._id}`)

    // Create JWT token
    const token = await new SignJWT({
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      profilePictureUrl: user.profile_picture_url || null,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION)
      .sign(new TextEncoder().encode(JWT_SECRET))

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("session", token, COOKIE_SETTINGS)

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user._id.toString(),
        role: user.role,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        profilePictureUrl: user.profile_picture_url || null,
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: `Login failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Register user
export async function register(formData: FormData) {
  try {
    await connectToMongoDB()
    
    const role = String(formData.get("role") || "")
    const firstName = String(formData.get("firstName") || "").trim()
    const lastName = String(formData.get("lastName") || "").trim()
    const email = String(formData.get("email") || "").trim().toLowerCase()
    const password = String(formData.get("password") || "")
    const userAgent = (formData.get("userAgent") as string) || "Unknown"
    const ipAddress = (formData.get("ipAddress") as string) || "Unknown"

    if (!role || !firstName || !email || !password) {
      return { success: false, message: "Name, role, email, and password are required." }
    }

    if (role !== "faculty" && role !== "student") {
      return { success: false, message: "Invalid role" }
    }

    if (password.length < 8) {
      return { success: false, message: "Password must be at least 8 characters." }
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      await PendingRegistration.deleteMany({ email })

      return {
        success: false,
        message:
          existingUser.role === role
            ? "Email already in use"
            : `This email is already registered as a ${existingUser.role}. Use a different email for a ${role} account.`,
      }
    }

    const verificationToken = crypto.randomBytes(32).toString("base64url")
    const verificationTokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex")
    const now = new Date()

    await PendingRegistration.findOneAndUpdate(
      { email },
      {
        $set: {
          role,
          first_name: firstName,
          last_name: lastName,
          email,
          password_hash: await hashPassword(password),
          verification_token_hash: verificationTokenHash,
          expires_at: new Date(now.getTime() + VERIFICATION_TOKEN_TTL_MS),
          last_sent_at: now,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
        $setOnInsert: {
          created_at: now,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    await sendVerificationEmail({
      to: email,
      firstName,
      verificationUrl: createVerificationUrl(verificationToken),
    })

    return {
      success: true,
      message: "Verification email sent. Check your inbox to complete registration.",
      data: { email },
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Registration failed",
    }
  }
}

// Register faculty
export async function registerFaculty(data: any) {
  const formData = new FormData()
  formData.set("role", "faculty")
  formData.set("firstName", data.firstName || "")
  formData.set("lastName", data.lastName || "")
  formData.set("email", data.email || "")
  formData.set("password", data.password || "")

  return register(formData)
}

// Register student
export async function registerStudent(data: any) {
  const formData = new FormData()
  formData.set("role", "student")
  formData.set("firstName", data.firstName || "")
  formData.set("lastName", data.lastName || "")
  formData.set("email", data.email || "")
  formData.set("password", data.password || "")

  return register(formData)
}

// Logout user
export async function logout() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("session")
    return { success: true, message: "Logout successful" }
  } catch (error) {
    console.error("Logout error:", error)
    return {
      success: false,
      message: `Logout failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    await connectToMongoDB()
    
    const cookieStore = await cookies()
    const session = cookieStore.get("session")?.value

    if (!session) {
      return { success: false, message: "Not authenticated" }
    }

    // Verify token
    try {
      const { payload } = await jwtVerify(session, new TextEncoder().encode(JWT_SECRET))

      if (!payload.id) {
        return { success: false, message: "Invalid session" }
      }

      // Get user (convert string ID to ObjectId)
      const user = await User.findById(toObjectId(payload.id as string)).lean()

      if (!user) {
        return { success: false, message: "User not found" }
      }

      // Get profile
      let profile = null
      if (user.role === "faculty") {
        const facultyProfile = await FacultyProfile.findOne({ user_id: user._id }).lean()
        profile = facultyProfile ? toPlainObject(facultyProfile) : null
      } else if (user.role === "student") {
        const studentProfile = await StudentProfile.findOne({ user_id: user._id }).lean()
        profile = studentProfile ? toPlainObject(studentProfile) : null
      }

      return {
        success: true,
        user: {
          ...toPlainObject(user),
          profile,
        },
      }
    } catch (error) {
      console.error("Token verification error:", error)
      return { success: false, message: "Invalid session" }
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return {
      success: false,
      message: `Failed to get current user: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const result = await getCurrentUser()
  return result.success
}

// Redirect if not authenticated
export async function requireAuth() {
  const isAuthed = await isAuthenticated()
  if (!isAuthed) {
    redirect("/login")
  }
}

// Redirect if already authenticated
export async function redirectIfAuthenticated() {
  const isAuthed = await isAuthenticated()
  if (isAuthed) {
    const { user } = (await getCurrentUser()) as any
    if (user.role === "faculty") {
      redirect("/dashboard/faculty")
    } else {
      redirect("/dashboard/student")
    }
  }
}
