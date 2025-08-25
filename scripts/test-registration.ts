import { sql } from "../lib/db"
import { hashPassword } from "../lib/db"

async function testRegistration() {
  try {
    console.log("🧪 Testing Registration Functionality...")

    // Test 1: Database Connection
    console.log("\n1. Testing database connection...")
    const connectionTest = await sql`SELECT 1 as test`
    if (connectionTest[0].test === 1) {
      console.log("✅ Database connection successful")
    } else {
      throw new Error("Database connection failed")
    }

    // Test 2: Check Tables
    console.log("\n2. Checking required tables...")
    const tables = ["users", "faculty_profiles", "student_profiles", "login_activity"]

    for (const table of tables) {
      try {
        const result = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`
        console.log(`✅ Table '${table}' exists with ${result[0].count} records`)
      } catch (error) {
        console.log(`❌ Table '${table}' missing or inaccessible`)
        throw error
      }
    }

    // Test 3: Password Hashing
    console.log("\n3. Testing password hashing...")
    const testPassword = "TestPassword123!"
    const hashedPassword = await hashPassword(testPassword)
    if (hashedPassword && hashedPassword.length > 50) {
      console.log("✅ Password hashing working correctly")
    } else {
      throw new Error("Password hashing failed")
    }

    // Test 4: Faculty Registration
    console.log("\n4. Testing faculty registration...")
    const facultyEmail = `test.faculty.${Date.now()}@example.com`

    const facultyResult = await sql.begin(async (sql: any) => {
      // Insert user
      const users = await sql`
        INSERT INTO users (
          role, first_name, last_name, email, password_hash, created_at, updated_at
        ) VALUES (
          'faculty', 'Test', 'Faculty', ${facultyEmail}, ${hashedPassword}, 
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id, role, first_name, last_name, email
      `

      const user = users[0]

      // Insert faculty profile
      await sql`
        INSERT INTO faculty_profiles (
          user_id, faculty_id, department, specialization, 
          date_of_joining, date_of_birth, created_at, updated_at
        ) VALUES (
          ${user.id}, 'TEST001', 'Computer Science', 'Machine Learning', 
          '2023-01-01', '1980-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `

      return user
    })

    console.log(`✅ Faculty user created: ${facultyResult.email} (ID: ${facultyResult.id})`)

    // Test 5: Student Registration
    console.log("\n5. Testing student registration...")
    const studentEmail = `test.student.${Date.now()}@example.com`

    const studentResult = await sql.begin(async (sql: any) => {
      // Insert user
      const users = await sql`
        INSERT INTO users (
          role, first_name, last_name, email, password_hash, created_at, updated_at
        ) VALUES (
          'student', 'Test', 'Student', ${studentEmail}, ${hashedPassword}, 
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id, role, first_name, last_name, email
      `

      const user = users[0]

      // Insert student profile
      await sql`
        INSERT INTO student_profiles (
          user_id, registration_number, department, year, cgpa, 
          created_at, updated_at
        ) VALUES (
          ${user.id}, 'TEST001', 'Computer Science', 3, 8.5, 
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `

      return user
    })

    console.log(`✅ Student user created: ${studentResult.email} (ID: ${studentResult.id})`)

    // Test 6: Login Activity Recording
    console.log("\n6. Testing login activity recording...")
    await sql`
      INSERT INTO login_activity (
        user_id, timestamp, ip_address, user_agent, success, device_type
      ) VALUES (
        ${facultyResult.id}, CURRENT_TIMESTAMP, '127.0.0.1', 'Test Agent', true, 'Web'
      )
    `
    console.log("✅ Login activity recorded successfully")

    // Final Statistics
    console.log("\n📊 Final Statistics:")
    const finalUserCount = await sql`SELECT COUNT(*) as count FROM users`
    const finalFacultyCount = await sql`SELECT COUNT(*) as count FROM faculty_profiles`
    const finalStudentCount = await sql`SELECT COUNT(*) as count FROM student_profiles`
    const finalLoginCount = await sql`SELECT COUNT(*) as count FROM login_activity`

    console.log(`- Total Users: ${finalUserCount[0].count}`)
    console.log(`- Faculty: ${finalFacultyCount[0].count}`)
    console.log(`- Students: ${finalStudentCount[0].count}`)
    console.log(`- Login Activities: ${finalLoginCount[0].count}`)

    console.log("\n🎉 All registration tests passed successfully!")

    return {
      success: true,
      facultyUser: facultyResult,
      studentUser: studentResult,
      testPassword: testPassword,
    }
  } catch (error) {
    console.error("\n❌ Registration test failed:", error)
    throw error
  }
}

// Run test if called directly
if (require.main === module) {
  testRegistration()
    .then(() => {
      console.log("\n✅ Test completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Test failed:", error)
      process.exit(1)
    })
}

export { testRegistration }
