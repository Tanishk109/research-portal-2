"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql, hashPassword, comparePassword } from "@/lib/db"
import { jwtVerify, SignJWT } from "jose"
import { nanoid } from "nanoid"
import { JWT_SECRET, COOKIE_SETTINGS, JWT_EXPIRATION } from "@/lib/env"

// Get user agent details
function getUserAgentDetails(userAgent: string) {
  // Simple device detection
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent)
  const isTablet = /tablet|ipad/i.test(userAgent)
  const isDesktop = !isMobile && !isTablet

  let deviceType = "Unknown"
  if (isMobile) deviceType = "Mobile"
  if (isTablet) deviceType = "Tablet"
  if (isDesktop) deviceType = "Desktop"

  // Simple browser detection
  let browser = "Unknown"
  if (userAgent.includes("Firefox")) browser = "Firefox"
  if (userAgent.includes("Chrome")) browser = "Chrome"
  if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari"
  if (userAgent.includes("Edge")) browser = "Edge"
  if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) browser = "Internet Explorer"

  return {
    deviceType,
    browser,
    userAgent,
  }
}

// Login user
export async function login(formData: FormData) {
  try {
    console.log("Login attempt started")
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const userAgent = (formData.get("userAgent") as string) || "Unknown"
    const ipAddress = (formData.get("ipAddress") as string) || "Unknown"

    // Validate input
    if (!email || !password) {
      console.log("Missing email or password")
      return { success: false, message: "Email and password are required" }
    }

    console.log(`Login attempt for email: ${email}`)

    // Get user from database
    const users = await sql`
      SELECT 
        u.id, u.role, u.first_name, u.last_name, u.email, u.password_hash
      FROM 
        users u
      WHERE 
        u.email = ${email}
    `

    if (users.length === 0) {
      console.log(`User not found: ${email}`)
      return { success: false, message: "Invalid email or password" }
    }

    const user = users[0]
    console.log(`User found: ${user.id}, role: ${user.role}`)

    // Verify password
    const passwordValid = await comparePassword(password, user.password_hash)

    // Get user agent details
    const { deviceType, browser } = getUserAgentDetails(userAgent)

    // Record login attempt
    await sql`
      INSERT INTO login_activity (
        user_id, timestamp, ip_address, user_agent, success, device_type
      ) VALUES (
        ${user.id}, CURRENT_TIMESTAMP, ${ipAddress}, ${userAgent}, ${passwordValid}, ${deviceType}
      )
    `

    if (!passwordValid) {
      console.log(`Invalid password for user: ${user.id}`)
      return { success: false, message: "Invalid email or password" }
    }

    console.log(`Login successful for user: ${user.id}`)

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

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
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
    console.log("Registration started")
    const role = formData.get("role") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const userAgent = (formData.get("userAgent") as string) || "Unknown"
    const ipAddress = (formData.get("ipAddress") as string) || "Unknown"

    // Role-specific fields
    const facultyId = formData.get("facultyId") as string
    const department = formData.get("department") as string
    const specialization = formData.get("specialization") as string
    const dateOfJoining = formData.get("dateOfJoining") as string
    const dateOfBirth = formData.get("dateOfBirth") as string
    const registrationNumber = formData.get("registrationNumber") as string
    const year = formData.get("year") as string
    const cgpa = formData.get("cgpa") as string

    // Validate input
    if (!role || !firstName || !lastName || !email || !password) {
      console.log("Missing required fields")
      return { success: false, message: "All fields are required" }
    }

    // Validate role-specific fields
    if (role === "faculty") {
      if (!facultyId || !department || !specialization || !dateOfJoining || !dateOfBirth) {
        console.log("Missing faculty-specific fields")
        return { success: false, message: "All faculty fields are required" }
      }
    } else if (role === "student") {
      if (!registrationNumber || !department || !year || !cgpa) {
        console.log("Missing student-specific fields")
        return { success: false, message: "All student fields are required" }
      }
    } else {
      console.log(`Invalid role: ${role}`)
      return { success: false, message: "Invalid role" }
    }

    console.log(`Registration attempt for email: ${email}, role: ${role}`)

    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      console.log(`Email already exists: ${email}`)
      return { success: false, message: "Email already in use" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Start a transaction
    const result = await sql.begin(async (sql) => {
      // Insert user
      const user = await sql`
        INSERT INTO users (
          role, first_name, last_name, email, password_hash
        ) VALUES (
          ${role}, ${firstName}, ${lastName}, ${email}, ${hashedPassword}
        ) RETURNING id, role, first_name, last_name, email, created_at, updated_at
      `

      // Insert role-specific profile
      if (role === "faculty") {
        await sql`
          INSERT INTO faculty_profiles (
            user_id, faculty_id, department, specialization, date_of_joining, date_of_birth
          ) VALUES (
            ${user[0].id}, ${facultyId}, ${department}, ${specialization}, 
            ${dateOfJoining}, ${dateOfBirth}
          )
        `
      } else if (role === "student") {
        await sql`
          INSERT INTO student_profiles (
            user_id, registration_number, department, year, cgpa
          ) VALUES (
            ${user[0].id}, ${registrationNumber}, ${department}, ${year}, ${Number.parseFloat(cgpa)}
          )
        `
      }

      // Get user agent details
      const { deviceType } = getUserAgentDetails(userAgent)

      // Record successful registration as a login
      await sql`
        INSERT INTO login_activity (
          user_id, timestamp, ip_address, user_agent, success, device_type
        ) VALUES (
          ${user[0].id}, CURRENT_TIMESTAMP, ${ipAddress}, ${userAgent}, true, ${deviceType}
        )
      `

      return user[0]
    })

    console.log(`Registration successful for user: ${result.id}`)

    // Create JWT token
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
    cookies().set("session", token, COOKIE_SETTINGS)

    return {
      success: true,
      message: "Registration successful",
      user: {
        id: result.id,
        role: result.role,
        name: `${result.first_name} ${result.last_name}`,
        email: result.email,
      },
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      message: `Registration failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Register faculty
export async function registerFaculty(data: any) {
  const formData = new FormData()
  formData.set("role", "faculty")
  formData.set("firstName", data.firstName)
  formData.set("lastName", data.lastName)
  formData.set("email", data.email)
  formData.set("password", data.password)
  formData.set("facultyId", data.facultyId)
  formData.set("department", data.department)
  formData.set("specialization", data.specialization)
  formData.set("dateOfJoining", data.doj)
  formData.set("dateOfBirth", data.dob)

  return register(formData)
}

// Register student
export async function registerStudent(data: any) {
  const formData = new FormData()
  formData.set("role", "student")
  formData.set("firstName", data.firstName)
  formData.set("lastName", data.lastName)
  formData.set("email", data.email)
  formData.set("password", data.password)
  formData.set("registrationNumber", data.registrationNumber)
  formData.set("department", data.department)
  formData.set("year", data.year)
  formData.set("cgpa", data.cgpa)

  return register(formData)
}

// Logout user
export async function logout() {
  try {
    cookies().delete("session")
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
    const session = cookies().get("session")?.value

    if (!session) {
      return { success: false, message: "Not authenticated" }
    }

    // Verify token
    try {
      const { payload } = await jwtVerify(session, new TextEncoder().encode(JWT_SECRET))

      if (!payload.id) {
        return { success: false, message: "Invalid session" }
      }

      // Get user
      const users = await sql`
        SELECT 
          id, role, first_name, last_name, email, created_at, updated_at
        FROM 
          users
        WHERE 
          id = ${payload.id}
      `

      if (users.length === 0) {
        return { success: false, message: "User not found" }
      }

      const user = users[0]

      // Get profile
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
        profile = facultyProfiles[0]
      } else if (user.role === "student") {
        const studentProfiles = await sql`
          SELECT 
            registration_number, department, year, cgpa
          FROM 
            student_profiles
          WHERE 
            user_id = ${user.id}
        `
        profile = studentProfiles[0]
      }

      return {
        success: true,
        user: {
          ...user,
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
