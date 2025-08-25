import { sql } from "../lib/db"

async function setupDatabase() {
  try {
    console.log("🚀 Setting up MySQL database...")

    // Create users table
    console.log("Creating users table...")
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role ENUM('faculty', 'student') NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `

    // Create faculty_profiles table
    console.log("Creating faculty_profiles table...")
    await sql`
      CREATE TABLE IF NOT EXISTS faculty_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        faculty_id VARCHAR(50) UNIQUE NOT NULL,
        department VARCHAR(100) NOT NULL,
        specialization VARCHAR(255) NOT NULL,
        date_of_joining DATE NOT NULL,
        date_of_birth DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_faculty_id (faculty_id),
        INDEX idx_department (department)
      )
    `

    // Create student_profiles table
    console.log("Creating student_profiles table...")
    await sql`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        registration_number VARCHAR(50) UNIQUE NOT NULL,
        department VARCHAR(100) NOT NULL,
        year VARCHAR(20) NOT NULL,
        cgpa DECIMAL(3,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_registration_number (registration_number),
        INDEX idx_department (department),
        INDEX idx_year (year)
      )
    `

    // Add cv_url column to student_profiles if not exists
    console.log("Adding cv_url column to student_profiles if not exists...")
    await sql`
      ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS cv_url VARCHAR(255) NULL
    `

    // Create student_cvs table
    console.log("Creating student_cvs table...")
    await sql`
      CREATE TABLE IF NOT EXISTS student_cvs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    // Create student_certificates table
    console.log("Creating student_certificates table...")
    await sql`
      CREATE TABLE IF NOT EXISTS student_certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        file_url VARCHAR(255) NOT NULL,
        date DATE,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    // Create student_skills table
    console.log("Creating student_skills table...")
    await sql`
      CREATE TABLE IF NOT EXISTS student_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        skill VARCHAR(100) NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    // Create projects table
    console.log("Creating projects table...")
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        duration VARCHAR(100),
        stipend VARCHAR(100),
        status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
        max_students INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_faculty_id (faculty_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `

    // Create applications table
    console.log("Creating applications table...")
    await sql`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        student_id INT NOT NULL,
        cover_letter TEXT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_application (project_id, student_id),
        INDEX idx_project_id (project_id),
        INDEX idx_student_id (student_id),
        INDEX idx_status (status),
        INDEX idx_applied_at (applied_at)
      )
    `

    // Create login_activity table
    console.log("Creating login_activity table...")
    await sql`
      CREATE TABLE IF NOT EXISTS login_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        success BOOLEAN NOT NULL,
        location VARCHAR(255),
        device_type VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_timestamp (timestamp),
        INDEX idx_success (success)
      )
    `

    console.log("✅ Database setup completed successfully!")
    console.log("📊 All tables created with proper indexes and foreign keys")

    // Show table status
    const tables = await sql`SHOW TABLES`
    console.log("📋 Created tables:", tables.map((t: any) => Object.values(t)[0]).join(", "))
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log("🎉 Setup complete!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Setup failed:", error)
      process.exit(1)
    })
}

export { setupDatabase }
