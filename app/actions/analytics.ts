"use server"

import { sql } from "@/lib/db"
import { getCurrentUser } from "./auth"

// Get project analytics
export async function getProjectAnalytics() {
  try {
    const userResult = await getCurrentUser()

    if (!userResult.success) {
      throw new Error("Not authenticated")
    }

    const user = userResult.user

    if (user.role !== "faculty") {
      throw new Error("Unauthorized")
    }

    // Get faculty profile ID
    const facultyProfiles = await sql`
      SELECT id FROM faculty_profiles WHERE user_id = ${user.id}
    `

    if (facultyProfiles.length === 0) {
      throw new Error("Faculty profile not found")
    }

    const facultyId = facultyProfiles[0].id

    // Get total projects
    const totalProjectsResult = await sql`
      SELECT COUNT(*) as count FROM projects WHERE faculty_id = ${facultyId}
    `
    const totalProjects = Number.parseInt(totalProjectsResult[0].count)

    // Get projects by status
    const projectsByStatusResult = await sql`
      SELECT status, COUNT(*) as count 
      FROM projects 
      WHERE faculty_id = ${facultyId}
      GROUP BY status
    `
    const projectsByStatus = projectsByStatusResult.map((row) => ({
      status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
      count: Number.parseInt(row.count),
    }))

    // Get projects by research area
    const projectsByResearchAreaResult = await sql`
      SELECT research_area, COUNT(*) as count 
      FROM projects 
      WHERE faculty_id = ${facultyId}
      GROUP BY research_area
      ORDER BY count DESC
      LIMIT 10
    `
    const projectsByResearchArea = projectsByResearchAreaResult.map((row) => ({
      research_area: row.research_area,
      count: Number.parseInt(row.count),
    }))

    // Get projects over time (by month) - MySQL version
    const projectsOverTimeResult = await sql`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM projects
      WHERE faculty_id = ${facultyId}
      GROUP BY month
      ORDER BY month
    `
    const projectsOverTime = projectsOverTimeResult.map((row) => ({
      month: row.month,
      count: Number.parseInt(row.count),
    }))

    // Get average applications per project
    const avgApplicationsResult = await sql`
      SELECT AVG(application_count) as avg_applications
      FROM (
        SELECT p.id, COUNT(a.id) as application_count
        FROM projects p
        LEFT JOIN applications a ON p.id = a.project_id
        WHERE p.faculty_id = ${facultyId}
        GROUP BY p.id
      ) as project_applications
    `
    const avgApplications = Number.parseFloat(avgApplicationsResult[0].avg_applications || 0).toFixed(1)

    return {
      totalProjects,
      projectsByStatus,
      projectsByResearchArea,
      projectsOverTime,
      avgApplications,
    }
  } catch (error) {
    console.error("Get project analytics error:", error)
    throw error
  }
}

