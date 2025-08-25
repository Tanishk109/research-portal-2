import { NextResponse } from "next/server";
import { getFacultyProjects } from "@/app/actions/projects";
import { getFacultyApplications } from "@/app/actions/applications";
import { getRecentLoginActivity } from "@/app/actions/activity";

export async function GET(request: Request) {
  try {
    // Optionally, parse query params for pagination
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
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 