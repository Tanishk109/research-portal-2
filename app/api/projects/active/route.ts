import { NextResponse } from "next/server";
import { getActiveProjects } from "@/app/actions/projects";

export async function GET() {
  try {
    const projects = await getActiveProjects();
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to load projects" }, { status: 500 });
  }
}


