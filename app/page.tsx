import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import { GradientBackground } from "@/components/gradient-background"
import { AnimatedShapes } from "@/components/animated-shapes"
import { connectToMongoDB } from "@/lib/mongodb"
import { Project, User } from "@/lib/models"
import { toPlainObject } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function Home() {
  let faculty: any[] = []
  let featuredProject: any | null = null
  let researchAreas: any[] = []

  try {
    await connectToMongoDB()

    const [facultyData, featuredProjectData, researchAreaData] = await Promise.all([
      User.aggregate([
        { $match: { role: "faculty" } },
        {
          $lookup: {
            from: "facultyprofiles",
            localField: "_id",
            foreignField: "user_id",
            as: "profile",
          },
        },
        { $unwind: "$profile" },
        {
          $project: {
            first_name: 1,
            last_name: 1,
            email: 1,
            profile_picture_url: 1,
            department: "$profile.department",
            specialization: "$profile.specialization",
          },
        },
        { $sort: { department: 1, last_name: 1 } },
        { $limit: 3 },
      ]),
      Project.aggregate([
        { $match: { status: "active" } },
        {
          $lookup: {
            from: "facultyprofiles",
            localField: "faculty_id",
            foreignField: "_id",
            as: "facultyProfile",
          },
        },
        { $unwind: "$facultyProfile" },
        {
          $lookup: {
            from: "users",
            localField: "facultyProfile.user_id",
            foreignField: "_id",
            as: "facultyUser",
          },
        },
        { $unwind: "$facultyUser" },
        {
          $project: {
            id: { $toString: "$_id" },
            title: 1,
            description: 1,
            research_area: 1,
            tags: { $ifNull: ["$tags", []] },
            faculty_name: { $concat: ["$facultyUser.first_name", " ", "$facultyUser.last_name"] },
            department: "$facultyProfile.department",
          },
        },
        { $sort: { created_at: -1 } },
        { $limit: 1 },
      ]),
      Project.aggregate([
        { $match: { status: "active", research_area: { $nin: [null, ""] } } },
        {
          $group: {
            _id: "$research_area",
            count: { $sum: 1 },
            latestProjectId: { $first: "$_id" },
          },
        },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 6 },
        {
          $project: {
            _id: 0,
            title: "$_id",
            count: 1,
          },
        },
      ]),
    ])

    faculty = facultyData.map(toPlainObject)
    featuredProject = featuredProjectData[0] ? toPlainObject(featuredProjectData[0]) : null
    researchAreas = researchAreaData.map(toPlainObject)
  } catch (error) {
    console.log("No homepage data available yet:", error)
    faculty = []
    featuredProject = null
    researchAreas = []
  }

  const areaColorClasses = [
    "from-primary-500 to-primary-600",
    "from-secondary-500 to-secondary-600",
    "from-accent-500 to-accent-600",
    "from-primary-500 to-secondary-500",
    "from-secondary-500 to-accent-500",
    "from-accent-500 to-tertiary-500",
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Image src="/muj.png" alt="Manipal University Jaipur Logo" width={80} height={80} />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500 animate-gradient-x">
              Research Portal
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/projects" className="text-foreground/80 hover:text-foreground transition-colors">
              Projects
            </Link>
            <Link href="/faculty" className="text-foreground/80 hover:text-foreground transition-colors">
              Faculty
            </Link>
            <Link href="/about" className="text-foreground/80 hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="relative overflow-hidden group">
                <span className="relative z-10">Log in</span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <AnimatedBackground
          density={30}
          color="rgba(99, 102, 241, 0.4)"
          secondaryColor="rgba(236, 72, 153, 0.4)"
          className="w-full py-12 md:py-24 lg:py-32"
        >
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 px-3 py-1 text-sm text-white font-medium mb-2 animate-pulse-slow">
                  Welcome to Manipal University Jaipur
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 animate-gradient-x">
                  Connect, Collaborate, and Advance Research
                </h1>
                <p className="text-foreground/80 md:text-xl">
                  The Research Portal bridges the gap between faculty and students at Manipal University Jaipur, making
                  research opportunities more accessible and streamlining the recruitment process.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register?role=faculty">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white"
                    >
                      Join as Faculty
                    </Button>
                  </Link>
                  <Link href="/register?role=student">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto relative overflow-hidden group">
                      <span className="relative z-10">Join as Student</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-secondary-400 to-tertiary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute -top-4 -left-4 h-72 w-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
                  <div className="absolute -bottom-4 -right-4 h-72 w-72 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow" />
                  {featuredProject ? (
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg p-6 animate-float">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{featuredProject.title}</h3>
                            <p className="text-sm text-foreground/80">
                              {featuredProject.faculty_name} • {featuredProject.department}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm">{featuredProject.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          {(featuredProject.tags || []).slice(0, 3).map((tag: string) => (
                            <span key={tag} className="bg-primary-500/20 text-primary-500 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Button asChild variant="outline" size="sm" className="w-full relative overflow-hidden group">
                          <Link href={`/projects/${featuredProject.id}`}>
                            <span className="relative z-10">View Details</span>
                            <span className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg p-6 animate-float">
                      <div className="space-y-4 text-center">
                        <BookOpen className="mx-auto h-10 w-10 text-primary-500" />
                        <h3 className="font-semibold">No active projects yet</h3>
                        <p className="text-sm text-foreground/80">Active MongoDB projects will appear here automatically.</p>
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link href="/projects">Browse Projects</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </AnimatedBackground>

        <GradientBackground variant="rainbow" intensity="light" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform simplifies the research collaboration process for both faculty and students.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-4">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-primary-500">For Faculty</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create project listings, specify requirements, and find qualified students for your research
                    initiatives.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/faculty-guide" className="text-primary-500 inline-flex items-center group">
                    Learn more{" "}
                    <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CardFooter>
              </Card>
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-secondary-500">For Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Discover research opportunities, apply based on your interests, and showcase your academic
                    achievements.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/student-guide" className="text-secondary-500 inline-flex items-center group">
                    Learn more{" "}
                    <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CardFooter>
              </Card>
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-accent-500">Research Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Browse through diverse research projects across various departments and disciplines.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/projects" className="text-accent-500 inline-flex items-center group">
                    Explore projects{" "}
                    <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </GradientBackground>

        <AnimatedShapes className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500">
                  Featured Research Areas
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Explore the diverse research opportunities available across departments at Manipal University Jaipur.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              {researchAreas.length === 0 ? (
                <Card className="col-span-full border-none shadow-md bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>No research areas yet</CardTitle>
                    <CardDescription>Research area cards will appear when active projects are created in MongoDB.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link href="/projects">
                      <Button variant="outline" size="sm">Browse Projects</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ) : researchAreas.map((area, index) => {
                const color = areaColorClasses[index % areaColorClasses.length]

                return (
                <Card
                  key={area.title}
                  className="border-none shadow-md overflow-hidden bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`h-2 bg-gradient-to-r ${color}`}></div>
                  <CardHeader>
                    <CardTitle className={`bg-clip-text text-transparent bg-gradient-to-r ${color}`}>
                      {area.title}
                    </CardTitle>
                    <CardDescription>{area.count} active projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Active projects listed under this research area.</p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/projects?area=${encodeURIComponent(area.title)}`}>
                      <Button variant="outline" size="sm" className="relative overflow-hidden group">
                        <span className="relative z-10">View Projects</span>
                        <span
                          className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        ></span>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                )
              })}
            </div>
          </div>
        </AnimatedShapes>

        {/* Featured Faculty Section */}
        <section className="container mx-auto py-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Featured Faculty</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {faculty.map((f: any, i: number) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <Avatar className="mb-4 h-20 w-20 border-2 border-primary-200">
                  <AvatarImage src={f.profile_picture_url || ""} alt={`${f.first_name} ${f.last_name}`} />
                  <AvatarFallback>
                    {`${f.first_name?.charAt(0) || ""}${f.last_name?.charAt(0) || ""}`}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold mb-1">{f.first_name} {f.last_name}</h3>
                <div className="text-sm text-gray-600 mb-1">{f.specialization}</div>
                <div className="text-sm text-gray-500 mb-1">{f.department}</div>
                <a href={`mailto:${f.email}`} className="text-blue-600 hover:underline text-sm">{f.email}</a>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Link href="/faculty">
              <Button className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">View all faculty</Button>
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/muj.png" alt="Manipal University Jaipur Logo" width={60} height={60} />
            <p className="text-center text-sm leading-loose md:text-left">
              © {new Date().getFullYear()} Manipal University Jaipur Research Portal. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-white/80 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-white/80 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-white/80 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