// Get application analytics
export async function getApplicationAnalytics() {
  try {
    const userResult = await getCurrentUser()

    if (!userResult.success) {
      throw new Error("Not authenticated")
    }

    const user = userResult.user

    if (user.role !== "faculty") {
      throw new Error("Unauthorized")
    }

    // Get faculty profile ID
    const facultyProfiles = await sql`
      SELECT id FROM faculty_profiles WHERE user_id = ${user.id}
    `

    if (facultyProfiles.length === 0) {
      throw new Error("Faculty profile not found")
    }

    const facultyId = facultyProfiles[0].id

    // Get total applications
    const totalApplicationsResult = await sql`
      SELECT COUNT(*) as count 
      FROM applications a
      JOIN projects p ON a.project_id = p.id
      WHERE p.faculty_id = ${facultyId}
    `
    const totalApplications = Number.parseInt(totalApplicationsResult[0].count)

    // Get approved applications
    const approvedApplicationsResult = await sql`
      SELECT COUNT(*) as count 
      FROM applications a
      JOIN projects p ON a.project_id = p.id
      WHERE p.faculty_id = ${facultyId} AND a.status = 'approved'
    `
    const approvedApplications = Number.parseInt(approvedApplicationsResult[0].count)

    // Get applications by status
    const applicationsByStatusResult = await sql`
      SELECT a.status, COUNT(*) as count 
      FROM applications a
      JOIN projects p ON a.project_id = p.id
      WHERE p.faculty_id = ${facultyId}
      GROUP BY a.status
    `
    const applicationsByStatus = applicationsByStatusResult.map((row) => ({
      status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
      count: Number.parseInt(row.count),
    }))

    // Get top projects by applications
    const topProjectsByApplicationsResult = await sql`
      SELECT p.title, COUNT(a.id) as count 
      FROM projects p
      LEFT JOIN applications a ON p.id = a.project_id
      WHERE p.faculty_id = ${facultyId}
      GROUP BY p.id, p.title
      ORDER BY count DESC
      LIMIT 10
    `
    const topProjectsByApplications = topProjectsByApplicationsResult.map((row) => ({
      title: row.title.length > 20 ? row.title.substring(0, 20) + "..." : row.title,
      count: Number.parseInt(row.count),
    }))

    // Get applications over time (by month) - MySQL version
    const applicationsOverTimeResult = await sql`
      SELECT 
        DATE_FORMAT(a.applied_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM applications a
      JOIN projects p ON a.project_id = p.id
      WHERE p.faculty_id = ${facultyId}
      GROUP BY month
      ORDER BY month
    `
    const applicationsOverTime = applicationsOverTimeResult.map((row) => ({
      month: row.month,
      count: Number.parseInt(row.count),
    }))

    // Get applicants by department
    const applicantsByDepartmentResult = await sql`
      SELECT sp.department, COUNT(DISTINCT a.student_id) as count
      FROM applications a
      JOIN projects p ON a.project_id = p.id
      JOIN student_profiles sp ON a.student_id = sp.id
      WHERE p.faculty_id = ${facultyId}
      GROUP BY sp.department
      ORDER BY count DESC
    `
    const applicantsByDepartment = applicantsByDepartmentResult.map((row) => ({
      department: row.department,
      count: Number.parseInt(row.count),
    }))

    // Get applicants by year
    const applicantsByYearResult = await sql`
      SELECT sp.year, COUNT(DISTINCT a.student_id) as count
      FROM applications a
      JOIN projects p ON a.project_id = p.id
      JOIN student_profiles sp ON a.student_id = sp.id
      WHERE p.faculty_id = ${facultyId}
      GROUP BY sp.year
      ORDER BY sp.year
    `
    const applicantsByYear = applicantsByYearResult.map((row) => ({
      year: row.year,
      count: Number.parseInt(row.count),
    }))

    // Get applicants by CGPA range
    const applicantsByCGPAResult = await sql`
      SELECT 
        CASE 
          WHEN sp.cgpa >= 9.0 THEN '9.0 - 10.0'
          WHEN sp.cgpa >= 8.0 THEN '8.0 - 8.99'
          WHEN sp.cgpa >= 7.0 THEN '7.0 - 7.99'
          ELSE 'Below 7.0'
        END as cgpa_range,
        COUNT(DISTINCT a.student_id) as count
      FROM applications a
      JOIN projects p ON a.project_id = p.id
      JOIN student_profiles sp ON a.student_id = sp.id
      WHERE p.faculty_id = ${facultyId}
      GROUP BY cgpa_range
      ORDER BY cgpa_range DESC
    `
    const applicantsByCGPA = applicantsByCGPAResult.map((row) => ({
      range: row.cgpa_range,
      count: Number.parseInt(row.count),
    }))

    // Get success rate by department
    const successRateByDepartmentResult = await sql`
      WITH department_stats AS (
        SELECT 
          sp.department,
          COUNT(DISTINCT a.id) as total_applications,
          COUNT(DISTINCT CASE WHEN a.status = 'approved' THEN a.id END) as approved_applications
        FROM applications a
        JOIN projects p ON a.project_id = p.id
        JOIN student_profiles sp ON a.student_id = sp.id
        WHERE p.faculty_id = ${facultyId}
        GROUP BY sp.department
      )
      SELECT 
        department,
        ROUND(
          COALESCE(approved_applications, 0) / NULLIF(COALESCE(total_applications, 0), 0) * 100, 0
        ) as rate
      FROM department_stats
      ORDER BY rate DESC
    `
    const successRateByDepartment = successRateByDepartmentResult.map((row) => ({
      department: row.department,
      rate: Number.parseInt(row.rate || 0),
    }))

    // Calculate conversion rate (applications / total projects)
    const conversionRate = (totalProjects: number) => {
      if (!totalProjects) return 0
      return Math.round((totalApplications / totalProjects) * 100)
    }

    return {
      totalApplications,
      approvedApplications,
      applicationsByStatus,
      topProjectsByApplications,
      applicationsOverTime,
      applicantsByDepartment,
      applicantsByYear,
      applicantsByCGPA,
      successRateByDepartment,
      conversionRate: conversionRate(totalApplicationsResult[0].count),
    }
  } catch (error) {
    console.error("Get application analytics error:", error)
    throw error
  }
}
