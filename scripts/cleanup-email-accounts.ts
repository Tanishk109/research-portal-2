require("dotenv").config({ path: require("path").resolve(process.cwd(), ".env.local") })
require("dotenv").config({ path: require("path").resolve(process.cwd(), ".env") })

let Application: any
let FacultyProfile: any
let LoginActivity: any
let PendingRegistration: any
let Project: any
let StudentCV: any
let StudentCertificate: any
let StudentProfile: any
let StudentSkill: any
let User: any
let connectToMongoDB: () => Promise<any>
let disconnectFromMongoDB: () => Promise<void>

function getArgValue(name: string) {
  const prefix = `${name}=`
  const arg = process.argv.find((value) => value.startsWith(prefix))
  return arg ? arg.slice(prefix.length).trim().toLowerCase() : ""
}

function hasFlag(name: string) {
  return process.argv.includes(name)
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function deleteUsersByEmail(email: string, dryRun: boolean) {
  const emailRegex = new RegExp(`^${escapeRegex(email)}$`, "i")
  const users = await User.find({ email: { $regex: emailRegex } }).lean()
  const userIds = users.map((user: any) => user._id)
  const pending = await PendingRegistration.find({ email: { $regex: emailRegex } }).lean()

  console.log(`Email: ${email}`)
  console.log(`Users found: ${users.length}`)
  users.forEach((user: any) => {
    console.log(`- ${user._id.toString()} ${user.role} ${user.email}`)
  })
  console.log(`Pending registrations found: ${pending.length}`)

  if (dryRun) {
    console.log("Dry run only. Re-run with --delete to remove these records.")
    return
  }

  if (userIds.length) {
    const projects = await Project.find({ faculty_id: { $in: userIds } }).select("_id").lean()
    const projectIds = projects.map((project: any) => project._id)

    await Promise.all([
      FacultyProfile.deleteMany({ user_id: { $in: userIds } }),
      StudentProfile.deleteMany({ user_id: { $in: userIds } }),
      StudentCV.deleteMany({ user_id: { $in: userIds } }),
      StudentCertificate.deleteMany({ user_id: { $in: userIds } }),
      StudentSkill.deleteMany({ user_id: { $in: userIds } }),
      LoginActivity.deleteMany({ user_id: { $in: userIds } }),
      Application.deleteMany({ student_id: { $in: userIds } }),
      Application.deleteMany({ project_id: { $in: projectIds } }),
      Project.deleteMany({ _id: { $in: projectIds } }),
    ])
    await User.deleteMany({ _id: { $in: userIds } })
  }

  await PendingRegistration.deleteMany({ email: { $regex: emailRegex } })
  console.log("Deleted matching users, role profiles, student documents, applications, login activity, and pending registrations.")
}

async function auditConflicts() {
  const duplicates = await User.aggregate([
    {
      $group: {
        _id: { $toLower: "$email" },
        count: { $sum: 1 },
        roles: { $addToSet: "$role" },
        users: {
          $push: {
            id: "$_id",
            role: "$role",
            email: "$email",
            created_at: "$created_at",
          },
        },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ])

  if (!duplicates.length) {
    console.log("No duplicate user emails found.")
    return
  }

  console.log(`Duplicate user email groups found: ${duplicates.length}`)
  for (const group of duplicates) {
    console.log(`\n${group._id} (${group.count}) roles=${group.roles.join(", ")}`)
    for (const user of group.users) {
      console.log(`- ${user.id.toString()} ${user.role} ${user.email} created=${user.created_at || "unknown"}`)
    }
  }
}

async function cleanupStalePending(dryRun: boolean) {
  const stalePending = await PendingRegistration.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "email",
        foreignField: "email",
        as: "users",
      },
    },
    { $match: { "users.0": { $exists: true } } },
    { $project: { email: 1, role: 1, userCount: { $size: "$users" } } },
  ])

  if (!stalePending.length) {
    console.log("No pending registrations exist for already-created user emails.")
    return
  }

  console.log(`Stale pending registrations found: ${stalePending.length}`)
  stalePending.forEach((pending: any) => {
    console.log(`- ${pending._id.toString()} ${pending.role} ${pending.email}`)
  })

  if (dryRun) {
    console.log("Dry run only. Re-run with --delete-stale-pending to delete stale pending registrations.")
    return
  }

  const ids = stalePending.map((pending: any) => pending._id)
  const result = await PendingRegistration.deleteMany({ _id: { $in: ids } })
  console.log(`Deleted ${result.deletedCount || 0} stale pending registrations.`)
}

async function main() {
  const models = await import("../lib/models")
  const mongodb = await import("../lib/mongodb")

  Application = models.Application
  FacultyProfile = models.FacultyProfile
  LoginActivity = models.LoginActivity
  PendingRegistration = models.PendingRegistration
  Project = models.Project
  StudentCV = models.StudentCV
  StudentCertificate = models.StudentCertificate
  StudentProfile = models.StudentProfile
  StudentSkill = models.StudentSkill
  User = models.User
  connectToMongoDB = mongodb.connectToMongoDB
  disconnectFromMongoDB = mongodb.disconnectFromMongoDB

  const email = getArgValue("--email")
  const shouldDelete = hasFlag("--delete")
  const shouldDeleteStalePending = hasFlag("--delete-stale-pending")

  await connectToMongoDB()

  if (email) {
    await deleteUsersByEmail(email, !shouldDelete)
  } else {
    await auditConflicts()
    await cleanupStalePending(!shouldDeleteStalePending)
  }

  await disconnectFromMongoDB()
}

main().catch(async (error) => {
  console.error("Cleanup failed:", error)
  if (disconnectFromMongoDB) {
    await disconnectFromMongoDB()
  }
  process.exit(1)
})
