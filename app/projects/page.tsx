"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getProjects, type ProjectWithFaculty } from "@/app/actions/projects"
import { useSearchParams, useRouter } from "next/navigation"

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectWithFaculty[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    department: searchParams.get("department") || "",
    researchArea: searchParams.get("area") || "",
    searchTerm: searchParams.get("search") || "",
  })

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        const projectFilters: any = {}

        if (filters.department) {
          projectFilters.department = filters.department
        }

        if (filters.researchArea) {
          projectFilters.researchArea = filters.researchArea
        }

        if (filters.searchTerm) {
          projectFilters.searchTerm = filters.searchTerm
        }

        const data = await getProjects(projectFilters)
        setProjects(data)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [filters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Update URL with search params
    const params = new URLSearchParams()
    if (filters.department) params.set("department", filters.department)
    if (filters.researchArea) params.set("area", filters.researchArea)
    if (filters.searchTerm) params.set("search", filters.searchTerm)

    router.push(`/projects?${params.toString()}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-5 w-5" />
            <span>Research Portal</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/projects" className="font-medium">
              Projects
            </Link>
            <Link href="/faculty" className="text-muted-foreground hover:text-foreground transition-colors">
              Faculty
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-10">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Research Projects</h1>
            <p className="text-muted-foreground">
              Explore research opportunities across various departments and disciplines
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by title, faculty, or keywords..."
                className="pl-8"
                value={filters.searchTerm}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Select
                value={filters.department}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="ee">Electrical Engineering</SelectItem>
                  <SelectItem value="me">Mechanical Engineering</SelectItem>
                  <SelectItem value="bt">Biotechnology</SelectItem>
                  <SelectItem value="ph">Physics</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.researchArea}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, researchArea: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Research Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="ai">Artificial Intelligence</SelectItem>
                  <SelectItem value="re">Renewable Energy</SelectItem>
                  <SelectItem value="bio">Biotechnology</SelectItem>
                  <SelectItem value="qc">Quantum Computing</SelectItem>
                  <SelectItem value="bc">Blockchain</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" type="submit" className="w-full">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </div>
          </form>

          <div className="grid gap-6">
            {loading ? (
              // Show loading skeletons
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="border shadow-sm">
                    <CardHeader className="animate-pulse">
                      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    </CardHeader>
                    <CardContent className="animate-pulse">
                      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                    <CardFooter className="animate-pulse flex justify-between">
                      <div className="h-10 w-28 bg-gray-200 rounded"></div>
                      <div className="h-10 w-28 bg-gray-200 rounded"></div>
                    </CardFooter>
                  </Card>
                ))
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No projects found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search filters</p>
              </div>
            ) : (
              projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt={project.faculty_name} />
                            <AvatarFallback>
                              {project.faculty_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <CardDescription>
                            {project.faculty_name} • {project.faculty_department}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="outline" className="mb-2">
                          {project.positions} positions
                        </Badge>
                        <CardDescription>Deadline: {new Date(project.deadline).toLocaleDateString()}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {(typeof project.tags === 'string' ? project.tags.split(',') : project.tags || []).map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                    <Link href={`/login?redirect=/projects/${project.id}/apply`}>
                      <Button>Apply Now</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Research Portal. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
