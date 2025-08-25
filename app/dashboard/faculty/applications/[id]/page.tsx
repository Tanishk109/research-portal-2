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
import { updateApplicationStatus } from "@/app/actions/applications"

// This would be a server action to get application details
async function getApplicationDetails(id: number) {
  // In a real implementation, this would be a server action
  // For now, we'll simulate a delay and return mock data
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // This is a placeholder - in a real implementation, you would fetch from the database
  return {
    id,
    status: "pending",
    message:
      "I am very interested in this project as it aligns perfectly with my academic interests and career goals. I have completed several courses related to this field and have hands-on experience with similar projects during my internship last summer. I am particularly fascinated by the research methodology described and believe I can contribute significantly to the project outcomes. I am proficient in the required technical skills and am eager to expand my knowledge in this domain. I am committed to dedicating the necessary time and effort to ensure the success of this research project.",
    applied_at: new Date().toISOString(),
    project: {
      id: 1,
      title: "Deep Learning for Medical Image Analysis",
      description: "Developing deep learning models for medical image analysis to aid in disease diagnosis.",
      research_area: "Artificial Intelligence",
      positions: 3,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    student: {
      id: 1,
      name: "Rahul Verma",
      registration_number: "190905001",
      department: "Computer Science",
      year: "3rd Year",
      cgpa: 8.7,
    },
  }
}

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
        const data = await getApplicationDetails(id)
        setApplication(data)
        setFeedback(data.feedback || "")
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

    fetchData()
  }, [id, toast])

  const handleUpdateStatus = async (status: "approved" | "rejected") => {
    try {
      setProcessing(true)

      const result = await updateApplicationStatus(id, status, feedback)

      if (result.success) {
        toast({
          title: "Success",
          description: `Application ${status === "approved" ? "approved" : "rejected"} successfully.`,
        })

        // Update local state
        setApplication((prev) => ({ ...prev, status }))

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/dashboard/faculty")
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
              {application.status === "pending" && (
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
