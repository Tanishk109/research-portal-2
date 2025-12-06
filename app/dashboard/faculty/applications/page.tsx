"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const [processingApplicationIds, setProcessingApplicationIds] = useState<number[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [pendingBulkAction, setPendingBulkAction] = useState<null | { type: "approved" | "rejected" }>(null)

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

  const handleUpdateApplicationStatus = async (id: number, status: "approved" | "rejected", feedback?: string) => {
    try {
      setProcessingApplicationIds((prev) => [...prev, id])
      const res = await fetch(`/api/dashboard/faculty/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback }),
      })
      const result = await res.json()

      if (res.ok && result.success) {
        // Update local state
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status, feedback: feedback || app.feedback } : app)),
        )

        toast({
          title: "Success",
          description: `Application ${status === "approved" ? "approved" : "rejected"} successfully.`,
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update application status.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating application status:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingApplicationIds((prev) => prev.filter((appId) => appId !== id))
    }
  }

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

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredApplications.map((a) => a.id) : [])
  }

  const runBulkAction = async (type: "approved" | "rejected", feedback?: string) => {
    const ids = selectedIds.slice()
    if (ids.length === 0) return
    setProcessingApplicationIds((prev) => [...prev, ...ids])
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`/api/dashboard/faculty/applications/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: type, feedback }),
          })
          return res.ok
        })
      )
      const successCount = results.filter(Boolean).length
      // Update local state
      setApplications((prev) =>
        prev.map((app) => (ids.includes(app.id) ? { ...app, status: type, feedback: feedback || app.feedback } : app))
      )
      setSelectedIds([])
      toast({ title: "Done", description: `Updated ${successCount}/${ids.length} application(s).` })
    } catch (e) {
      toast({ title: "Error", description: "Failed to run bulk action", variant: "destructive" })
    } finally {
      setProcessingApplicationIds((prev) => prev.filter((id) => !ids.includes(id)))
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <FacultyDashboardHeader />
      <main className="flex-1 p-6 md:p-10">
        <div className="grid gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Student Applications</h1>
            <p className="text-muted-foreground">Review and manage applications to your research projects</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
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
                <SelectTrigger className="w-full md:w-[220px]">
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

          <div className="grid gap-4">
            {filteredApplications.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="select-all"
                        checked={selectedIds.length === filteredApplications.length}
                        onCheckedChange={(c) => toggleSelectAll(Boolean(c))}
                      />
                      <label htmlFor="select-all" className="text-sm text-muted-foreground">
                        Select all ({selectedIds.length}/{filteredApplications.length})
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={selectedIds.length === 0}
                        onClick={() => {
                          setPendingBulkAction({ type: "rejected" })
                          setFeedbackText("Thank you for your interest, but we have selected other candidates.")
                          setIsFeedbackOpen(true)
                        }}
                        className="text-red-600 border-red-600"
                      >
                        Bulk Reject
                      </Button>
                      <Button
                        disabled={selectedIds.length === 0}
                        onClick={() => {
                          setPendingBulkAction({ type: "approved" })
                          setFeedbackText("Congratulations! We're excited to have you join our research team.")
                          setIsFeedbackOpen(true)
                        }}
                      >
                        Bulk Approve
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
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
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </CardFooter>
                  </Card>
                ))
            ) : filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <Card
                  key={application.id}
                  className={`border-l-4 ${
                    application.status === "approved"
                      ? "border-l-green-500"
                      : application.status === "rejected"
                        ? "border-l-red-500"
                        : "border-l-secondary"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedIds.includes(application.id)}
                          onCheckedChange={(c) => toggleSelect(application.id, Boolean(c))}
                        />
                        <Avatar>
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=${application.student_name.charAt(0)}`}
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
                          <CardTitle className="text-lg text-primary">{application.student_name}</CardTitle>
                          <CardDescription>
                            {application.registration_number} • {application.year} • CGPA: {application.cgpa}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          application.status === "approved"
                            ? "success"
                            : application.status === "rejected"
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
                      <Button variant="outline" size="sm" className="text-primary border-primary">
                        View Application
                      </Button>
                    </Link>
                    {application.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 border-red-500"
                          onClick={() =>
                            handleUpdateApplicationStatus(
                              application.id,
                              "rejected",
                              "Thank you for your interest, but we have selected other candidates.",
                            )
                          }
                          disabled={processingApplicationIds.includes(application.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={() =>
                            handleUpdateApplicationStatus(
                              application.id,
                              "approved",
                              "Congratulations! We're excited to have you join our research team.",
                            )
                          }
                          disabled={processingApplicationIds.includes(application.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
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
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingBulkAction?.type === "approved" ? "Approve" : "Reject"} {selectedIds.length} application(s)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Feedback (optional)</label>
            <Input
              placeholder="Write a short feedback message"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsFeedbackOpen(false)
                setPendingBulkAction(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!pendingBulkAction) return
                setIsFeedbackOpen(false)
                await runBulkAction(pendingBulkAction.type, feedbackText)
                setPendingBulkAction(null)
                setFeedbackText("")
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
