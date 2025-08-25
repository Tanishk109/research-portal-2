"use server"

import { sql } from "@/lib/db"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"

export type StudentProfileData = {
  firstName: string
  lastName: string
  email: string
  registrationNumber: string
  department: string
  year: string
  cgpa: number
  phone?: string
  bio?: string
}

export type FacultyProfileData = {
  firstName: string
  lastName: string
  email: string
  facultyId: string
  department: string
  specialization: string
  dateOfJoining: string
  dateOfBirth: string
  phone?: string
  bio?: string
}

// Get current user's profile data
export async function getCurrentUserProfile() {
  try {
    const currentUserResult = await getCurrentUser()

    if (!currentUserResult.success) {
      return { success: false, message: "Not authenticated" }
    }

    const currentUser = currentUserResult.user

    if (currentUser.role === "student") {
      const studentProfile = await sql`
        SELECT 
          u.first_name,
          u.last_name,
          u.email,
          sp.registration_number,
          sp.department,
          sp.year,
          sp.cgpa,
          sp.phone,
          sp.bio
        FROM users u
        JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.id = ${currentUser.id}
      `

      if (studentProfile.length === 0) {
        return { success: false, message: "Student profile not found" }
      }

      return { success: true, profile: studentProfile[0] }
    } else if (currentUser.role === "faculty") {
      const facultyProfile = await sql`
        SELECT 
          u.first_name,
          u.last_name,
          u.email,
          fp.faculty_id,
          fp.department,
          fp.specialization,
          fp.date_of_joining,
          fp.date_of_birth,
          fp.phone,
          fp.bio
        FROM users u
        JOIN faculty_profiles fp ON u.id = fp.user_id
        WHERE u.id = ${currentUser.id}
      `

      if (facultyProfile.length === 0) {
        return { success: false, message: "Faculty profile not found" }
      }

      return { success: true, profile: facultyProfile[0] }
    }

    return { success: false, message: "Invalid user role" }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return { success: false, message: "Failed to fetch profile" }
  }
}

// Update student profile
export async function updateStudentProfile(data: StudentProfileData) {
  try {
    const currentUserResult = await getCurrentUser()

    if (!currentUserResult.success) {
      return { success: false, message: "Not authenticated" }
    }

    const currentUser = currentUserResult.user

    if (currentUser.role !== "student") {
      return { success: false, message: "Unauthorized" }
    }

    // Update user table
    await sql`
      UPDATE users 
      SET 
        first_name = ${data.firstName},
        last_name = ${data.lastName},
        email = ${data.email},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${currentUser.id}
    `

    // Update student profile
    await sql`
      UPDATE student_profiles 
      SET 
        registration_number = ${data.registrationNumber},
        department = ${data.department},
        year = ${data.year},
        cgpa = ${data.cgpa},
        phone = ${data.phone || null},
        bio = ${data.bio || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${currentUser.id}
    `

    revalidatePath("/dashboard/student/profile")
    revalidatePath("/dashboard/student")

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Error updating student profile:", error)
    return { success: false, message: "Failed to update profile" }
  }
}

// Update faculty profile
export async function updateFacultyProfile(data: FacultyProfileData) {
  try {
    const currentUserResult = await getCurrentUser()

    if (!currentUserResult.success) {
      return { success: false, message: "Not authenticated" }
    }

    const currentUser = currentUserResult.user

    if (currentUser.role !== "faculty") {
      return { success: false, message: "Unauthorized" }
    }

    // Update user table
    await sql`
      UPDATE users 
      SET 
        first_name = ${data.firstName},
        last_name = ${data.lastName},
        email = ${data.email},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${currentUser.id}
    `

    // Update faculty profile
    await sql`
      UPDATE faculty_profiles 
      SET 
        faculty_id = ${data.facultyId},
        department = ${data.department},
        specialization = ${data.specialization},
        date_of_joining = ${data.dateOfJoining},
        date_of_birth = ${data.dateOfBirth},
        phone = ${data.phone || null},
        bio = ${data.bio || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${currentUser.id}
    `

    revalidatePath("/dashboard/faculty/profile")
    revalidatePath("/dashboard/faculty")

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Error updating faculty profile:", error)
    return { success: false, message: "Failed to update profile" }
  }
} 