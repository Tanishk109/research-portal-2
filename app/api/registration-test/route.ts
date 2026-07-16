import type { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { hashPassword } from "@/lib/db"
import { connectToMongoDB } from "@/lib/mongodb"
import { FacultyProfile, StudentProfile, User } from "@/lib/models"

// POST /api/registration-test - Create test user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role, email } = body
    await connectToMongoDB()

    console.log(`Creating test ${role} user...`)

    const timestamp = Date.now()
    const testEmail = email || `test.${role}.${timestamp}@example.com`
    const password = "password123"

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create test data based on role
    const testData =
      role === "faculty"
        ? {
            role: "faculty",
            firstName: "Test",
            lastName: "Faculty",
            email: testEmail,
            password_hash: hashedPassword,
            facultyId: `FAC${timestamp}`,
            department: "Computer Science",
            specialization: "Artificial Intelligence",
            dateOfJoining: "2023-01-01",
            dateOfBirth: "1980-01-01",
          }
        : {
            role: "student",
            firstName: "Test",
            lastName: "Student",
            email: testEmail,
            password_hash: hashedPassword,
            registrationNumber: `STU${timestamp}`,
            department: "Computer Science",
            year: "3",
            cgpa: 8.5,
          }

    const user = await User.create({
      role: testData.role as "faculty" | "student",
      first_name: testData.firstName,
      last_name: testData.lastName,
      email: testData.email,
      password_hash: testData.password_hash,
    })

    if (role === "faculty" && "facultyId" in testData) {
      await FacultyProfile.create({
        user_id: user._id,
        faculty_id: testData.facultyId,
        department: testData.department,
        specialization: testData.specialization,
        date_of_joining: new Date(testData.dateOfJoining || "2023-01-01"),
        date_of_birth: new Date(testData.dateOfBirth || "1980-01-01"),
      })
    } else if ("registrationNumber" in testData) {
      await StudentProfile.create({
        user_id: user._id,
        registration_number: testData.registrationNumber,
        department: testData.department,
        year: testData.year,
        cgpa: testData.cgpa,
      })
    }

    console.log(`Test ${role} user created successfully:`, user.email)

    return createApiResponse(true, `Test ${role} user created successfully`, {
      user: {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        password: password, // Include for testing purposes
      },
    })
  } catch (error) {
    console.error("Test user creation failed:", error)
    return handleApiError(error, "Failed to create test user")
  }
}
