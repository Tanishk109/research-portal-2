"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { hashPassword, comparePassword, toPlainObject, toObjectId } from "@/lib/db"
import { connectToMongoDB } from "@/lib/mongodb"
import { User, LoginActivity, FacultyProfile, StudentProfile } from "@/lib/models"
import { jwtVerify, SignJWT } from "jose"
import { nanoid } from "nanoid"
import { JWT_SECRET, COOKIE_SETTINGS, JWT_EXPIRATION } from "@/lib/env"

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
        id: user._id.toString(),
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
    await connectToMongoDB()
    
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
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      console.log(`Email already exists: ${email}`)
      return { success: false, message: "Email already in use" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await User.create({
      role: role as "faculty" | "student",
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: hashedPassword,
    })

    // Create role-specific profile
    if (role === "faculty") {
      await FacultyProfile.create({
        user_id: user._id,
        faculty_id: facultyId,
        department,
        specialization,
        date_of_joining: new Date(dateOfJoining),
        date_of_birth: new Date(dateOfBirth),
      })
    } else if (role === "student") {
      await StudentProfile.create({
        user_id: user._id,
        registration_number: registrationNumber,
        department,
        year,
        cgpa: Number.parseFloat(cgpa),
      })
    }

    // Get user agent details
    const { deviceType } = getUserAgentDetails(userAgent)

    // Record successful registration as a login
    await LoginActivity.create({
      user_id: user._id,
      timestamp: new Date(),
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true,
      device_type: deviceType,
    })

    const userData = toPlainObject(user)
    return userData
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "Registration failed" }
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
    await connectToMongoDB()
    
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
