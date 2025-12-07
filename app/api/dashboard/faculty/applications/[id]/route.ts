import { NextResponse } from "next/server";
import { updateApplicationStatus } from "@/app/actions/applications";
import { connectToMongoDB } from "@/lib/mongodb";
import { Application, Project, FacultyProfile, StudentProfile, User } from "@/lib/models";
import { toObjectId, toPlainObject } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();
    const id = toObjectId(params.id);
    if (!id) {
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

    const userId = toObjectId(userResult.user.id);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Get faculty profile
    const facultyProfile = await FacultyProfile.findOne({ user_id: userId });
    if (!facultyProfile) {
      return NextResponse.json(
        { success: false, message: "Faculty profile not found" },
        { status: 404 }
      );
    }

    // Fetch application with all related data using aggregation
    const applications = await Application.aggregate([
      { $match: { _id: id } },
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $match: {
          "project.faculty_id": facultyProfile._id,
        },
      },
      {
        $lookup: {
          from: "studentprofiles",
          localField: "student_id",
          foreignField: "_id",
          as: "studentProfile",
        },
      },
      { $unwind: "$studentProfile" },
      {
        $lookup: {
          from: "users",
          localField: "studentProfile.user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          id: { $toString: "$_id" },
          status: 1,
          message: "$cover_letter",
          feedback: 1,
          applied_at: 1,
          project_id: { $toString: "$project._id" },
          project_title: "$project.title",
          project_description: "$project.description",
          research_area: "$project.research_area",
          positions: "$project.positions",
          deadline: "$project.deadline",
          start_date: "$project.start_date",
          student_id: { $toString: "$studentProfile._id" },
          student_name: { $concat: ["$user.first_name", " ", "$user.last_name"] },
          registration_number: "$studentProfile.registration_number",
          year: "$studentProfile.year",
          cgpa: "$studentProfile.cgpa",
          department: "$studentProfile.department",
        },
      },
      { $limit: 1 },
    ]);

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
    const id = toObjectId(params.id);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid application ID" }, { status: 400 });
    }
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
    const result = await updateApplicationStatus(String(id), status, feedback);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({ success: false, message: "Failed to update application" }, { status: 500 });
  }
}
