"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, ArrowLeft, CheckCircle } from "lucide-react"
import { ApplicationForm } from "@/components/application-form"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { hasStudentAppliedToProject } from "@/app/actions/projects"

export default function ApplyProjectPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const projectId = params?.id
  const [project, setProject] = useState<any>(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch project details
  useEffect(() => {
    async function fetchProject() {
      if (!projectId) {
        router.push("/projects")
        return
      }

      try {
        const [res, applied] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          hasStudentAppliedToProject(projectId),
        ])
        const result = await res.json()
        
        if (!res.ok || !result.success || !result.project) {
          toast({
            title: "Error",
            description: result.message || "Failed to load project details",
            variant: "destructive",
          })
          router.push("/projects")
          return
        }

        setProject(result.project)
        setAlreadyApplied(applied)
      } catch (error) {
        console.error("Error fetching project:", error)
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        })
        router.push("/projects")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId, router])

  const handleCancel = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <BookOpen className="h-5 w-5" />
              <span>Research Portal</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-10 flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-2xl">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded w-full"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!project || !projectId) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <BookOpen className="h-5 w-5" />
              <span>Research Portal</span>
            </Link>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center p-6 md:p-10">
          <div className="text-center">
            <p className="text-muted-foreground">Project unavailable.</p>
            <Link href="/projects" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
              Back to Projects
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-5 w-5" />
            <span>Research Portal</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-10">
        <div className="container mx-auto max-w-2xl">
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project Details
          </Link>

          {alreadyApplied ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Application Already Submitted
                </CardTitle>
                <CardDescription>
                  You have already applied for "{project.title}". Duplicate applications are not allowed for the same project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You can review your submitted application and current status from your student applications page.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/projects/${projectId}`}>Back to Project</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard/student/applications">View My Applications</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <ApplicationForm
              projectId={project.id}
              projectTitle={project.title}
              facultyName={project.faculty_name}
              onCancel={handleCancel}
            />
          )}
        </div>
      </main>
    </div>
  )
}
