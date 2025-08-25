"use server"

import { sql } from "@/lib/db"

export async function checkAndSetupDatabase() {
  try {
    console.log("Checking database schema...")

    // Check if users table exists
    const usersTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `

    // Create users table if it doesn't exist
    if (!usersTableExists[0].exists) {
      console.log("Creating users table...")
      await sql`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          role VARCHAR(10) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }

    // Check if faculty_profiles table exists
    const facultyProfilesTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'faculty_profiles'
      );
    `

    // Create faculty_profiles table if it doesn't exist
    if (!facultyProfilesTableExists[0].exists) {
      console.log("Creating faculty_profiles table...")
      await sql`
        CREATE TABLE faculty_profiles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          faculty_id VARCHAR(50) UNIQUE NOT NULL,
          department VARCHAR(100) NOT NULL,
          specialization VARCHAR(255) NOT NULL,
          date_of_joining DATE NOT NULL,
          date_of_birth DATE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }

    // Check if student_profiles table exists
    const studentProfilesTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'student_profiles'
      );
    `

    // Create student_profiles table if it doesn't exist
    if (!studentProfilesTableExists[0].exists) {
      console.log("Creating student_profiles table...")
      await sql`
        CREATE TABLE student_profiles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          registration_number VARCHAR(50) UNIQUE NOT NULL,
          department VARCHAR(100) NOT NULL,
          year VARCHAR(20) NOT NULL,
          cgpa NUMERIC(3,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }

    // Check if login_activity table exists
    const loginActivityTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'login_activity'
      );
    `

    // Create login_activity table if it doesn't exist
    if (!loginActivityTableExists[0].exists) {
      console.log("Creating login_activity table...")
      await sql`
        CREATE TABLE login_activity (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          ip_address VARCHAR(45),
          user_agent TEXT,
          success BOOLEAN NOT NULL,
          location TEXT,
          device_type VARCHAR(50)
        );
        
        CREATE INDEX IF NOT EXISTS login_activity_user_id_idx ON login_activity(user_id);
        CREATE INDEX IF NOT EXISTS login_activity_timestamp_idx ON login_activity(timestamp);
      `
    }

    return { success: true, message: "Database schema checked and set up successfully" }
  } catch (error) {
    console.error("Database setup error:", error)
    return {
      success: false,
      message: `Failed to set up database schema: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
