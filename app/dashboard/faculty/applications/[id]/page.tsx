"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Calendar, FileText, GraduationCap, User } from "lucide-react"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"

export default function ApplicationDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<any>(null)
  const [feedback, setFeedback] = useState("")
  const [processing, setProcessing] = useState(false)

  const resume = application?.student?.resume

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/dashboard/faculty/applications/${id}`)
        const result = await res.json()
        
        if (!res.ok || !result.success || !result.application) {
          toast({
            title: "Error",
            description: result.message || "Failed to load application details. Please try again.",
            variant: "destructive",
          })
          return
        }

        const app = result.application
        const mappedApp = {
          ...app,
          status: app.status === "accepted" ? "approved" : app.status,
          project: app.project,
          student: app.student,
        }
        
        setApplication(mappedApp)
        setFeedback(app.feedback || "")
      } catch (error) {
        console.error("Error fetching application details:", error)
        toast({
          title: "Error",
          description: "Failed to load application details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (!id) {
      setLoading(false)
      return
    }

    fetchData()
  }, [id, toast])

  const handleUpdateStatus = async (status: "approved" | "rejected") => {
    try {
      setProcessing(true)

      const res = await fetch(`/api/dashboard/faculty/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback }),
      })

      const result = await res.json()

      if (res.ok && result.success) {
        toast({
          title: "Success",
          description: `Application ${status === "approved" ? "approved" : "rejected"} successfully.`,
        })

        // Update local state
        setApplication((prev: any) => ({ ...prev, status }))

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/dashboard/faculty/applications")
        }, 1500)
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
      setProcessing(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col dashboard-shell">
      <FacultyDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="container mx-auto mb-6">
          <Link href="/dashboard/faculty/applications" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-950">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </div>

        {loading ? (
          <div className="container mx-auto grid gap-6">
            <Skeleton className="h-10 w-3/4" />
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-40" />
              <Skeleton className="h-40 md:col-span-2" />
            </div>
            <Skeleton className="h-60" />
          </div>
        ) : application ? (
          <div className="container mx-auto grid gap-6">
            <section className="dashboard-hero rounded-lg p-6 text-white md:p-8">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">Application Review</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Application Details</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 md:text-base">
                Review student application details and provide feedback from the same faculty workspace.
              </p>
            </section>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="dashboard-panel rounded-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Student Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={application.student.avatar || ""}
                        alt={application.student.name}
                      />
                      <AvatarFallback className="text-lg bg-secondary text-primary">
                        {application.student.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">{application.student.name}</h3>
                      <p className="text-sm text-muted-foreground">{application.student.registration_number}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{application.student.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{application.student.year}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>CGPA: {application.student.cgpa}</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200/80 bg-white/75 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Resume</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {resume
                            ? `${resume.file_name || "Resume.pdf"}${
                                resume.uploaded_at ? ` • uploaded ${new Date(resume.uploaded_at).toLocaleDateString()}` : ""
                              }`
                            : "No PDF resume uploaded yet"}
                        </p>
                      </div>
                      {resume ? (
                        <Button asChild variant="outline" size="sm" className="shrink-0 bg-white/90">
                          <a href={resume.file_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2 h-4 w-4" />
                            View PDF
                          </a>
                        </Button>
                      ) : (
                        <Badge variant="outline" className="shrink-0 bg-white/80">
                          Missing
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-panel rounded-lg md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">{application.project.title}</h3>
                    <p className="text-sm text-muted-foreground">{application.project.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Research Area</p>
                      <p className="font-medium">{application.project.research_area}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Positions</p>
                      <p className="font-medium">{application.project.positions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-medium">{new Date(application.project.deadline).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Application Status</p>
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
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="dashboard-panel rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg">Application Message</CardTitle>
                <CardDescription>Submitted on {new Date(application.applied_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200/80 bg-white/75 p-4">
                  <p className="whitespace-pre-wrap">{application.message}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-panel-strong rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg">Your Feedback</CardTitle>
                <CardDescription>Provide feedback to the student about their application</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your feedback here..."
                  className="min-h-[100px] bg-white/90"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={application.status !== "pending" || processing}
                />
              </CardContent>
              {(application.status === "pending" || application.status === "Pending") && (
                <CardFooter className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    className="border-red-200 bg-white/80 text-red-600 hover:bg-red-50"
                    onClick={() => handleUpdateStatus("rejected")}
                    disabled={processing}
                  >
                    Reject Application
                  </Button>
                  <Button
                    className="shadow-lg shadow-blue-600/20"
                    onClick={() => handleUpdateStatus("approved")}
                    disabled={processing}
                  >
                    Approve Application
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        ) : (
          <div className="dashboard-panel mx-auto flex max-w-3xl flex-col items-center justify-center rounded-lg py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Application not found</h3>
            <p className="text-muted-foreground mt-1">
              The application you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/dashboard/faculty" className="mt-4">
              <Button className="bg-primary hover:bg-primary/90">Return to Dashboard</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
