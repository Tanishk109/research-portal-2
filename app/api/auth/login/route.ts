import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { comparePassword } from "@/lib/db"
import { SignJWT } from "jose"
import { nanoid } from "nanoid"
import { JWT_SECRET, JWT_EXPIRATION, COOKIE_SETTINGS } from "@/lib/env"
import { cookies } from "next/headers"

// POST /api/auth/login - Login user
export async function POST(request: NextRequest) {
  try {
    console.log("Login request received")
    const body = await request.json()

    const { email, password, userAgent, ipAddress } = body

    // Validate input
    if (!email || !password) {
      console.log("Missing email or password")
      return createApiResponse(false, "Email and password are required", null, 400)
    }

    console.log(`Login attempt for email: ${email}`)

    // Get user from database
    const users = await sql`
      SELECT 
        u.id, u.role, u.first_name, u.last_name, u.email, u.password_hash,
        u.created_at, u.updated_at
      FROM 
        users u
      WHERE 
        u.email = ${email}
    `

    if (users.length === 0) {
      console.log(`User not found: ${email}`)
      // Record failed login attempt
      await sql`
        INSERT INTO login_activity (
          user_id, timestamp, ip_address, user_agent, success, device_type
        ) VALUES (
          NULL, CURRENT_TIMESTAMP, ${ipAddress || "unknown"}, 
          ${userAgent || "unknown"}, false, 'Web'
        )
      `
      return createApiResponse(false, "Invalid email or password", null, 401)
    }

    const user = users[0]
    console.log(`User found: ${user.id}, role: ${user.role}`)

    // Verify password
    const passwordValid = await comparePassword(password, user.password_hash)

    // Record login attempt
    await sql`
      INSERT INTO login_activity (
        user_id, timestamp, ip_address, user_agent, success, device_type
      ) VALUES (
        ${user.id}, CURRENT_TIMESTAMP, ${ipAddress || "unknown"}, 
        ${userAgent || "unknown"}, ${passwordValid}, 'Web'
      )
    `

    if (!passwordValid) {
      console.log(`Invalid password for user: ${user.id}`)
      return createApiResponse(false, "Invalid email or password", null, 401)
    }

    console.log(`Login successful for user: ${user.id}`)

    // Get user profile
    let profile = null
    if (user.role === "faculty") {
      const facultyProfiles = await sql`
        SELECT 
          faculty_id, department, specialization, date_of_joining, date_of_birth
        FROM 
          faculty_profiles
        WHERE 
          user_id = ${user.id}
      `
      profile = facultyProfiles[0] || null
    } else if (user.role === "student") {
      const studentProfiles = await sql`
        SELECT 
          registration_number, department, year, cgpa
        FROM 
          student_profiles
        WHERE 
          user_id = ${user.id}
      `
      profile = studentProfiles[0] || null
    }

    // Create JWT token
    const token = await new SignJWT({
      id: user.id,
      role: user.role,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION)
      .sign(new TextEncoder().encode(JWT_SECRET))

    // Set cookie
    cookies().set("session", token, COOKIE_SETTINGS)

    return createApiResponse(true, "Login successful", {
      user: {
        id: user.id,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        profile,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return handleApiError(error, "Login failed")
  }
}
