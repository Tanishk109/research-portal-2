"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Search, AlertCircle } from "lucide-react"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"
// Use API endpoints; avoid importing server actions in client component

export default function FacultyApplicationsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/dashboard/faculty/applications")
        const json = await res.json()
        setApplications((res.ok && json.success ? json.applications : []) || [])
      } catch (error) {
        console.error("Error fetching applications:", error)
        toast({
          title: "Error",
          description: "Failed to load applications. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/dashboard/faculty")
        const json = await res.json()
        setProjects((res.ok && json.success ? json.projects : []) || [])
      } catch (e) {
        // ignore
      }
    }

    fetchApplications()
    fetchProjects()
  }, [toast])

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || application.status === statusFilter
    const matchesProject = projectFilter === "all" || String(application.project_id) === projectFilter

    return matchesSearch && matchesStatus && matchesProject
  })

  return (
    <div className="flex min-h-screen flex-col dashboard-shell">
      <FacultyDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="container mx-auto grid gap-6">
          <section className="dashboard-hero rounded-lg p-6 text-white md:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">Faculty Applications</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Student Applications</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 md:text-base">
              Review, filter, and manage applications to your research projects with a consistent faculty workflow.
            </p>
          </section>

          <section className="dashboard-panel rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                className="bg-white/90 pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-white/90 md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-full bg-white/90 md:w-[220px]">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          </section>

          <div className="grid gap-4">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="dashboard-panel rounded-lg">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div>
                          <Skeleton className="h-6 w-40 mb-1" />
                          <Skeleton className="h-4 w-60" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Skeleton className="h-9 w-32" />
                      <Skeleton className="h-9 w-32" />
                    </CardFooter>
                  </Card>
                ))
            ) : filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <Card
                  key={application.id}
                  className={`dashboard-panel dashboard-lift rounded-lg border-l-4 ${
                    application.status === "approved"
                      ? "border-l-green-500"
                      : application.status === "rejected"
                        ? "border-l-red-500"
                        : "border-l-secondary"
                  }`}
                >
                  <CardHeader className="pb-2">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={application.student_avatar || ""}
                            alt={application.student_name}
                          />
                          <AvatarFallback className="bg-secondary text-primary">
                            {application.student_name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg text-slate-950">{application.student_name}</CardTitle>
                          <CardDescription>
                            {application.registration_number} • {application.year} • CGPA: {application.cgpa}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          application.status === "rejected"
                              ? "destructive"
                              : "outline"
                        }
                        className={
                          application.status === "approved"
                            ? "bg-green-500"
                            : application.status === "rejected"
                              ? "bg-red-500"
                              : "bg-secondary text-primary"
                        }
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Applied for: </span>
                      <span className="font-medium">{application.project_title}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Applied on: </span>
                      <span>{new Date(application.applied_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href={`/dashboard/faculty/applications/${application.id}`}>
                      <Button variant="outline" size="sm" className="border-blue-200 bg-white/80 text-blue-700 hover:bg-blue-50">
                        View Application
                      </Button>
                    </Link>
                    {application.status === "pending" && (
                      <p className="text-sm text-muted-foreground">Open application to approve or reject</p>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="dashboard-panel flex flex-col items-center justify-center rounded-lg py-12 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No applications found</h3>
                <p className="text-muted-foreground mt-1">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters or search term"
                    : "You don't have any applications yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
