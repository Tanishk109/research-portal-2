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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <FacultyDashboardHeader />
      <main className="flex-1 p-6 md:p-10">
        <div className="grid gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track metrics and performance of your research projects</p>
          </div>

          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="border-t-4 border-t-primary">
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
            <Card className="border-t-4 border-t-blue-500">
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
            <Card className="border-t-4 border-t-green-500">
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
            <Card className="border-t-4 border-t-yellow-500">
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
            <TabsList className="bg-white border">
              <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Project Analytics
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Application Analytics
              </TabsTrigger>
              <TabsTrigger value="students" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Student Demographics
              </TabsTrigger>
            </TabsList>

            {/* Project Analytics Tab */}
            <TabsContent value="projects" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
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
                <Card>
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
                <Card className="md:col-span-2">
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
                <Card>
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
                <Card>
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
                <Card className="md:col-span-2">
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
                <Card>
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
                <Card>
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
                <Card>
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
