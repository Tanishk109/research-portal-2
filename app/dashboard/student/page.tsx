"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Search, Filter, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
// Fetch via API endpoints to avoid importing server actions in client component
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import RecentLoginActivity from "@/components/recent-login-activity"
import dynamic from "next/dynamic"
import useSWR from "swr"

const StudentDashboardHeader = dynamic(() => import("@/components/student-dashboard-header"), { ssr: false })

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function StudentDashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingApplications, setLoadingApplications] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("explore")

  useSWR("/api/dashboard/student", fetcher, { refreshInterval: 30000 })

  // Fetch projects and applications in parallel
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoadingProjects(true)
        setLoadingApplications(true)
        
        const [projectsRes, applicationsRes] = await Promise.all([
          fetch("/api/projects/active"),
          fetch("/api/dashboard/student?limit=100"),
        ])
        const projectsJson = await projectsRes.json()
        const applicationsJson = await applicationsRes.json()
        const projectsData = projectsRes.ok && projectsJson.success ? projectsJson.projects : []
        const applicationsData = applicationsRes.ok && applicationsJson.success ? applicationsJson.applications : []
        
        setProjects(projectsData)
        setApplications(applicationsData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoadingProjects(false)
        setLoadingApplications(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.research_area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Filter applications based on search term
  const filteredApplications = applications.filter(
    (app) =>
      app.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getApplicationForProject = (projectId: string) =>
    applications.find((application) => String(application.project_id) === String(projectId))

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500 text-white"
      case "rejected":
        return "bg-red-500 text-white"
      default:
        return "bg-orange-500 text-white"
    }
  }

  return (
    <div className="flex min-h-screen flex-col dashboard-shell">
      <StudentDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="container mx-auto grid gap-6">
          <section className="dashboard-hero rounded-lg p-6 text-white md:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">Student Workspace</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Student Dashboard</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 md:text-base">
              Explore research opportunities and track your applications at Manipal University Jaipur
            </p>
          </section>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="dashboard-panel dashboard-lift rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Projects</CardTitle>
                <FileText className="h-4 w-4 text-[#0c2461]" />
              </CardHeader>
              <CardContent>
                {loadingProjects ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-[#0c2461]">{projects.length}</div>
                    <p className="text-xs text-muted-foreground">Across various departments</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="dashboard-panel dashboard-lift rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Applications</CardTitle>
                <FileText className="h-4 w-4 text-[#e1b12c]" />
              </CardHeader>
              <CardContent>
                {loadingApplications ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-[#e1b12c]">{applications.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {applications.filter((a) => a.status === "pending").length} pending review
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="dashboard-panel dashboard-lift rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
                <FileText className="h-4 w-4 text-[#4a69bd]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#4a69bd]">85%</div>
                <p className="text-xs text-muted-foreground">Add skills to complete your profile</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-lg border border-slate-200 bg-white/90 p-1 shadow-sm sm:grid-cols-2">
                  <TabsTrigger value="explore">
                    Explore Projects
                  </TabsTrigger>
                  <TabsTrigger value="applications">
                    My Applications
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="explore" className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-semibold text-slate-950">Available Research Projects</h2>
                    <div className="flex gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search projects..."
                          className="bg-white/90 pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button variant="outline" size="icon" className="border-blue-200 bg-white/80 text-blue-700 hover:bg-blue-50">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {loadingProjects ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <CardHeader>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </CardHeader>
                          <CardContent>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredProjects.length === 0 ? (
                    <Card className="dashboard-panel rounded-lg">
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <p className="text-muted-foreground mb-4">No projects found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {filteredProjects.map((project) => {
                        const existingApplication = getApplicationForProject(project.id)

                        return (
                        <Card key={project.id} className="dashboard-panel dashboard-lift rounded-lg border-l-4 border-l-blue-600">
                          <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div>
                                <CardTitle className="text-slate-950">{project.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={project.faculty_avatar || ""}
                                      alt={project.faculty_name}
                                    />
                                    <AvatarFallback className="bg-[#e1b12c] text-[#0c2461]">
                                      {project.faculty_name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <CardDescription>
                                    {project.faculty_name} • {project.department}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge variant="outline" className="mb-2 border-[#e1b12c] text-[#0c2461]">
                                  {project.positions} positions
                                </Badge>
                                <CardDescription>
                                  Deadline: {new Date(project.deadline).toLocaleDateString()}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm mb-4">{project.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {project.tags &&
                                (typeof project.tags === 'string' ? project.tags.split(',') : project.tags || []).map((tag: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700">
                                    {tag.trim()}
                                  </Badge>
                                ))}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <Button asChild variant="outline" size="sm" className="border-blue-200 bg-white/80 text-blue-700 hover:bg-blue-50">
                              <Link href={`/projects/${project.id}`}>
                                View Details
                              </Link>
                            </Button>
                            {existingApplication ? (
                              <Button asChild variant="outline" size="sm" className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100">
                                <Link href="/dashboard/student/applications">
                                  {existingApplication.status === "pending" ? "Applied" : `Applied: ${existingApplication.status}`}
                                </Link>
                              </Button>
                            ) : (
                              <Button asChild size="sm" className="bg-[#0c2461] hover:bg-[#1e3799]">
                                <Link href={`/projects/${project.id}/apply`}>
                                  Apply Now
                                </Link>
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="applications" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-slate-950">Your Applications</h2>
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search applications..."
                        className="bg-white/90 pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {loadingApplications ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <CardHeader>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </CardHeader>
                          <CardContent>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredApplications.length === 0 ? (
                    <Card className="dashboard-panel rounded-lg">
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <p className="text-muted-foreground mb-4">No applications found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {filteredApplications.slice(0, 3).map((application) => (
                        <Card
                          key={application.id}
                          className={`dashboard-panel dashboard-lift rounded-lg border-l-4 ${
                            application.status === "approved"
                              ? "border-l-green-500"
                              : application.status === "rejected"
                                ? "border-l-red-500"
                                : "border-l-[#e1b12c]"
                          }`}
                        >
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={application.faculty_avatar || ""} alt={application.faculty_name} />
                                  <AvatarFallback>
                                    {application.faculty_name
                                      .split(" ")
                                      .map((name: string) => name[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-slate-950">{application.project_title}</CardTitle>
                                  <CardDescription className="mt-1">Faculty: {application.faculty_name}</CardDescription>
                                </div>
                              </div>
                              <Badge className={getStatusBadgeVariant(application.status)}>
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Applied on: </span>
                                <span>{new Date(application.applied_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            {application.feedback && (
                              <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                                <span className="font-medium">Feedback: </span>
                                {application.feedback}
                              </div>
                            )}
                          </CardContent>
                          <CardFooter>
                            <Button asChild variant="outline" size="sm" className="border-blue-200 bg-white/80 text-blue-700 hover:bg-blue-50">
                              <Link href={`/projects/${application.project_id}`}>
                                View Project
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                      <div className="flex justify-center mt-4">
                        <Button asChild variant="outline" className="border-blue-200 bg-white/80 text-blue-700 hover:bg-blue-50">
                          <Link href="/dashboard/student/applications">
                            View All Applications
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            <div>
              <RecentLoginActivity userRole="student" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
