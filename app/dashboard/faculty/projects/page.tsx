"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Search, AlertCircle, Trash2, Edit } from "lucide-react"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"
import { getFacultyProjects, deleteProject } from "@/app/actions/projects"

export default function FacultyProjectsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const data = await getFacultyProjects()
        setProjects(data || [])
      } catch (error) {
        console.error("Error fetching projects:", error)
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [toast])

  const handleDeleteProject = async (id: string) => {
    try {
      setDeletingProjectId(id)
      const result = await deleteProject(id)

      if (result.success) {
        setProjects((prev) => prev.filter((project) => project.id !== id))
        toast({
          title: "Success",
          description: "Project deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete project.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingProjectId(null)
    }
  }

  const normalizeTags = (tags: unknown): string[] => {
    if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean)
    if (typeof tags === "string") return tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    return []
  }

  const formatStatus = (status: unknown) => {
    const normalizedStatus = String(status || "draft")
    return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
  }

  const filteredProjects = projects.filter((project) => {
    const tags = normalizeTags(project.tags)
    const matchesSearch =
      String(project.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(project.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(project.research_area || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const activeProjects = projects.filter((project) => project.status === "active").length
  const draftProjects = projects.filter((project) => project.status === "draft").length
  const totalApplications = projects.reduce((total, project) => total + Number(project.application_count || 0), 0)

  const getStatusClassName = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "draft":
        return "bg-slate-100 text-slate-700 border-slate-200"
      case "closed":
        return "bg-rose-100 text-rose-700 border-rose-200"
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  return (
    <div className="flex min-h-screen flex-col faculty-shell">
      <FacultyDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="container mx-auto">
          <div className="grid gap-6">
            <section className="faculty-hero rounded-lg p-6 text-white md:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr] lg:items-end">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">Project Portfolio</p>
                  <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">Research Projects</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 md:text-base">
                    Shape opportunities, manage student demand, and keep every research opening easy to inspect.
                  </p>
                  <Link href="/dashboard/faculty/projects/new" className="mt-6 inline-flex">
                    <Button className="gap-2 bg-white text-slate-950 shadow-lg shadow-slate-950/20 hover:bg-slate-100">
                      <Plus className="h-4 w-4" /> Create New Project
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-3 rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
                  <div>
                    <p className="text-2xl font-semibold">{projects.length}</p>
                    <p className="text-xs text-slate-200">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{activeProjects}</p>
                    <p className="text-xs text-slate-200">Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{totalApplications}</p>
                    <p className="text-xs text-slate-200">Applicants</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="faculty-panel rounded-lg p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Portfolio Control</h2>
                  <p className="text-sm text-muted-foreground">{draftProjects} drafts ready for refinement</p>
                </div>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      className="bg-white/80 pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full bg-white/80 md:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
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
                    <Card key={i} className="faculty-panel rounded-lg">
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Skeleton className="h-9 w-24" />
                        <div className="flex gap-2">
                          <Skeleton className="h-9 w-9" />
                          <Skeleton className="h-9 w-9" />
                          <Skeleton className="h-9 w-9" />
                        </div>
                      </CardFooter>
                    </Card>
                  ))
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                    <Card key={project.id} className="faculty-panel faculty-lift rounded-lg">
                      <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <CardTitle className="text-xl text-slate-950">{project.title}</CardTitle>
                            <CardDescription className="mt-2 leading-6">{project.description}</CardDescription>
                          </div>
                          <Badge variant="outline" className={getStatusClassName(project.status)}>
                            {formatStatus(project.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {normalizeTags(project.tags).map((tag, i) => (
                            <Badge key={i} variant="outline" className="border-blue-200 bg-blue-50/70 text-blue-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 md:grid-cols-4">
                          <div className="rounded-lg border border-slate-200/80 bg-white/70 p-3">
                            <p className="text-muted-foreground">Research Area</p>
                            <p className="font-semibold text-slate-950">{project.research_area}</p>
                          </div>
                          <div className="rounded-lg border border-slate-200/80 bg-white/70 p-3">
                            <p className="text-muted-foreground">Positions</p>
                            <p className="font-semibold text-slate-950">{project.positions}</p>
                          </div>
                          <div className="rounded-lg border border-slate-200/80 bg-white/70 p-3">
                            <p className="text-muted-foreground">Deadline</p>
                            <p className="font-semibold text-slate-950">{new Date(project.deadline).toLocaleDateString()}</p>
                          </div>
                          <div className="rounded-lg border border-slate-200/80 bg-white/70 p-3">
                            <p className="text-muted-foreground">Applications</p>
                            <p className="font-semibold text-slate-950">{project.application_count ?? 0}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-end">
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="outline" size="sm" className="border-blue-200 bg-white/80 text-blue-700 hover:bg-blue-50">
                            View Details
                          </Button>
                        </Link>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/faculty/projects/${project.id}/edit`}>
                            <Button variant="outline" size="icon" className="border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="border-red-200 bg-white/80 text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the project and all associated
                                  applications.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => handleDeleteProject(project.id)}
                                  disabled={deletingProjectId === project.id}
                                >
                                  {deletingProjectId === project.id ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardFooter>
                    </Card>
                ))
              ) : (
                <div className="faculty-panel flex flex-col items-center justify-center rounded-lg py-12 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-slate-950">No projects found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your filters or search term"
                      : "Create your first research project"}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Link href="/dashboard/faculty/projects/new" className="mt-4">
                      <Button className="gap-2 bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> Create New Project
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
