"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, ArrowLeft } from "lucide-react"
import { ApplicationForm } from "@/components/application-form"
import { toast } from "@/components/ui/use-toast"

export default function ApplyProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch project details
  useEffect(() => {
    async function fetchProject() {
      try {
        const projectId = Number.parseInt(params.id)
        if (isNaN(projectId)) {
          router.push("/projects")
          return
        }

        const res = await fetch(`/api/projects/${projectId}`)
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
  }, [params.id, router])

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
            href={`/projects/${params.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project Details
          </Link>

          <ApplicationForm
            projectId={project.id}
            projectTitle={project.title}
            facultyName={project.faculty_name}
            onCancel={handleCancel}
          />
        </div>
      </main>
    </div>
  )
}
