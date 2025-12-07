import { NextResponse } from "next/server";
import { getCurrentUserProfile, updateStudentProfile } from "@/app/actions/profiles";

// Force dynamic rendering for this route (uses cookies)
export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await getCurrentUserProfile();

  if (!result.success && result.message === "Not authenticated") {
    return NextResponse.json({ success: false, message: result.message }, { status: 401 });
  }

  if (!result.success && result.message === "Student profile not found") {
    return NextResponse.json({ success: false, message: result.message }, { status: 404 });
  }

  if (!result.success) {
    return NextResponse.json({ success: false, message: result.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, profile: result.profile });
} 

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = await updateStudentProfile(body);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 });
  }
}