import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";
import { sql } from "@/lib/db";

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
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 