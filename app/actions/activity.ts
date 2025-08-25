"use server"

import { sql } from "@/lib/db"
import { getCurrentUser } from "./auth"

export async function getLoginActivity(page = 1, limit = 10) {
  // Ensure parameters are valid numbers
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
  const safePage = Math.max(1, Number(page) || 1);
  
  try {
    const currentUserResult = await getCurrentUser()

    if (!currentUserResult.success || !currentUserResult.user) {
      return { success: false, message: "Not authenticated" }
    }

    const currentUser = currentUserResult.user
    const offset = (safePage - 1) * safeLimit

    // Use explicit parameter binding for userId, but inline LIMIT and OFFSET
    const activities = await sql.unsafe(`
      SELECT 
        id, 
        timestamp, 
        ip_address, 
        user_agent, 
        success, 
        location, 
        device_type
      FROM login_activity
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ${safeLimit} OFFSET ${offset}
    `, [currentUser.id])

    const totalCount = await sql.unsafe(`
      SELECT COUNT(*) as count
      FROM login_activity
      WHERE user_id = ?
    `, [currentUser.id])

    return {
      success: true,
      activities,
      totalCount: totalCount[0].count,
      totalPages: Math.ceil(totalCount[0].count / safeLimit),
      currentPage: safePage,
    }
  } catch (error) {
    console.error("Error fetching login activity:", error)
    return { success: false, message: "Failed to fetch login activity" }
  }
}

export async function getRecentLoginActivity(limit = 5) {
  // Ensure limit is a valid number
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 5));
  
  try {
    const currentUserResult = await getCurrentUser()

    if (!currentUserResult.success || !currentUserResult.user) {
      return { success: false, message: "Not authenticated" }
    }

    const currentUser = currentUserResult.user

    // Use explicit parameter binding for userId, but inline LIMIT
    const activities = await sql.unsafe(`
      SELECT 
        id, 
        timestamp, 
        ip_address, 
        success, 
        device_type
      FROM login_activity
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ${safeLimit}
    `, [currentUser.id])

    return { success: true, activities }
  } catch (error) {
    console.error("Error fetching recent login activity:", error)
    return { success: false, message: "Failed to fetch recent login activity" }
  }
}
