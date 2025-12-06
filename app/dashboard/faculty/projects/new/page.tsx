"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      longDescription: formData.get("description") as string, // You may want a separate field for longDescription
      researchArea: formData.get("research-area") as string,
      positions: Number(formData.get("positions")),
      startDate: formData.get("start-date") as string,
      deadline: formData.get("deadline") as string,
      status: "active" as "active",
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
        toast.success("Project created successfully!")
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
    <div className="flex min-h-screen flex-col">
      <FacultyDashboardHeader />
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create New Research Project</h1>
            <p className="text-muted-foreground mt-2">
              Provide details about your research project to attract qualified students
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Basic information about your research project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input id="title" name="title" placeholder="e.g. Machine Learning for Healthcare" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your research project, its goals, and what students will be working on..."
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="research-area">Research Area</Label>
                    <Select name="research-area" required>
                      <SelectTrigger id="research-area">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai">Artificial Intelligence</SelectItem>
                        <SelectItem value="ml">Machine Learning</SelectItem>
                        <SelectItem value="nlp">Natural Language Processing</SelectItem>
                        <SelectItem value="cv">Computer Vision</SelectItem>
                        <SelectItem value="re">Renewable Energy</SelectItem>
                        <SelectItem value="bio">Biotechnology</SelectItem>
                        <SelectItem value="qc">Quantum Computing</SelectItem>
                        <SelectItem value="bc">Blockchain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="positions">Number of Positions</Label>
                    <Input id="positions" name="positions" type="number" min="1" max="10" defaultValue="2" required />
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
                          className="ml-1 rounded-full hover:bg-muted p-1"
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
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" name="start-date" type="date" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Application Deadline</Label>
                    <Input id="deadline" name="deadline" type="date" required />
                  </div>
                </div>
              </CardContent>
              <CardHeader className="border-t">
                <CardTitle>Requirements</CardTitle>
                <CardDescription>Specify what you're looking for in student applicants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="min-cgpa">Minimum CGPA</Label>
                  <Input id="min-cgpa" name="min-cgpa" type="number" step="0.1" min="0" max="10" placeholder="e.g. 8.0" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eligibility">Eligibility Criteria</Label>
                  <Textarea
                    id="eligibility"
                    name="eligibility"
                    placeholder="Describe the eligibility criteria for students (e.g. year of study, specific courses, etc.)"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <Textarea
                    id="prerequisites"
                    name="prerequisites"
                    placeholder="List any prerequisites or required skills for this project"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline">
                    Save as Draft
                  </Button>
                  <Button type="submit" disabled={isLoading}>
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
