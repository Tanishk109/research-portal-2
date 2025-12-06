import { NextResponse } from "next/server";
import { getProjectById } from "@/app/actions/projects";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = Number.parseInt(params.id);
    
    if (isNaN(projectId) || projectId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID" },
        { status: 400 }
      );
    }

    const project = await getProjectById(projectId);
    
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load project" },
      { status: 500 }
    );
  }
}

