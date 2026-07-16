"use server"

import { hashPassword } from "@/lib/db"
import { connectToMongoDB } from "@/lib/mongodb"
import { FacultyProfile, StudentProfile, User } from "@/lib/models"

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

    await connectToMongoDB()

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
      const existingUser = await User.findOne({ email: account.email }).lean()

      if (existingUser) {
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

      const user = await User.create({
        role: account.role,
        first_name: account.firstName,
        last_name: account.lastName,
        email: account.email,
        password_hash: passwordHash,
      })

      if (account.role === "faculty") {
        await FacultyProfile.create({
          user_id: user._id,
          faculty_id: "FAC" + Math.floor(10000 + Math.random() * 90000),
          department: "Computer Science",
          specialization: "Artificial Intelligence",
          date_of_joining: new Date(),
          date_of_birth: new Date("1980-01-01"),
        })
      } else {
        await StudentProfile.create({
          user_id: user._id,
          registration_number: "STU" + Math.floor(10000 + Math.random() * 90000),
          department: "Computer Science",
          year: "3",
          cgpa: 8.5,
        })
      }

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
