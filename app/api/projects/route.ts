import { NextResponse } from "next/server";
import { createProject, getProjects } from "@/app/actions/projects";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const department = searchParams.get("department") || undefined;
    const researchArea = searchParams.get("researchArea") || undefined;
    const searchTerm = searchParams.get("searchTerm") || undefined;
    const projects = await getProjects({ status, department, researchArea, searchTerm });
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to load projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Verify user is authenticated and is faculty
    const { getCurrentUser } = await import("@/app/actions/auth");
    const userResult = await getCurrentUser();
    if (!userResult.success || userResult.user?.role !== "faculty") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Only faculty can create projects." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = await createProject(body);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, projectId: (result as any).projectId });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create project" },
      { status: 500 }
    );
  }
}


