"use server"

import { sql, hashPassword } from "@/lib/db"
import { checkAndSetupDatabase } from "./setup-db"

type TestAccount = {
  email: string
  password: string
  role: "faculty" | "student"
  firstName: string
  lastName: string
}

export async function seedTestAccounts() {
  try {
    console.log("Starting database seeding process...")

    // First, ensure database schema is set up
    const dbSetup = await checkAndSetupDatabase()
    if (!dbSetup.success) {
      return {
        success: false,
        message: "Database schema setup failed. Cannot seed test accounts.",
      }
    }

    // Create test accounts
    const facultyAccounts: TestAccount[] = [
      {
        email: "faculty1@test.com",
        password: "password123",
        role: "faculty",
        firstName: "John",
        lastName: "Smith",
      },
      {
        email: "faculty2@test.com",
        password: "password123",
        role: "faculty",
        firstName: "Sarah",
        lastName: "Johnson",
      },
      {
        email: "faculty3@test.com",
        password: "password123",
        role: "faculty",
        firstName: "Michael",
        lastName: "Williams",
      },
    ]

    const studentAccounts: TestAccount[] = [
      {
        email: "student1@test.com",
        password: "password123",
        role: "student",
        firstName: "Emily",
        lastName: "Davis",
      },
      {
        email: "student2@test.com",
        password: "password123",
        role: "student",
        firstName: "David",
        lastName: "Brown",
      },
    ]

    const allAccounts = [...facultyAccounts, ...studentAccounts]
    const createdAccounts = []

    // Create each account
    for (const account of allAccounts) {
      // Check if account already exists
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${account.email}
      `

      if (existingUser.length > 0) {
        console.log(`Account with email ${account.email} already exists, skipping...`)
        createdAccounts.push({
          email: account.email,
          password: account.password,
          role: account.role,
          status: "already exists",
        })
        continue
      }

      // Hash password
      const passwordHash = await hashPassword(account.password)

      // Begin transaction
      await sql.begin(async (tx) => {
        // Create user
        const newUser = await tx`
          INSERT INTO users (role, first_name, last_name, email, password_hash)
          VALUES (${account.role}, ${account.firstName}, ${account.lastName}, ${account.email}, ${passwordHash})
          RETURNING id
        `

        const userId = newUser[0].id

        // Create profile based on role
        if (account.role === "faculty") {
          await tx`
            INSERT INTO faculty_profiles (
              user_id, faculty_id, department, specialization, date_of_joining, date_of_birth
            )
            VALUES (
              ${userId}, 
              ${"FAC" + Math.floor(10000 + Math.random() * 90000)}, 
              ${"Computer Science"}, 
              ${"Artificial Intelligence"}, 
              ${new Date().toISOString().split("T")[0]}, 
              ${"1980-01-01"}
            )
          `
        } else {
          await tx`
            INSERT INTO student_profiles (
              user_id, registration_number, department, year, cgpa
            )
            VALUES (
              ${userId}, 
              ${"STU" + Math.floor(10000 + Math.random() * 90000)}, 
              ${"Computer Science"}, 
              ${"3"}, 
              ${8.5}
            )
          `
        }
      })

      console.log(`Created ${account.role} account: ${account.email}`)
      createdAccounts.push({
        email: account.email,
        password: account.password,
        role: account.role,
        status: "created",
      })
    }

    return {
      success: true,
      message: `Successfully processed ${createdAccounts.length} test accounts.`,
      accounts: createdAccounts,
    }
  } catch (error) {
    console.error("Error seeding test accounts:", error)
    return {
      success: false,
      message: `Failed to seed test accounts: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
