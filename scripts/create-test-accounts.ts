const { sql, hashPassword } = require("../lib/db")

interface TestUser {
  role: "faculty" | "student"
  firstName: string
  lastName: string
  email: string
  password: string
  facultyId?: string
  department: string
  specialization?: string
  dateOfJoining?: string
  dateOfBirth?: string
  registrationNumber?: string
  year?: string
  cgpa?: string
}

const testUsers: TestUser[] = [
  // Faculty users
  {
    role: "faculty",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@faculty.test",
    password: "password123",
    facultyId: "FAC001",
    department: "Computer Science",
    specialization: "Machine Learning",
    dateOfJoining: "2020-01-15",
    dateOfBirth: "1980-05-10",
  },
  {
    role: "faculty",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@faculty.test",
    password: "password123",
    facultyId: "FAC002",
    department: "Electronics",
    specialization: "Signal Processing",
    dateOfJoining: "2019-08-20",
    dateOfBirth: "1975-12-03",
  },
  {
    role: "faculty",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@faculty.test",
    password: "password123",
    facultyId: "FAC003",
    department: "Mechanical Engineering",
    specialization: "Robotics",
    dateOfJoining: "2021-03-10",
    dateOfBirth: "1982-09-15",
  },
  // Student users
  {
    role: "student",
    firstName: "Alice",
    lastName: "Wilson",
    email: "alice.wilson@student.test",
    password: "password123",
    registrationNumber: "STU001",
    department: "Computer Science",
    year: "3",
    cgpa: "8.5",
  },
  {
    role: "student",
    firstName: "Bob",
    lastName: "Davis",
    email: "bob.davis@student.test",
    password: "password123",
    registrationNumber: "STU002",
    department: "Electronics",
    year: "2",
    cgpa: "7.8",
  },
  {
    role: "student",
    firstName: "Carol",
    lastName: "Miller",
    email: "carol.miller@student.test",
    password: "password123",
    registrationNumber: "STU003",
    department: "Mechanical Engineering",
    year: "4",
    cgpa: "9.1",
  },
  {
    role: "student",
    firstName: "David",
    lastName: "Garcia",
    email: "david.garcia@student.test",
    password: "password123",
    registrationNumber: "STU004",
    department: "Computer Science",
    year: "1",
    cgpa: "8.0",
  },
]

async function createTestAccounts() {
  try {
    console.log("🚀 Creating test accounts...")

    for (const user of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await sql`
          SELECT id FROM users WHERE email = ${user.email}
        `

        if (existingUser.length > 0) {
          console.log(`⏭️  User ${user.email} already exists, skipping...`)
          continue
        }

        // Hash password
        const passwordHash = await hashPassword(user.password)

        // Create user
        const userResult = await sql`
          INSERT INTO users (role, first_name, last_name, email, password_hash)
          VALUES (${user.role}, ${user.firstName}, ${user.lastName}, ${user.email}, ${passwordHash})
        `

        const userId = (userResult as any).insertId

        // Create profile based on role
        if (user.role === "faculty") {
          await sql`
            INSERT INTO faculty_profiles (
              user_id, faculty_id, department, specialization, 
              date_of_joining, date_of_birth
            )
            VALUES (
              ${userId}, ${user.facultyId}, ${user.department}, 
              ${user.specialization}, ${user.dateOfJoining}, ${user.dateOfBirth}
            )
          `
        } else {
          await sql`
            INSERT INTO student_profiles (
              user_id, registration_number, department, year, cgpa
            )
            VALUES (
              ${userId}, ${user.registrationNumber}, ${user.department}, 
              ${user.year}, ${user.cgpa}
            )
          `
        }

        console.log(`✅ Created ${user.role}: ${user.firstName} ${user.lastName} (${user.email})`)
      } catch (error) {
        console.error(`❌ Failed to create user ${user.email}:`, error)
      }
    }

    // Show summary
    const userCounts = await sql`
      SELECT 
        role,
        COUNT(*) as count
      FROM users 
      GROUP BY role
    `

    console.log("\n📊 User Summary:")
    userCounts.forEach((row: any) => {
      console.log(`   ${row.role}: ${row.count} users`)
    })

    console.log("\n🎉 Test accounts created successfully!")
    console.log("\n📋 Test Credentials:")
    console.log("Faculty Accounts:")
    testUsers
      .filter((u) => u.role === "faculty")
      .forEach((u) => {
        console.log(`   📧 ${u.email} | 🔑 ${u.password}`)
      })
    console.log("Student Accounts:")
    testUsers
      .filter((u) => u.role === "student")
      .forEach((u) => {
        console.log(`   📧 ${u.email} | 🔑 ${u.password}`)
      })
  } catch (error) {
    console.error("❌ Failed to create test accounts:", error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  createTestAccounts()
    .then(() => {
      console.log("✨ All done!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Failed:", error)
      process.exit(1)
    })
}

export { createTestAccounts }
