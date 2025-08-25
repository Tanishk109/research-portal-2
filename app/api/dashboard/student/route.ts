import { NextResponse } from "next/server";
import { getStudentApplications } from "@/app/actions/applications";

export async function GET(request: Request) {
  try {
    // Optionally, parse query params for pagination
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 10;
    const offset = Number(searchParams.get("offset")) || 0;
    const applications = await getStudentApplications(limit, offset);
    return NextResponse.json({ success: true, applications });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 