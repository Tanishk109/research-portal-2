"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"
// Use API instead of importing server action directly in client component
import { toast } from "sonner"

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const status = submitter?.value === "draft" ? "draft" : "active"

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      longDescription: formData.get("description") as string,
      researchArea: formData.get("research-area") as string,
      positions: Number(formData.get("positions")),
      startDate: formData.get("start-date") as string,
      deadline: formData.get("deadline") as string,
      status,
      minCgpa: formData.get("min-cgpa") ? Number(formData.get("min-cgpa")) : 0,
      eligibility: formData.get("eligibility") as string,
      prerequisites: formData.get("prerequisites") as string,
      tags: tags,
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(status === "draft" ? "Draft saved successfully!" : "Project created successfully!")
        router.push("/dashboard/faculty/projects")
      } else {
        toast.error(result.message || "Failed to create project.")
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col faculty-shell">
      <FacultyDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <section className="faculty-hero mb-6 rounded-lg p-6 text-white md:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">Project Builder</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Create Research Project</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 md:text-base">
              Define the opportunity, requirements, and application window students will see.
            </p>
          </section>

          <form onSubmit={handleSubmit}>
            <Card className="faculty-panel-strong rounded-lg">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Basic information about your research project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input id="title" name="title" placeholder="e.g. Machine Learning for Healthcare" className="bg-white/80" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your research project, its goals, and what students will be working on..."
                    className="min-h-[150px] bg-white/80"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="research-area">Research Area</Label>
                    <Input
                      id="research-area"
                      name="research-area"
                      placeholder="Enter research area"
                      className="bg-white/80"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="positions">Number of Positions</Label>
                    <Input id="positions" name="positions" type="number" min="1" max="10" defaultValue="2" className="bg-white/80" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Skills & Technologies (Press Enter to add)</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 px-2 py-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
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
                    placeholder="e.g. Python, Machine Learning, Data Analysis"
                    className="bg-white/80"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" name="start-date" type="date" className="bg-white/80" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Application Deadline</Label>
                    <Input id="deadline" name="deadline" type="date" className="bg-white/80" required />
                  </div>
                </div>
              </CardContent>
              <CardHeader className="border-t border-slate-200/80">
                <CardTitle>Requirements</CardTitle>
                <CardDescription>Specify what you're looking for in student applicants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="min-cgpa">Minimum CGPA</Label>
                  <Input id="min-cgpa" name="min-cgpa" type="number" step="0.1" min="0" max="10" placeholder="e.g. 8.0" className="bg-white/80" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eligibility">Eligibility Criteria</Label>
                  <Textarea
                    id="eligibility"
                    name="eligibility"
                    placeholder="Describe the eligibility criteria for students (e.g. year of study, specific courses, etc.)"
                    className="min-h-[100px] bg-white/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <Textarea
                    id="prerequisites"
                    name="prerequisites"
                    placeholder="List any prerequisites or required skills for this project"
                    className="min-h-[100px] bg-white/80"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-slate-200/80 pt-6 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button type="submit" name="status" value="draft" variant="outline" disabled={isLoading}>
                    Save as Draft
                  </Button>
                  <Button type="submit" name="status" value="active" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </form>
        </div>
      </main>
    </div>
  )
}
