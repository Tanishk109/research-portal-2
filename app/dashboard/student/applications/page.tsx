"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Calendar } from "lucide-react"
import { getStudentApplications } from "@/app/actions/applications"
import StudentDashboardHeader from "@/components/student-dashboard-header"
import { toast } from "@/components/ui/use-toast"

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function fetchApplications() {
      try {
        const data = await getStudentApplications()
        setApplications(data)
      } catch (error) {
        console.error("Error fetching applications:", error)
        toast({
          title: "Error",
          description: "Failed to load your applications",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.faculty_name.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && app.status === activeTab
  })

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
            <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
            <p className="text-muted-foreground">Track and manage your research project applications</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Applications</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
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
                <Link href="/projects">
                  <Button>Browse Projects</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredApplications.map((application) => (
                <Card
                  key={application.id}
                  className={`border-l-4 ${
                    application.status === "approved"
                      ? "border-l-green-500"
                      : application.status === "rejected"
                        ? "border-l-red-500"
                        : "border-l-orange-500"
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{application.project_title}</CardTitle>
                        <CardDescription className="mt-1">Faculty: {application.faculty_name}</CardDescription>
                      </div>
                      <Badge className={getStatusBadgeVariant(application.status)}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Applied on: </span>
                        <span>{new Date(application.applied_at).toLocaleDateString()}</span>
                      </div>

                      <div className="bg-muted p-3 rounded-md">
                        <p className="font-medium mb-1">Your Message:</p>
                        <p className="text-muted-foreground">
                          {application.message.length > 150
                            ? `${application.message.substring(0, 150)}...`
                            : application.message}
                        </p>
                      </div>
                    </div>

                    {application.feedback && (
                      <div className="p-3 bg-muted rounded-md text-sm">
                        <p className="font-medium mb-1">Faculty Feedback:</p>
                        <p className="text-muted-foreground">{application.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link href={`/projects/${application.project_id}`}>
                      <Button variant="outline">View Project</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
