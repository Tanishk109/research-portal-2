"use server"

import { connectToMongoDB } from "@/lib/mongodb"
import { FacultyProfile, StudentCV, StudentProfile, StudentSkill, User } from "@/lib/models"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"
import { toObjectId } from "@/lib/db"

export type StudentProfileData = {
  firstName: string
  lastName: string
  email: string
  profilePictureUrl?: string
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
  profilePictureUrl?: string
  facultyId: string
  department: string
  specialization: string
  dateOfJoining: string
  dateOfBirth: string
  phone?: string
  bio?: string
}

const PROFILE_IMAGE_DATA_URL_PATTERN = /^data:image\/(png|jpeg|jpg|webp);base64,/
const MAX_PROFILE_IMAGE_DATA_URL_LENGTH = 3 * 1024 * 1024
const PENDING_PROFILE_PREFIX = "__pending__"

function getProfilePictureUpdate(profilePictureUrl: string | undefined) {
  if (profilePictureUrl === undefined) {
    return { success: true as const, value: undefined }
  }

  if (!profilePictureUrl) {
    return { success: true as const, value: "" }
  }

  if (
    profilePictureUrl.length > MAX_PROFILE_IMAGE_DATA_URL_LENGTH ||
    !PROFILE_IMAGE_DATA_URL_PATTERN.test(profilePictureUrl)
  ) {
    return { success: false as const, message: "Please upload a PNG, JPG, or WebP image up to 2MB." }
  }

  return { success: true as const, value: profilePictureUrl }
}

type UserProfileIdentity = {
  id: string
  role: string
}

function hasValue(value: unknown) {
  return String(value ?? "").trim().length > 0
}

function isPendingProfileValue(value: unknown) {
  return String(value ?? "").startsWith(PENDING_PROFILE_PREFIX)
}

function getPendingProfileValue(kind: "faculty" | "student", userId: unknown) {
  return `${PENDING_PROFILE_PREFIX}${kind}_${String(userId)}`
}

function hasRealValue(value: unknown) {
  return hasValue(value) && !isPendingProfileValue(value) && value !== "Pending"
}

function hasRealDate(value: unknown) {
  if (!value) return false
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isFinite(date.getTime()) && date.getTime() > 0
}

function displayProfileValue(value: unknown) {
  return hasRealValue(value) ? String(value) : ""
}

function displayProfileDate(value: unknown) {
  return hasRealDate(value) ? value : null
}

export async function getUserProfileCompletionStatus(user: UserProfileIdentity) {
  await connectToMongoDB()

  const userId = toObjectId(user.id)
  if (!userId) {
    return { success: false, complete: false, role: user.role, missing: ["Valid user account"] }
  }

  const account = await User.findById(userId).lean()
  if (!account) {
    return { success: false, complete: false, role: user.role, missing: ["User account"] }
  }

  if (user.role === "faculty") {
    const profile = await FacultyProfile.findOne({ user_id: userId }).lean()
    const checks = [
      ["First name", account.first_name],
      ["Last name", account.last_name],
      ["Email", account.email],
      ["Professional picture", account.profile_picture_url],
      ["Faculty ID", profile?.faculty_id],
      ["Department", profile?.department],
      ["Specialization", profile?.specialization],
      ["Date of joining", hasRealDate(profile?.date_of_joining) ? "yes" : ""],
      ["Date of birth", hasRealDate(profile?.date_of_birth) ? "yes" : ""],
      ["Phone", (profile as any)?.phone],
      ["Bio", (profile as any)?.bio],
    ] as const
    const missing = checks.filter(([, value]) => !hasRealValue(value)).map(([label]) => label)
    return { success: true, complete: missing.length === 0, role: "faculty", missing }
  }

  if (user.role === "student") {
    const [profile, resume, skillCount] = await Promise.all([
      StudentProfile.findOne({ user_id: userId }).lean(),
      StudentCV.findOne({ user_id: userId }).lean(),
      StudentSkill.countDocuments({ user_id: userId }),
    ])
    const checks = [
      ["First name", account.first_name],
      ["Last name", account.last_name],
      ["Email", account.email],
      ["Professional picture", account.profile_picture_url],
      ["Registration number", profile?.registration_number],
      ["Department", profile?.department],
      ["Year", profile?.year],
      ["CGPA", Number(profile?.cgpa || 0) > 0 ? "yes" : ""],
      ["Phone", (profile as any)?.phone],
      ["Bio", (profile as any)?.bio],
      ["Resume", resume?.file_url],
      ["At least one skill", skillCount > 0 ? "yes" : ""],
    ] as const
    const missing = checks.filter(([, value]) => !hasRealValue(value)).map(([label]) => label)
    return { success: true, complete: missing.length === 0, role: "student", missing }
  }

  return { success: false, complete: false, role: user.role, missing: ["Valid role"] }
}

