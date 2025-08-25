import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import { GradientBackground } from "@/components/gradient-background"
import { AnimatedShapes } from "@/components/animated-shapes"
import { sql } from "@/lib/db"

export const revalidate = 300

export default async function Home() {
  // Fetch first 3 faculty for homepage preview
  const faculty = await sql`
    SELECT u.first_name, u.last_name, u.email, fp.department, fp.specialization
    FROM users u
    JOIN faculty_profiles fp ON u.id = fp.user_id
    WHERE u.role = 'faculty'
    ORDER BY fp.department, u.last_name
    LIMIT 3
  `
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
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg p-6 animate-float">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Machine Learning Research</h3>
                          <p className="text-sm text-foreground/80">Dr. Sarah Johnson • Computer Science</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        Looking for students interested in applying machine learning techniques to solve real-world
                        problems in healthcare.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="bg-primary-500/20 text-primary-500 px-2 py-1 rounded-full">ML</span>
                        <span className="bg-secondary-500/20 text-secondary-500 px-2 py-1 rounded-full">
                          Healthcare
                        </span>
                        <span className="bg-accent-500/20 text-accent-500 px-2 py-1 rounded-full">Python</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full relative overflow-hidden group">
                        <span className="relative z-10">View Details</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      </Button>
                    </div>
                  </div>
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
              {[
                {
                  title: "Artificial Intelligence",
                  description: "Machine learning, neural networks, and natural language processing research.",
                  count: 12,
                  color: "from-primary-500 to-primary-600",
                },
                {
                  title: "Biotechnology",
                  description: "Genetic engineering, bioinformatics, and pharmaceutical research.",
                  count: 8,
                  color: "from-secondary-500 to-secondary-600",
                },
                {
                  title: "Renewable Energy",
                  description: "Solar power, wind energy, and sustainable technology research.",
                  count: 10,
                  color: "from-accent-500 to-accent-600",
                },
                {
                  title: "Material Science",
                  description: "Nanomaterials, polymers, and advanced materials research.",
                  count: 7,
                  color: "from-primary-500 to-secondary-500",
                },
                {
                  title: "Robotics",
                  description: "Autonomous systems, human-robot interaction, and robotic applications.",
                  count: 9,
                  color: "from-secondary-500 to-accent-500",
                },
                {
                  title: "Data Science",
                  description: "Big data analytics, statistical modeling, and data visualization.",
                  count: 14,
                  color: "from-accent-500 to-tertiary-500",
                },
              ].map((area, index) => (
                <Card
                  key={index}
                  className="border-none shadow-md overflow-hidden bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`h-2 bg-gradient-to-r ${area.color}`}></div>
                  <CardHeader>
                    <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r ${area.color}">
                      {area.title}
                    </CardTitle>
                    <CardDescription>{area.count} active projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{area.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/projects?area=${area.title.toLowerCase().replace(" ", "-")}`}>
                      <Button variant="outline" size="sm" className="relative overflow-hidden group">
                        <span className="relative z-10">View Projects</span>
                        <span
                          className={`absolute inset-0 bg-gradient-to-r ${area.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        ></span>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </AnimatedShapes>

        {/* Featured Faculty Section */}
        <section className="container mx-auto py-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Featured Faculty</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {faculty.map((f: any, i: number) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <Image src="/placeholder-user.jpg" alt="Faculty photo" width={80} height={80} className="rounded-full mb-4" />
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
