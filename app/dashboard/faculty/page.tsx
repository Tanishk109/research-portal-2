"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { getFacultyProjects } from "@/app/actions/projects"
import { getFacultyApplications } from "@/app/actions/applications"
import { getRecentLoginActivity } from "@/app/actions/activity"
import dynamic from "next/dynamic"
import useSWR from "swr"

interface Project {
  id: string
  title: string
  status: string
  application_count: number
  created_at: string
}

interface Application {
  id: string
  project_title: string
  student_name: string
  student_avatar?: string | null
  status: string
  applied_at: string
}

interface LoginActivity {
  id: string
  timestamp: string
  ip_address: string
  success: boolean
  device_type: string
}

const FacultyDashboardHeader = dynamic(() => import("@/components/faculty-dashboard-header"), { ssr: false })

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function FacultyDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { isLoading: swrLoading } = useSWR("/api/dashboard/faculty", fetcher, { refreshInterval: 30000 })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      // Parallelize all data fetching
      const [projectsData, applicationsData, activityResult] = await Promise.all([
        getFacultyProjects(),
        getFacultyApplications(),
        getRecentLoginActivity(5),
      ])
      setProjects((projectsData || []).slice(0, 5))
      setApplications((applicationsData || []).slice(0, 5))
      if (activityResult && activityResult.success && activityResult.activities) {
        setLoginActivity(activityResult.activities)
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading || swrLoading) {
    return (
      <div className="min-h-screen faculty-shell">
        <FacultyDashboardHeader />
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-40 rounded-lg bg-slate-200"></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 rounded-lg bg-slate-200"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-96 rounded-lg bg-slate-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen faculty-shell">
      <FacultyDashboardHeader />
      
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="space-y-6">
          <div className="faculty-hero rounded-lg p-6 text-white md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">Faculty Command Center</p>
                <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
                  Manage research momentum with clarity.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 md:text-base">
                  Track projects, review student interest, and move from idea to collaboration from one focused workspace.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div>
                  <p className="text-2xl font-semibold">{projects.filter((project) => project.status === "active").length}</p>
                  <p className="text-xs text-slate-200">Active</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{applications.filter((application) => application.status === "pending").length}</p>
                  <p className="text-xs text-slate-200">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{loginActivity.length}</p>
                  <p className="text-xs text-slate-200">Sessions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="faculty-panel faculty-lift rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <span className="faculty-metric-icon rounded-md bg-blue-600 p-2 text-white">
                  <BookOpen className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{projects.length}</div>
                <p className="text-xs text-muted-foreground">
                  {projects.filter(p => p.status === 'active').length} active
                </p>
              </CardContent>
            </Card>

            <Card className="faculty-panel faculty-lift rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <span className="faculty-metric-icon rounded-md bg-teal-600 p-2 text-white">
                  <Users className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{applications.length}</div>
                <p className="text-xs text-muted-foreground">
                  {applications.filter(a => a.status === 'pending').length} pending review
                </p>
              </CardContent>
            </Card>

            <Card className="faculty-panel faculty-lift rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <span className="faculty-metric-icon rounded-md bg-amber-500 p-2 text-white">
                  <TrendingUp className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{loginActivity.length}</div>
                <p className="text-xs text-muted-foreground">
                  Last login: {loginActivity.length > 0 ? formatDate(loginActivity[0].timestamp) : 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="faculty-panel-strong rounded-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Create a focused research opening for students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard/faculty/projects/new">
                  <Button className="flex items-center gap-2 shadow-lg shadow-blue-600/20">
                    <Plus className="h-4 w-4" />
                    Create New Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-lg border border-slate-200 bg-white/80 p-1 shadow-sm md:grid-cols-3">
              <TabsTrigger value="projects">Recent Projects</TabsTrigger>
              <TabsTrigger value="applications">Recent Applications</TabsTrigger>
              <TabsTrigger value="activity">Login Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <Card className="faculty-panel rounded-lg">
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>
                    Your latest research projects and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No projects found. Create your first research project!</p>
                      <Link href="/dashboard/faculty/projects/new">
                        <Button className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Project
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div key={project.id} className="flex flex-col gap-4 rounded-lg border border-slate-200/80 bg-white/75 p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-950">{project.title}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(project.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {project.application_count} applications
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                            <Link href={`/projects/${project.id}`}>
                              <Button variant="outline" size="sm" className="bg-white/80">
                                <Eye className="h-3 w-3" />
                                <span className="sr-only">View project</span>
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              <Card className="faculty-panel rounded-lg">
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>
                    Latest student applications to your projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {applications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No applications yet. Students will appear here when they apply to your projects.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div key={application.id} className="flex flex-col gap-4 rounded-lg border border-slate-200/80 bg-white/75 p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-1 items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={application.student_avatar || ""} alt={application.student_name} />
                              <AvatarFallback>
                                {application.student_name
                                  .split(" ")
                                  .map((name) => name[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-slate-950">{application.student_name}</h3>
                              <p className="text-sm text-muted-foreground">{application.project_title}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(application.applied_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                            <Link href={`/dashboard/faculty/applications/${application.id}`}>
                              <Button variant="outline" size="sm" className="bg-white/80">
                                <Eye className="h-3 w-3" />
                                <span className="sr-only">View application</span>
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card className="faculty-panel rounded-lg">
                <CardHeader>
                  <CardTitle>Recent Login Activity</CardTitle>
                  <CardDescription>
                    Your recent login sessions and security events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loginActivity.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent login activity found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {loginActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white/75 p-4 shadow-sm">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {activity.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="font-medium">
                                {activity.success ? 'Successful Login' : 'Failed Login Attempt'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(activity.timestamp)}
                              </span>
                              <span>{activity.device_type}</span>
                              <span>{activity.ip_address}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 
