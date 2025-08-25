import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/app/actions/profiles";

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