export async function getCurrentProfileCompletionStatus() {
  const currentUserResult = await getCurrentUser()
  if (!currentUserResult.success) {
    return { success: false, complete: false, role: null, missing: ["Authenticated session"] }
  }

  return getUserProfileCompletionStatus(currentUserResult.user)
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
          profile_picture_url: user.profile_picture_url || null,
          registration_number: displayProfileValue(studentProfile.registration_number),
          department: displayProfileValue(studentProfile.department),
          year: displayProfileValue(studentProfile.year),
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
          profile_picture_url: user.profile_picture_url || null,
          faculty_id: displayProfileValue(facultyProfile.faculty_id),
          department: displayProfileValue(facultyProfile.department),
          specialization: displayProfileValue(facultyProfile.specialization),
          date_of_joining: displayProfileDate(facultyProfile.date_of_joining),
          date_of_birth: displayProfileDate(facultyProfile.date_of_birth),
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

    const profilePictureUpdate = getProfilePictureUpdate(data.profilePictureUrl)
    if (!profilePictureUpdate.success) {
      return { success: false, message: profilePictureUpdate.message }
    }

    const userUpdate: Record<string, unknown> = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      updated_at: new Date(),
    }

    if (profilePictureUpdate.value !== undefined) {
      userUpdate.profile_picture_url = profilePictureUpdate.value || undefined
    }

    await User.findByIdAndUpdate(userId, userUpdate)

    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { user_id: userId },
      {
        registration_number: data.registrationNumber || getPendingProfileValue("student", userId),
        department: data.department || PENDING_PROFILE_PREFIX,
        year: data.year || PENDING_PROFILE_PREFIX,
        cgpa: data.cgpa || 0,
        phone: data.phone || undefined,
        bio: data.bio || undefined,
        updated_at: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    if (!updatedProfile) {
      return { success: false, message: "Failed to create student profile" }
    }

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

    const profilePictureUpdate = getProfilePictureUpdate(data.profilePictureUrl)
    if (!profilePictureUpdate.success) {
      return { success: false, message: profilePictureUpdate.message }
    }

    const userUpdate: Record<string, unknown> = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      updated_at: new Date(),
    }

    if (profilePictureUpdate.value !== undefined) {
      userUpdate.profile_picture_url = profilePictureUpdate.value || undefined
    }

    await User.findByIdAndUpdate(userId, userUpdate)

    const updatedProfile = await FacultyProfile.findOneAndUpdate(
      { user_id: userId },
      {
        faculty_id: data.facultyId || getPendingProfileValue("faculty", userId),
        department: data.department || PENDING_PROFILE_PREFIX,
        specialization: data.specialization || PENDING_PROFILE_PREFIX,
        date_of_joining: data.dateOfJoining ? new Date(data.dateOfJoining) : new Date(0),
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(0),
        phone: data.phone || undefined,
        bio: data.bio || undefined,
        updated_at: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    if (!updatedProfile) {
      return { success: false, message: "Failed to create faculty profile" }
    }

    revalidatePath("/dashboard/faculty/profile")
    revalidatePath("/dashboard/faculty")

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Error updating faculty profile:", error)
    return { success: false, message: "Failed to update profile" }
  }
}
