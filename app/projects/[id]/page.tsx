import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Calendar, Clock, Users, ArrowLeft, Share2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { getProjectById } from "@/app/actions/projects"

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const projectId = Number.parseInt(params.id)

  if (isNaN(projectId)) {
    notFound()
  }

  const project = await getProjectById(projectId)

  if (!project) {
    notFound()
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
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Link
              href="/projects"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{project.positions} positions</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.deadline).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Link href={`/projects/${project.id}/apply`}>
                  <Button>Apply Now</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{project.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detailed Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.long_description ? (
                      project.long_description.split("\n\n").map((paragraph, i) => <p key={i}>{paragraph}</p>)
                    ) : (
                      <p>{project.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {project.prerequisites && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.min_cgpa && (
                      <div>
                        <h3 className="font-medium mb-1">Minimum CGPA</h3>
                        <p>{project.min_cgpa}</p>
                      </div>
                    )}
                    {project.eligibility && (
                      <div>
                        <h3 className="font-medium mb-1">Eligibility</h3>
                        <p>{project.eligibility}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium mb-1">Prerequisites</h3>
                      <p>{project.prerequisites}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Application Deadline</p>
                      <p className="text-sm text-muted-foreground">{new Date(project.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Start Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(project.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Research Area</p>
                      <p className="text-sm text-muted-foreground">{project.research_area}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Positions Available</p>
                      <p className="text-sm text-muted-foreground">{project.positions}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/projects/${project.id}/apply`} className="w-full">
                    <Button className="w-full">Apply Now</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Faculty Mentor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage
                        src={project.faculty_avatar || "/placeholder.svg?height=128&width=128"}
                        alt={project.faculty_name}
                      />
                      <AvatarFallback>
                        {project.faculty_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg">{project.faculty_name}</h3>
                    <p className="text-muted-foreground">{project.faculty_department}</p>
                    <p className="text-sm mt-1">{project.faculty_specialization}</p>
                  </div>
                  <Separator />
                  <p className="text-sm">
                    {project.faculty_bio ||
                      `Faculty member in the ${project.faculty_department} department specializing in ${project.faculty_specialization}.`}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/faculty/${project.faculty_id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
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
