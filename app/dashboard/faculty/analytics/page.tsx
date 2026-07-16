"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"
import { getProjectAnalytics, getApplicationAnalytics } from "@/app/actions/analytics"
import { BarChart, LineChart, PieChart } from "@/components/charts"

export default function AnalyticsDashboard() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [projectAnalytics, setProjectAnalytics] = useState<any>(null)
  const [applicationAnalytics, setApplicationAnalytics] = useState<any>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const [projectData, applicationData] = await Promise.all([getProjectAnalytics(), getApplicationAnalytics()])

        setProjectAnalytics(projectData)
        setApplicationAnalytics(applicationData)
      } catch (error) {
        console.error("Error fetching analytics:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [toast])

  return (
    <div className="flex min-h-screen flex-col dashboard-shell">
      <FacultyDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="container mx-auto grid gap-6">
          <section className="dashboard-hero rounded-lg p-6 text-white md:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">Faculty Analytics</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Analytics Dashboard</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 md:text-base">
              Track metrics and performance of your research projects from the same faculty workspace.
            </p>
          </section>

          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="dashboard-panel dashboard-lift rounded-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold text-primary">{projectAnalytics?.totalProjects || 0}</div>
                )}
              </CardContent>
            </Card>
            <Card className="dashboard-panel dashboard-lift rounded-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold text-blue-500">{applicationAnalytics?.totalApplications || 0}</div>
                )}
              </CardContent>
            </Card>
            <Card className="dashboard-panel dashboard-lift rounded-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Approved Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold text-green-500">
                    {applicationAnalytics?.approvedApplications || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="dashboard-panel dashboard-lift rounded-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold text-yellow-500">{applicationAnalytics?.conversionRate || 0}%</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="projects" className="space-y-4">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-lg border border-slate-200 bg-white/90 p-1 shadow-sm md:grid-cols-3">
              <TabsTrigger value="projects">
                Project Analytics
              </TabsTrigger>
              <TabsTrigger value="applications">
                Application Analytics
              </TabsTrigger>
              <TabsTrigger value="students">
                Student Demographics
              </TabsTrigger>
            </TabsList>

            {/* Project Analytics Tab */}
            <TabsContent value="projects" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="dashboard-panel rounded-lg">
                  <CardHeader>
                    <CardTitle>Projects by Status</CardTitle>
                    <CardDescription>Distribution of projects by their current status</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <PieChart
                        data={projectAnalytics?.projectsByStatus || []}
                        index="status"
                        category="count"
                        colors={["#f97316", "#3b82f6", "#22c55e", "#ef4444"]}
                      />
                    )}
                  </CardContent>
                </Card>
                <Card className="dashboard-panel rounded-lg">
                  <CardHeader>
                    <CardTitle>Projects by Research Area</CardTitle>
                    <CardDescription>Distribution of projects across research areas</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <BarChart
                        data={projectAnalytics?.projectsByResearchArea || []}
                        index="research_area"
                        categories={["count"]}
                        colors={["#f97316"]}
                        layout="vertical"
                      />
                    )}
                  </CardContent>
                </Card>
                <Card className="dashboard-panel rounded-lg md:col-span-2">
                  <CardHeader>
                    <CardTitle>Projects Created Over Time</CardTitle>
                    <CardDescription>Number of projects created per month</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <LineChart
                        data={projectAnalytics?.projectsOverTime || []}
                        index="month"
                        categories={["count"]}
                        colors={["#f97316"]}
                        valueFormatter={(value) => `${value} projects`}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Application Analytics Tab */}
            <TabsContent value="applications" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="dashboard-panel rounded-lg">
                  <CardHeader>
                    <CardTitle>Applications by Status</CardTitle>
                    <CardDescription>Distribution of applications by their current status</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <PieChart
                        data={applicationAnalytics?.applicationsByStatus || []}
                        index="status"
                        category="count"
                        colors={["#3b82f6", "#22c55e", "#ef4444"]}
                      />
                    )}
                  </CardContent>
                </Card>
                <Card className="dashboard-panel rounded-lg">
                  <CardHeader>
                    <CardTitle>Top Projects by Applications</CardTitle>
                    <CardDescription>Projects with the most applications</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <BarChart
                        data={applicationAnalytics?.topProjectsByApplications || []}
                        index="title"
                        categories={["count"]}
                        colors={["#f97316"]}
                        layout="vertical"
                      />
                    )}
                  </CardContent>
                </Card>
                <Card className="dashboard-panel rounded-lg md:col-span-2">
                  <CardHeader>
                    <CardTitle>Applications Over Time</CardTitle>
                    <CardDescription>Number of applications received per month</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <LineChart
                        data={applicationAnalytics?.applicationsOverTime || []}
                        index="month"
                        categories={["count"]}
                        colors={["#3b82f6"]}
                        valueFormatter={(value) => `${value} applications`}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Student Demographics Tab */}
            <TabsContent value="students" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="dashboard-panel rounded-lg">
                  <CardHeader>
                    <CardTitle>Applicants by Department</CardTitle>
                    <CardDescription>Distribution of applicants across departments</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <PieChart
                        data={applicationAnalytics?.applicantsByDepartment || []}
                        index="department"
                        category="count"
                        colors={["#f97316", "#3b82f6", "#22c55e", "#ef4444", "#a855f7", "#ec4899"]}
                      />
                    )}
                  </CardContent>
                </Card>
                <Card className="dashboard-panel rounded-lg">
                  <CardHeader>
                    <CardTitle>Applicants by Year</CardTitle>
                    <CardDescription>Distribution of applicants by academic year</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <BarChart
                        data={applicationAnalytics?.applicantsByYear || []}
                        index="year"
                        categories={["count"]}
                        colors={["#f97316"]}
                      />
                    )}
                  </CardContent>
                </Card>
                <Card className="dashboard-panel rounded-lg">
                  <CardHeader>
                    <CardTitle>Applicants by CGPA Range</CardTitle>
                    <CardDescription>Distribution of applicants by CGPA range</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <BarChart
                        data={applicationAnalytics?.applicantsByCGPA || []}
                        index="range"
                        categories={["count"]}
                        colors={["#3b82f6"]}
                      />
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Application Success Rate by Department</CardTitle>
                    <CardDescription>Percentage of approved applications by department</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <BarChart
                        data={applicationAnalytics?.successRateByDepartment || []}
                        index="department"
                        categories={["rate"]}
                        colors={["#22c55e"]}
                        layout="vertical"
                        valueFormatter={(value) => `${value}%`}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
