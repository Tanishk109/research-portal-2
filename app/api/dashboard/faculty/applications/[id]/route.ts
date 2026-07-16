import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateApplicationStatus } from "@/app/actions/applications";
import { connectToMongoDB } from "@/lib/mongodb";
import { Application, FacultyProfile } from "@/lib/models";
import { toObjectId } from "@/lib/db";
import { getCurrentUser } from "@/app/actions/auth";

// Force dynamic rendering for this route (uses cookies)
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToMongoDB();
    const { id: paramId } = await params;
    const id = toObjectId(paramId);
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid application ID" },
        { status: 400 }
      );
    }

    // Get current user to verify faculty access
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
          foreignField: "user_id",
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
        $lookup: {
          from: "studentcvs",
          localField: "student_id",
          foreignField: "user_id",
          as: "studentCV",
        },
      },
      { $unwind: { path: "$studentCV", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          status: 1,
          message: "$cover_letter",
          feedback: 1,
          applied_at: {
            $dateToString: {
              date: "$applied_at",
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              timezone: "UTC",
              onNull: null,
            },
          },
          project_id: { $toString: "$project._id" },
          project_title: "$project.title",
          project_description: "$project.description",
          research_area: "$project.research_area",
          positions: "$project.positions",
          deadline: {
            $dateToString: {
              date: "$project.deadline",
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              timezone: "UTC",
              onNull: null,
            },
          },
          start_date: {
            $dateToString: {
              date: "$project.start_date",
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              timezone: "UTC",
              onNull: null,
            },
          },
          student_id: { $toString: "$user._id" },
          student_name: { $concat: ["$user.first_name", " ", "$user.last_name"] },
          student_avatar: { $ifNull: ["$user.profile_picture_url", null] },
          registration_number: "$studentProfile.registration_number",
          year: "$studentProfile.year",
          cgpa: "$studentProfile.cgpa",
          department: "$studentProfile.department",
          resume_id: {
            $cond: [
              { $ifNull: ["$studentCV._id", false] },
              { $toString: "$studentCV._id" },
              null,
            ],
          },
          resume_url: { $ifNull: ["$studentCV.file_url", null] },
          resume_file_name: { $ifNull: ["$studentCV.file_name", "Resume.pdf"] },
          resume_mime_type: { $ifNull: ["$studentCV.mime_type", "application/pdf"] },
          resume_uploaded_at: {
            $dateToString: {
              date: "$studentCV.uploaded_at",
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              timezone: "UTC",
              onNull: null,
            },
          },
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
        avatar: app.student_avatar || null,
        registration_number: app.registration_number,
        department: app.department,
        year: app.year || "",
        cgpa: app.cgpa,
        resume: app.resume_url
          ? {
              id: app.resume_id,
              file_url: app.resume_url,
              file_name: app.resume_file_name || "Resume.pdf",
              mime_type: app.resume_mime_type || "application/pdf",
              uploaded_at: app.resume_uploaded_at,
            }
          : null,
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = toObjectId(paramId);
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
