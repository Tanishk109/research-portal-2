"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, X } from "lucide-react"
import Link from "next/link"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

type EditableProject = {
  id: string
  title: string
  description: string
  long_description?: string
  research_area?: string
  positions?: number
  start_date?: string
  deadline?: string
  status?: "draft" | "active" | "closed" | "completed"
  min_cgpa?: string | number
  eligibility?: string
  prerequisites?: string
  tags?: string[] | string
}

function formatDateInput(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

export default function EditProjectPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const projectId = params?.id
  const [project, setProject] = useState<EditableProject | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadProject() {
      try {
        const response = await fetch(`/api/projects/${projectId}`)
        const result = await response.json()

        if (!response.ok || !result.success || !result.project) {
          toast({
            title: "Project not found",
            description: result.message || "Unable to load this project.",
            variant: "destructive",
          })
          router.push("/dashboard/faculty/projects")
          return
        }

        const loadedProject = result.project as EditableProject
        const loadedTags = Array.isArray(loadedProject.tags)
          ? loadedProject.tags
          : typeof loadedProject.tags === "string"
            ? loadedProject.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
            : []

        setProject(loadedProject)
        setTags(loadedTags)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load project details.",
          variant: "destructive",
        })
        router.push("/dashboard/faculty/projects")
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      loadProject()
    }
  }, [projectId, router])

  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || tagInput.trim() === "") return

    event.preventDefault()
    const nextTag = tagInput.trim()
    if (!tags.includes(nextTag)) {
      setTags((currentTags) => [...currentTags, nextTag])
    }
    setTagInput("")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!project) return

    setSaving(true)
    const formData = new FormData(event.currentTarget)

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      longDescription: formData.get("description") as string,
      researchArea: formData.get("research-area") as string,
      positions: Number(formData.get("positions")),
      startDate: formData.get("start-date") as string,
      deadline: formData.get("deadline") as string,
      status: formData.get("status") as "draft" | "active" | "closed" | "completed",
      minCgpa: formData.get("min-cgpa") ? Number(formData.get("min-cgpa")) : 0,
      eligibility: formData.get("eligibility") as string,
      prerequisites: formData.get("prerequisites") as string,
      tags,
    }

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        toast({
          title: "Error",
          description: result.message || "Failed to update project.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Project updated",
        description: "Your changes have been saved.",
      })
      router.push("/dashboard/faculty/projects")
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col faculty-shell">
      <FacultyDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/dashboard/faculty/projects"
            className="mb-6 inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>

          {loading || !project ? (
            <div className="faculty-panel flex items-center justify-center rounded-lg py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <section className="faculty-hero mb-6 rounded-lg p-6 text-white md:p-8">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">Project Editor</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Edit Research Project</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 md:text-base">
                  Update the project details students see before applying.
                </p>
              </section>

              <form onSubmit={handleSubmit}>
              <Card className="faculty-panel-strong rounded-lg">
                <CardHeader>
                  <CardTitle>Edit Research Project</CardTitle>
                  <CardDescription>Update the project details students see before applying.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input id="title" name="title" defaultValue={project.title} className="bg-white/80" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={project.long_description || project.description}
                      className="min-h-[150px] bg-white/80"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="research-area">Research Area</Label>
                      <Input
                        id="research-area"
                        name="research-area"
                        defaultValue={project.research_area || ""}
                        className="bg-white/80"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue={project.status || "active"} required>
                        <SelectTrigger id="status" className="bg-white/80">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="positions">Number of Positions</Label>
                      <Input id="positions" name="positions" type="number" min="1" max="10" defaultValue={project.positions || 1} className="bg-white/80" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min-cgpa">Minimum CGPA</Label>
                      <Input
                        id="min-cgpa"
                        name="min-cgpa"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        defaultValue={project.min_cgpa || ""}
                        className="bg-white/80"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Skills & Technologies</Label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 px-2 py-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => setTags((currentTags) => currentTags.filter((currentTag) => currentTag !== tag))}
                            className="ml-1 rounded-full p-1 hover:bg-muted"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {tag}</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      id="tags"
                      placeholder="Press Enter to add a tag"
                      className="bg-white/80"
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input id="start-date" name="start-date" type="date" defaultValue={formatDateInput(project.start_date)} className="bg-white/80" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline">Application Deadline</Label>
                      <Input id="deadline" name="deadline" type="date" defaultValue={formatDateInput(project.deadline)} className="bg-white/80" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eligibility">Eligibility Criteria</Label>
                    <Textarea id="eligibility" name="eligibility" defaultValue={project.eligibility || ""} className="min-h-[100px] bg-white/80" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prerequisites">Prerequisites</Label>
                    <Textarea id="prerequisites" name="prerequisites" defaultValue={project.prerequisites || ""} className="min-h-[100px] bg-white/80" />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t border-slate-200/80 pt-6 sm:flex-row sm:justify-between">
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </Card>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
