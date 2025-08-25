import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { hashPassword } from "@/lib/db"

// POST /api/registration-test - Create test user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role, email } = body

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

    // Insert user and profile in transaction
    const result = await sql.begin(async (sql: any) => {
      // Insert user
      const users = await sql`
        INSERT INTO users (
          role, first_name, last_name, email, password_hash, created_at, updated_at
        ) VALUES (
          ${testData.role}, ${testData.firstName}, ${testData.lastName}, 
          ${testData.email}, ${testData.password_hash}, 
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id, role, first_name, last_name, email, created_at
      `

      const user = users[0]

      // Insert role-specific profile
      if (role === "faculty") {
        await sql`
          INSERT INTO faculty_profiles (
            user_id, faculty_id, department, specialization, 
            date_of_joining, date_of_birth, created_at, updated_at
          ) VALUES (
            ${user.id}, ${testData.facultyId}, ${testData.department}, 
            ${testData.specialization}, ${testData.dateOfJoining}, 
            ${testData.dateOfBirth}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `
      } else {
        await sql`
          INSERT INTO student_profiles (
            user_id, registration_number, department, year, cgpa, 
            created_at, updated_at
          ) VALUES (
            ${user.id}, ${testData.registrationNumber}, ${testData.department}, 
            ${testData.year}, ${testData.cgpa}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `
      }

      return user
    })

    console.log(`Test ${role} user created successfully:`, result.email)

    return createApiResponse(true, `Test ${role} user created successfully`, {
      user: {
        id: result.id,
        role: result.role,
        email: result.email,
        name: `${result.first_name} ${result.last_name}`,
        password: password, // Include for testing purposes
      },
    })
  } catch (error) {
    console.error("Test user creation failed:", error)
    return handleApiError(error, "Failed to create test user")
  }
}
