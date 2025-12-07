"use server"

import { connectToMongoDB } from "@/lib/mongodb"
import { User, FacultyProfile, StudentProfile } from "@/lib/models"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"
import { toObjectId, toPlainObject } from "@/lib/db"

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
    await connectToMongoDB()
    const currentUserResult = await getCurrentUser()

    if (!currentUserResult.success) {
      return { success: false, message: "Not authenticated" }
    }

    const currentUser = currentUserResult.user
    const userId = toObjectId(currentUser.id)

    if (!userId) {
      return { success: false, message: "Invalid user ID" }
    }

    if (currentUser.role === "student") {
      const user = await User.findById(userId).lean()
      const studentProfile = await StudentProfile.findOne({ user_id: userId }).lean()

      if (!user || !studentProfile) {
        return { success: false, message: "Student profile not found" }
      }

      return {
        success: true,
        profile: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          registration_number: studentProfile.registration_number,
          department: studentProfile.department,
          year: studentProfile.year,
          cgpa: studentProfile.cgpa,
          phone: (studentProfile as any).phone || null,
          bio: (studentProfile as any).bio || null,
        },
      }
    } else if (currentUser.role === "faculty") {
      const user = await User.findById(userId).lean()
      const facultyProfile = await FacultyProfile.findOne({ user_id: userId }).lean()

      if (!user || !facultyProfile) {
        return { success: false, message: "Faculty profile not found" }
      }

      return {
        success: true,
        profile: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          faculty_id: facultyProfile.faculty_id,
          department: facultyProfile.department,
          specialization: facultyProfile.specialization,
          date_of_joining: facultyProfile.date_of_joining,
          date_of_birth: facultyProfile.date_of_birth,
          phone: (facultyProfile as any).phone || null,
          bio: (facultyProfile as any).bio || null,
        },
      }
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
    await connectToMongoDB()
    const currentUserResult = await getCurrentUser()

    if (!currentUserResult.success) {
      return { success: false, message: "Not authenticated" }
    }

    const currentUser = currentUserResult.user

    if (currentUser.role !== "student") {
      return { success: false, message: "Unauthorized" }
    }

    const userId = toObjectId(currentUser.id)
    if (!userId) {
      return { success: false, message: "Invalid user ID" }
    }

    // Update user
    await User.findByIdAndUpdate(userId, {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      updated_at: new Date(),
    })

    // Update student profile
    await StudentProfile.findOneAndUpdate(
      { user_id: userId },
      {
        registration_number: data.registrationNumber,
        department: data.department,
        year: data.year,
        cgpa: data.cgpa,
        phone: data.phone || undefined,
        bio: data.bio || undefined,
        updated_at: new Date(),
      },
      { upsert: false }
    )

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
    await connectToMongoDB()
    const currentUserResult = await getCurrentUser()

    if (!currentUserResult.success) {
      return { success: false, message: "Not authenticated" }
    }

    const currentUser = currentUserResult.user

    if (currentUser.role !== "faculty") {
      return { success: false, message: "Unauthorized" }
    }

    const userId = toObjectId(currentUser.id)
    if (!userId) {
      return { success: false, message: "Invalid user ID" }
    }

    // Update user
    await User.findByIdAndUpdate(userId, {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      updated_at: new Date(),
    })

    // Update faculty profile
    await FacultyProfile.findOneAndUpdate(
      { user_id: userId },
      {
        faculty_id: data.facultyId,
        department: data.department,
        specialization: data.specialization,
        date_of_joining: new Date(data.dateOfJoining),
        date_of_birth: new Date(data.dateOfBirth),
        phone: data.phone || undefined,
        bio: data.bio || undefined,
        updated_at: new Date(),
      },
      { upsert: false }
    )

    revalidatePath("/dashboard/faculty/profile")
    revalidatePath("/dashboard/faculty")

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Error updating faculty profile:", error)
    return { success: false, message: "Failed to update profile" }
  }
}
