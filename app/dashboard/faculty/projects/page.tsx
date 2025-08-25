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
import { Plus, Search, AlertCircle, Trash2, Edit, Eye } from "lucide-react"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"
import { getFacultyProjects, deleteProject } from "@/app/actions/projects"
import { AnimatedBackground } from "@/components/animated-background"
import { GradientBackground } from "@/components/gradient-background"

export default function FacultyProjectsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null)

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

  const handleDeleteProject = async (id: number) => {
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

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.research_area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen flex-col">
      <FacultyDashboardHeader />
      <main className="flex-1">
        <AnimatedBackground
          density={30}
          color="rgba(99, 102, 241, 0.4)"
          secondaryColor="rgba(236, 72, 153, 0.4)"
          className="w-full py-12 md:py-24 lg:py-32"
        >
          <div className="container px-4 md:px-6">
            <div className="grid gap-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-primary">Research Projects</h1>
                  <p className="text-muted-foreground">Manage your research projects and opportunities</p>
                </div>
                <Link href="/dashboard/faculty/projects/new">
                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4" /> Create New Project
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
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

              <div className="grid gap-4">
                {loading ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i}>
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
                    <Card key={project.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl text-primary">{project.title}</CardTitle>
                            <CardDescription className="mt-1">{project.description}</CardDescription>
                          </div>
                          <Badge
                            variant={
                              project.status === "active"
                                ? "default"
                                : project.status === "draft"
                                  ? "secondary"
                                  : project.status === "closed"
                                    ? "outline"
                                    : "default"
                            }
                            className={
                              project.status === "active"
                                ? "bg-primary"
                                : project.status === "completed"
                                  ? "bg-green-500"
                                  : ""
                            }
                          >
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags.map((tag: string, i: number) => (
                            <Badge key={i} variant="outline" className="border-primary text-primary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Research Area</p>
                            <p className="font-medium">{project.research_area}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Positions</p>
                            <p className="font-medium">{project.positions}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Deadline</p>
                            <p className="font-medium">{new Date(project.deadline).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Applications</p>
                            <p className="font-medium">
                              {/* This would be fetched from the database in a real implementation */}
                              {Math.floor(Math.random() * 10)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="outline" size="sm" className="text-primary border-primary">
                            View Details
                          </Button>
                        </Link>
                        <div className="flex gap-2">
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="outline" size="icon" className="text-primary border-primary">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </Link>
                          <Link href={`/dashboard/faculty/projects/${project.id}/edit`}>
                            <Button variant="outline" size="icon" className="text-blue-500 border-blue-500">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="text-red-500 border-red-500">
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
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No projects found</h3>
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
        </AnimatedBackground>
        <GradientBackground variant="rainbow" intensity="light" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            {/* Optionally add a summary or call to action here */}
          </div>
        </GradientBackground>
      </main>
    </div>
  )
}
