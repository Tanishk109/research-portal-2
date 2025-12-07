import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";
import { connectToMongoDB } from "@/lib/mongodb";
import { FacultyProfile } from "@/lib/models";
import { updateFacultyProfile } from "@/app/actions/profiles";
import { toObjectId, toPlainObject } from "@/lib/db";

// Force dynamic rendering for this route (uses cookies)
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectToMongoDB();
    const userResult = await getCurrentUser();
    if (!userResult.success || !userResult.user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    const user = userResult.user;
    if (user.role !== "faculty") {
      return NextResponse.json({ success: false, message: "Not a faculty user" }, { status: 403 });
    }
    
    // Fetch faculty profile details
    const userId = toObjectId(user.id);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 });
    }
    
    const profile = await FacultyProfile.findOne({ user_id: userId }).lean();
    return NextResponse.json({ success: true, profile: profile ? toPlainObject(profile) : null });
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
