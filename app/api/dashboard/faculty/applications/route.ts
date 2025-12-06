import { NextResponse } from "next/server";
import { getFacultyApplications } from "@/app/actions/applications";
import { getCurrentUser } from "@/app/actions/auth";

export async function GET(request: Request) {
  try {
    // Verify user is authenticated and is faculty
    const userResult = await getCurrentUser();
    if (!userResult.success || userResult.user?.role !== "faculty") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 10;
    const offset = Number(searchParams.get("offset")) || 0;
    const applications = await getFacultyApplications(limit, offset);
    return NextResponse.json({ success: true, applications });
  } catch (error) {
    console.error("Error fetching faculty applications:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load applications" },
      { status: 500 }
    );
  }
}


