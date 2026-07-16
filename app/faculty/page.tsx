import { connectToMongoDB } from "@/lib/mongodb"
import { User } from "@/lib/models"
import { toPlainObject } from "@/lib/db"
import { FacultyDirectoryClient } from "./faculty-directory-client"

export const dynamic = "force-dynamic"

export default async function FacultyDirectory() {
  let faculty: any[] = []

  try {
    await connectToMongoDB()
    const facultyData = await User.aggregate([
      { $match: { role: "faculty" } },
      {
        $lookup: {
          from: "facultyprofiles",
          localField: "_id",
          foreignField: "user_id",
          as: "profile",
        },
      },
      { $unwind: "$profile" },
      {
        $project: {
          id: { $toString: "$profile._id" },
          first_name: 1,
          last_name: 1,
          email: 1,
          department: "$profile.department",
          specialization: "$profile.specialization",
        },
      },
      { $sort: { department: 1, last_name: 1 } },
    ])
    faculty = facultyData.map(toPlainObject)
  } catch (error) {
    console.error("No faculty data available:", error)
    faculty = []
  }

  return <FacultyDirectoryClient faculty={faculty} />
}
