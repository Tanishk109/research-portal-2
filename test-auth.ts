"use server"

import { sql, testDatabaseConnection } from "@/lib/db"
import { checkAndSetupDatabase } from "@/app/actions/setup-db"
import { registerFaculty, registerStudent, login } from "@/app/actions/auth"

export async function testAuthentication() {
  console.log("Starting authentication test...")

  // Step 1: Test database connection
  console.log("Step 1: Testing database connection...")
  const isConnected = await testDatabaseConnection()
  if (!isConnected) {
    console.error("Database connection failed")
    return { success: false, message: "Database connection failed" }
  }
  console.log("Database connection successful")

  // Step 2: Ensure database schema is set up
  console.log("Step 2: Setting up database schema...")
  const dbSetup = await checkAndSetupDatabase()
  if (!dbSetup.success) {
    console.error("Database schema setup failed:", dbSetup.error)
    return { success: false, message: "Database schema setup failed" }
  }
  console.log("Database schema setup successful")

  // Step 3: Test faculty registration
  console.log("Step 3: Testing faculty registration...")
  const facultyData = {
    firstName: "Test",
    lastName: "Faculty",
    email: "test.faculty@example.com",
    facultyId: "FAC123",
    department: "cs",
    specialization: "Testing",
    doj: "2023-01-01",
    dob: "1980-01-01",
    password: "password123",
  }

  // Check if test faculty already exists
  const existingFaculty = await sql`SELECT id FROM users WHERE email = ${facultyData.email}`
  if (existingFaculty.length > 0) {
    console.log("Test faculty already exists, deleting...")
    await sql`DELETE FROM users WHERE email = ${facultyData.email}`
  }

  const facultyResult = await registerFaculty(facultyData)
  if (!facultyResult.success) {
    console.error("Faculty registration failed:", facultyResult.message)
    return { success: false, message: `Faculty registration failed: ${facultyResult.message}` }
  }
  console.log("Faculty registration successful")

  // Step 4: Test student registration
  console.log("Step 4: Testing student registration...")
  const studentData = {
    firstName: "Test",
    lastName: "Student",
    email: "test.student@example.com",
    registrationNumber: "STU123",
    department: "cs",
    year: "2",
    cgpa: "8.5",
    password: "password123",
  }

  // Check if test student already exists
  const existingStudent = await sql`SELECT id FROM users WHERE email = ${studentData.email}`
  if (existingStudent.length > 0) {
    console.log("Test student already exists, deleting...")
    await sql`DELETE FROM users WHERE email = ${studentData.email}`
  }

  const studentResult = await registerStudent(studentData)
  if (!studentResult.success) {
    console.error("Student registration failed:", studentResult.message)
    return { success: false, message: `Student registration failed: ${studentResult.message}` }
  }
  console.log("Student registration successful")

  // Step 5: Test faculty login
  console.log("Step 5: Testing faculty login...")
  const facultyLoginResult = await login({
    email: facultyData.email,
    password: facultyData.password,
    role: "faculty",
  })

  if (!facultyLoginResult.success) {
    console.error("Faculty login failed:", facultyLoginResult.message)
    return { success: false, message: `Faculty login failed: ${facultyLoginResult.message}` }
  }
  console.log("Faculty login successful")

  // Step 6: Test student login
  console.log("Step 6: Testing student login...")
  const studentLoginResult = await login({
    email: studentData.email,
    password: studentData.password,
    role: "student",
  })

  if (!studentLoginResult.success) {
    console.error("Student login failed:", studentLoginResult.message)
    return { success: false, message: `Student login failed: ${studentLoginResult.message}` }
  }
  console.log("Student login successful")

  // Step 7: Test invalid login
  console.log("Step 7: Testing invalid login...")
  const invalidLoginResult = await login({
    email: facultyData.email,
    password: "wrongpassword",
    role: "faculty",
  })

  if (invalidLoginResult.success) {
    console.error("Invalid login succeeded when it should have failed")
    return { success: false, message: "Invalid login succeeded when it should have failed" }
  }
  console.log("Invalid login correctly failed")

  return {
    success: true,
    message: "Authentication test completed successfully",
    testFacultyEmail: facultyData.email,
    testFacultyPassword: facultyData.password,
    testStudentEmail: studentData.email,
    testStudentPassword: studentData.password,
  }
}
