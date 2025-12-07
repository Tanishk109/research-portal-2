import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { User, StudentProfile } from "@/lib/models";
import { toPlainObject } from "@/lib/db";

export async function GET() {
  try {
    await connectToMongoDB();
    
    // Get all student accounts with their profile details
    const students = await User.aggregate([
      { $match: { role: "student" } },
      {
        $lookup: {
          from: "studentprofiles",
          localField: "_id",
          foreignField: "user_id",
          as: "profile",
        },
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: { $toString: "$_id" },
          first_name: 1,
          last_name: 1,
          email: 1,
          created_at: 1,
          updated_at: 1,
          registration_number: "$profile.registration_number",
          department: "$profile.department",
          year: "$profile.year",
          cgpa: "$profile.cgpa",
        },
      },
      { $sort: { created_at: -1 } },
    ]);

    return NextResponse.json({ 
      success: true, 
      students,
      count: students.length
    });
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch student details: ${error?.message || String(error)}` }, 
      { status: 500 }
    );
  }
}
