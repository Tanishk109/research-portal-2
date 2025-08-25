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
import { getActiveProjects } from "@/app/actions/projects"
import { getStudentApplications } from "@/app/actions/applications"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import RecentLoginActivity from "@/components/recent-login-activity"
import dynamic from "next/dynamic"
import useSWR from "swr"
import Image from "next/image"

const StudentDashboardHeader = dynamic(() => import("@/components/student-dashboard-header"), { ssr: false })

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function StudentDashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingApplications, setLoadingApplications] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("explore")

  const { data, error, isLoading: swrLoading } = useSWR("/api/dashboard/student", fetcher, { refreshInterval: 30000 })

  // Fetch projects and applications in parallel
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoadingProjects(true)
        setLoadingApplications(true)
        
        const [projectsData, applicationsData] = await Promise.all([
          getActiveProjects(),
          getStudentApplications()
        ])
        
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <StudentDashboardHeader />
      <main className="flex-1 p-6 md:p-10">
        <div className="grid gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0c2461]">Student Dashboard</h1>
            <p className="text-muted-foreground">
              Explore research opportunities and track your applications at Manipal University Jaipur
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-t-4 border-t-[#0c2461]">
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
            <Card className="border-t-4 border-t-[#e1b12c]">
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
              <CardFooter className="p-0 pt-2">
                <Link href="/dashboard/student/applications" className="text-xs text-[#e1b12c] hover:underline">
                  View all applications
                </Link>
              </CardFooter>
            </Card>
            <Card className="border-t-4 border-t-[#4a69bd]">
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
                <TabsList className="bg-white border">
                  <TabsTrigger
                    value="explore"
                    className="data-[state=active]:bg-[#0c2461] data-[state=active]:text-white"
                  >
                    Explore Projects
                  </TabsTrigger>
                  <TabsTrigger
                    value="applications"
                    className="data-[state=active]:bg-[#0c2461] data-[state=active]:text-white"
                  >
                    My Applications
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="explore" className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-semibold text-[#0c2461]">Available Research Projects</h2>
                    <div className="flex gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search projects..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button variant="outline" size="icon" className="border-[#0c2461] text-[#0c2461]">
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
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <p className="text-muted-foreground mb-4">No projects found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {filteredProjects.map((project) => (
                        <Card key={project.id} className="border-l-4 border-l-[#0c2461]">
                          <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div>
                                <CardTitle className="text-[#0c2461]">{project.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={project.faculty_avatar || "/placeholder.svg?height=24&width=24"}
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
                                project.tags.map((tag: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="bg-[#0c2461]/10 text-[#0c2461]">
                                    {tag}
                                  </Badge>
                                ))}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <Link href={`/projects/${project.id}`}>
                              <Button variant="outline" size="sm" className="text-[#0c2461] border-[#0c2461]">
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/projects/${project.id}/apply`}>
                              <Button size="sm" className="bg-[#0c2461] hover:bg-[#1e3799]">
                                Apply Now
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="applications" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-[#0c2461]">Your Applications</h2>
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search applications..."
                        className="pl-8"
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
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <p className="text-muted-foreground mb-4">No applications found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {filteredApplications.slice(0, 3).map((application) => (
                        <Card
                          key={application.id}
                          className={`border-l-4 ${
                            application.status === "approved"
                              ? "border-l-green-500"
                              : application.status === "rejected"
                                ? "border-l-red-500"
                                : "border-l-[#e1b12c]"
                          }`}
                        >
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-[#0c2461]">{application.project_title}</CardTitle>
                                <CardDescription className="mt-1">Faculty: {application.faculty_name}</CardDescription>
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
                            <Link href={`/projects/${application.project_id}`}>
                              <Button variant="outline" size="sm" className="text-[#0c2461] border-[#0c2461]">
                                View Project
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      ))}
                      <div className="flex justify-center mt-4">
                        <Link href="/dashboard/student/applications">
                          <Button variant="outline" className="text-[#0c2461] border-[#0c2461]">
                            View All Applications
                          </Button>
                        </Link>
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
