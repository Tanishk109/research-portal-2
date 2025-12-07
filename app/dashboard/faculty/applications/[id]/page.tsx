"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

export default function ApplicationDetailsPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<any>(null)
  const [feedback, setFeedback] = useState("")
  const [processing, setProcessing] = useState(false)

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
        // Map status from "accepted" to "approved" for frontend
        const mappedApp = {
          ...app,
          status: app.status === "accepted" ? "approved" : app.status,
          project: {
            id: app.project_id,
            title: app.project_title,
            description: "",
            research_area: "",
            positions: 0,
            deadline: "",
          },
          student: {
            id: app.student_id,
            name: app.student_name,
            registration_number: app.registration_number,
            department: app.department,
            year: app.year || "",
            cgpa: app.cgpa,
          },
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

    if (id) {
    fetchData()
    }
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
        setApplication((prev) => ({ ...prev, status }))

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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <FacultyDashboardHeader />
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-6">
          <Link href="/dashboard/faculty" className="inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6">
            <Skeleton className="h-10 w-3/4" />
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-40" />
              <Skeleton className="h-40 md:col-span-2" />
            </div>
            <Skeleton className="h-60" />
          </div>
        ) : application ? (
          <div className="grid gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">Application Details</h1>
              <p className="text-muted-foreground">Review student application for your research project</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Student Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={`/placeholder.svg?height=64&width=64&text=${application.student.name.charAt(0)}`}
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
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
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
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Message</CardTitle>
                <CardDescription>Submitted on {new Date(application.applied_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-md border">
                  <p className="whitespace-pre-wrap">{application.message}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Feedback</CardTitle>
                <CardDescription>Provide feedback to the student about their application</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your feedback here..."
                  className="min-h-[100px]"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={application.status !== "pending" || processing}
                />
              </CardContent>
              {(application.status === "pending" || application.status === "Pending") && (
                <CardFooter className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => handleUpdateStatus("rejected")}
                    disabled={processing}
                  >
                    Reject Application
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
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
          <div className="flex flex-col items-center justify-center py-10 text-center">
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
