import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen, Calendar, Mail, Users } from "lucide-react"
import { connectToMongoDB } from "@/lib/mongodb"
import { FacultyProfile, Project, User } from "@/lib/models"
import { toObjectId, toPlainObject } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const dynamic = "force-dynamic"

export default async function FacultyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const objectId = toObjectId(id)

  if (!objectId) {
    notFound()
  }

  await connectToMongoDB()

  let profile: any = await FacultyProfile.findById(objectId).lean()
  let user: any = profile ? await User.findById(profile.user_id).lean() : null

  if (!profile) {
    user = await User.findById(objectId).lean()
    if (user?.role === "faculty") {
      profile = await FacultyProfile.findOne({ user_id: user._id }).lean()
    }
  }

  if (!profile || !user) {
    notFound()
  }

  const projects = await Project.find({ faculty_id: profile._id })
    .sort({ created_at: -1 })
    .select("_id title description research_area status deadline positions tags")
    .lean()

  const faculty = toPlainObject({ ...profile, user })
  const activeProjects = projects.filter((project: any) => project.status === "active")

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-5 w-5" />
            <span>Research Portal</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
              Projects
            </Link>
            <Link href="/faculty" className="font-medium">
              Faculty
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10">
        <div className="container mx-auto max-w-5xl">
          <Link href="/faculty" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Faculty
          </Link>

          <div className="grid gap-6 md:grid-cols-[320px_1fr]">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-28 w-28 border-2 border-primary-200">
                    <AvatarImage
                      src={faculty.user.profile_picture_url || ""}
                      alt={`${faculty.user.first_name} ${faculty.user.last_name}`}
                    />
                    <AvatarFallback className="text-2xl">
                      {`${faculty.user.first_name?.charAt(0) || ""}${faculty.user.last_name?.charAt(0) || ""}`}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="mt-4 text-2xl font-bold">
                    {faculty.user.first_name} {faculty.user.last_name}
                  </h1>
                  <p className="text-muted-foreground">{faculty.department}</p>
                  <p className="mt-1 text-sm">{faculty.specialization}</p>
                  <Button asChild className="mt-5 w-full">
                    <a href={`mailto:${faculty.user.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Contact
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Faculty ID</p>
                    <p className="font-medium">{faculty.faculty_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Open Projects</p>
                    <p className="font-medium">{activeProjects.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                    <p className="font-medium">{projects.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Research Projects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.length === 0 ? (
                    <p className="text-muted-foreground">No projects are listed for this faculty member yet.</p>
                  ) : (
                    projects.map((project: any) => (
                      <div key={String(project._id)} className="rounded-lg border p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <Link href={`/projects/${String(project._id)}`} className="font-semibold hover:underline">
                              {project.title}
                            </Link>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                          </div>
                          <Badge variant={project.status === "active" ? "default" : "outline"}>
                            {project.status}
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {project.research_area && <span>{project.research_area}</span>}
                          {project.positions && (
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {project.positions} positions
                            </span>
                          )}
                          {project.deadline && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(project.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
