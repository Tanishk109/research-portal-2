import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";
import { sql } from "@/lib/db";
import { updateFacultyProfile } from "@/app/actions/profiles";

export async function GET() {
  try {
    const userResult = await getCurrentUser();
    if (!userResult.success || !userResult.user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    const user = userResult.user;
    if (user.role !== "faculty") {
      return NextResponse.json({ success: false, message: "Not a faculty user" }, { status: 403 });
    }
    // Fetch faculty profile details
    const profile = await sql.unsafe(
      "SELECT * FROM faculty_profiles WHERE user_id = ?",
      [user.id]
    );
    return NextResponse.json({ success: true, profile: profile[0] || null });
  } catch (error) {
    console.error("Error fetching faculty profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load profile" },
      { status: 500 }
    );
  }
} 

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = await updateFacultyProfile(body);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 });
  }
}