import { NextResponse } from "next/server";
import { getFacultyProjects } from "@/app/actions/projects";
import { getFacultyApplications } from "@/app/actions/applications";
import { getRecentLoginActivity } from "@/app/actions/activity";
import { getCurrentUser } from "@/app/actions/auth";

// Force dynamic rendering for this route (uses cookies)
export const dynamic = 'force-dynamic'

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

    // Fetch all dashboard data in parallel
    const [projects, applications, activity] = await Promise.all([
      getFacultyProjects(),
      getFacultyApplications(limit, offset),
      getRecentLoginActivity(5),
    ]);

    return NextResponse.json({
      success: true,
      projects,
      applications,
      activity: activity?.activities || [],
    });
  } catch (error) {
    console.error("Error fetching faculty dashboard:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
} 