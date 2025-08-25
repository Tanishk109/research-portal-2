import { sql } from "../lib/db"
import { hash } from "bcryptjs"

async function createTestUsers() {
  console.log("Creating test users...")

  try {
    // Create a test faculty user
    const facultyPasswordHash = await hash("password123", 10)

    const faculty = await sql`
      INSERT INTO users (
        role, first_name, last_name, email, password_hash
      ) VALUES (
        'faculty', 'Test', 'Faculty', 'faculty@example.com', ${facultyPasswordHash}
      ) 
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = ${facultyPasswordHash}
      RETURNING id
    `

    if (faculty.length > 0) {
      await sql`
        INSERT INTO faculty_profiles (
          user_id, faculty_id, department, specialization, date_of_joining, date_of_birth
        ) VALUES (
          ${faculty[0].id}, 'F12345', 'Computer Science', 'Artificial Intelligence', 
          '2020-01-01', '1980-01-01'
        )
        ON CONFLICT (user_id) DO UPDATE
        SET department = 'Computer Science', specialization = 'Artificial Intelligence'
      `
      console.log("Test faculty user created successfully")
    }

    // Create a test student user
    const studentPasswordHash = await hash("password123", 10)

    const student = await sql`
      INSERT INTO users (
        role, first_name, last_name, email, password_hash
      ) VALUES (
        'student', 'Test', 'Student', 'student@example.com', ${studentPasswordHash}
      ) 
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = ${studentPasswordHash}
      RETURNING id
    `

    if (student.length > 0) {
      await sql`
        INSERT INTO student_profiles (
          user_id, registration_number, department, year, cgpa
        ) VALUES (
          ${student[0].id}, 'S12345', 'Computer Science', '3', 8.5
        )
        ON CONFLICT (user_id) DO UPDATE
        SET department = 'Computer Science', year = '3', cgpa = 8.5
      `
      console.log("Test student user created successfully")
    }

    // Create a test project
    if (faculty.length > 0) {
      await sql`
        INSERT INTO projects (
          faculty_id, title, description, research_area, requirements, positions, deadline, tags
        ) VALUES (
          ${faculty[0].id}, 
          'Machine Learning Research Project', 
          'A research project focused on developing new machine learning algorithms for natural language processing.', 
          'Machine Learning', 
          'Strong programming skills in Python, knowledge of NLP concepts', 
          2, 
          '2023-12-31',
          ARRAY['Machine Learning', 'NLP', 'Python']
        )
        ON CONFLICT DO NOTHING
      `
      console.log("Test project created successfully")
    }

    console.log("Test users created successfully!")
    return { success: true, message: "Test users created successfully" }
  } catch (error) {
    console.error("Error creating test users:", error)
    return {
      success: false,
      message: `Failed to create test users: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Run the function
createTestUsers()
  .then((result) => {
    console.log(result)
    process.exit(result.success ? 0 : 1)
  })
  .catch((error) => {
    console.error("Unhandled error:", error)
    process.exit(1)
  })
