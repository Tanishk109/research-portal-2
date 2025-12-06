import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Get all student accounts with their profile details
    const students = await sql`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.created_at,
        u.updated_at,
        sp.registration_number,
        sp.department,
        sp.year,
        sp.cgpa
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC
    `;

    return NextResponse.json({ 
      success: true, 
      students,
      count: students.length
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch student details: ${error.message}` }, 
      { status: 500 }
    );
  }
}
