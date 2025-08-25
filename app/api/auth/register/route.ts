import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { hashPassword } from "@/lib/db"
import { SignJWT } from "jose"
import { nanoid } from "nanoid"
import { JWT_SECRET, JWT_EXPIRATION, COOKIE_SETTINGS } from "@/lib/env"
import { cookies } from "next/headers"

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    console.log("Registration request received")
    const body = await request.json()

    const {
      role,
      firstName,
      lastName,
      email,
      password,
      // Faculty specific fields
      facultyId,
      department,
      specialization,
      dateOfJoining,
      dateOfBirth,
      // Student specific fields
      registrationNumber,
      year,
      cgpa,
      // Additional fields
      userAgent,
      ipAddress,
    } = body

    console.log(`Registration attempt for: ${email}, role: ${role}`)

    // Validate required fields
    if (!role || !firstName || !lastName || !email || !password) {
      console.log("Missing required fields")
      return createApiResponse(false, null, undefined, "All required fields must be provided")
    }

    // Validate role-specific fields
    if (role === "faculty") {
      if (!facultyId || !department || !specialization || !dateOfJoining || !dateOfBirth) {
        console.log("Missing faculty-specific fields")
        return createApiResponse(false, null, undefined, "All faculty fields are required")
      }
    } else if (role === "student") {
      if (!registrationNumber || !department || !year || !cgpa) {
        console.log("Missing student-specific fields")
        return createApiResponse(false, null, undefined, "All student fields are required")
      }
    } else {
      console.log(`Invalid role: ${role}`)
      return createApiResponse(false, null, undefined, "Invalid role specified")
    }

    // Check if email already exists
    console.log("Checking if email already exists...")
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      console.log(`Email already exists: ${email}`)
      return createApiResponse(false, null, undefined, "Email address is already registered")
    }

    // Hash password
    console.log("Hashing password...")
    const hashedPassword = await hashPassword(password)

      // Insert user
      console.log("Inserting user...")
      const users = await sql`
        INSERT INTO users (
          role, first_name, last_name, email, password_hash, created_at, updated_at
        ) VALUES (
          ${role}, ${firstName}, ${lastName}, ${email}, ${hashedPassword}, 
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `

    // Get the inserted user ID
    const insertedUser = await sql`
      SELECT id, role, first_name, last_name, email, created_at 
      FROM users 
      WHERE email = ${email}
    `
    const user = insertedUser[0]
      console.log(`User created with ID: ${user.id}`)

      // Insert role-specific profile
      if (role === "faculty") {
        console.log("Creating faculty profile...")
        await sql`
          INSERT INTO faculty_profiles (
            user_id, faculty_id, department, specialization, 
            date_of_joining, date_of_birth, created_at, updated_at
          ) VALUES (
            ${user.id}, ${facultyId}, ${department}, ${specialization}, 
            ${dateOfJoining}, ${dateOfBirth}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `
      } else if (role === "student") {
        console.log("Creating student profile...")
        await sql`
          INSERT INTO student_profiles (
            user_id, registration_number, department, year, cgpa, 
            created_at, updated_at
          ) VALUES (
            ${user.id}, ${registrationNumber}, ${department}, ${year}, 
            ${Number.parseFloat(cgpa)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `
      }

      // Record login activity
      console.log("Recording login activity...")
      await sql`
        INSERT INTO login_activity (
          user_id, timestamp, ip_address, user_agent, success, device_type
        ) VALUES (
          ${user.id}, CURRENT_TIMESTAMP, ${ipAddress || "unknown"}, 
          ${userAgent || "unknown"}, true, 'Web'
        )
      `

    const result = user

    console.log("Transaction completed successfully")

    // Create JWT token
    console.log("Creating JWT token...")
    const token = await new SignJWT({
      id: result.id,
      role: result.role,
      email: result.email,
      name: `${result.first_name} ${result.last_name}`,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION)
      .sign(new TextEncoder().encode(JWT_SECRET))

    // Set cookie
    console.log("Setting session cookie...")
    cookies().set("session", token, COOKIE_SETTINGS)

    console.log(`Registration successful for user: ${result.id}`)

    return createApiResponse(true, {
      user: {
        id: result.id,
        role: result.role,
        firstName: result.first_name,
        lastName: result.last_name,
        email: result.email,
        name: `${result.first_name} ${result.last_name}`,
      },
    }, "Registration successful")
  } catch (error) {
    console.error("Registration error:", error)
    return handleApiError(error, "Registration failed")
  }
}
