import { NextResponse } from "next/server";
import { updateApplicationStatus } from "@/app/actions/applications";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number.parseInt(params.id);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid application ID" },
        { status: 400 }
      );
    }

    // Get current user to verify faculty access
    const { getCurrentUser } = await import("@/app/actions/auth");
    const userResult = await getCurrentUser();
    
    if (!userResult.success || userResult.user?.role !== "faculty") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Efficiently fetch single application with all details
    const { sql } = await import("@/lib/db");
    const applications = await sql.unsafe(`
      SELECT 
        a.id, a.status, a.cover_letter as message, a.feedback, a.applied_at,
        p.id as project_id, p.title as project_title, p.description as project_description,
        p.research_area, p.positions, p.deadline, p.start_date,
        s.id as student_id,
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        s.registration_number, s.year, s.cgpa, s.department
      FROM applications a
      JOIN projects p ON a.project_id = p.id
      JOIN faculty_profiles fp ON p.faculty_id = fp.id
      JOIN student_profiles s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE a.id = ? AND fp.user_id = ?
      LIMIT 1
    `, [id, userResult.user.id]);

    if (applications.length === 0) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    const app = applications[0];
    // Map status from "accepted" to "approved" for frontend
    const application = {
      ...app,
      status: app.status === "accepted" ? "approved" : app.status,
      project: {
        id: app.project_id,
        title: app.project_title,
        description: app.project_description,
        research_area: app.research_area,
        positions: app.positions,
        deadline: app.deadline,
        start_date: app.start_date,
      },
      student: {
        id: app.student_id,
        name: app.student_name,
        registration_number: app.registration_number,
        department: app.department,
        year: app.year || "",
        cgpa: app.cgpa,
      },
    };

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load application" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    let status = body.status as "approved" | "accepted" | "rejected";
    const feedback = body.feedback as string | undefined;
    
    // Map "approved" to "accepted" to match database schema
    if (status === "approved") {
      status = "accepted";
    }
    
    if (!id || (status !== "accepted" && status !== "rejected")) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }
    const result = await updateApplicationStatus(id, status, feedback);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({ success: false, message: "Failed to update application" }, { status: 500 });
  }
}
