import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Users, Building, GraduationCap, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-primary/95 text-white backdrop-blur supports-[backdrop-filter]:bg-primary/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Image src="/muj.png" alt="Manipal University Jaipur Logo" width={40} height={40} />
            <span>Research Portal</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/projects" className="text-white/80 hover:text-white transition-colors">
              Projects
            </Link>
            <Link href="/faculty" className="text-white/80 hover:text-white transition-colors">
              Faculty
            </Link>
            <Link href="/about" className="text-white/80 hover:text-white transition-colors font-bold">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-secondary text-white hover:bg-secondary/90">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  About the Research Portal
                </h1>
                <p className="mx-auto max-w-[700px] text-white/80 md:text-xl">
                  Connecting talented students with innovative faculty to advance research at Manipal University Jaipur
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 md:gap-16">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-primary">Our Mission</h2>
                <p className="text-muted-foreground md:text-lg">
                  The Manipal University Jaipur Research Portal was created with a clear mission: to streamline the
                  process of connecting faculty members with talented students for meaningful research collaborations.
                  We believe that research is a cornerstone of academic excellence and innovation, and our platform aims
                  to make these opportunities more accessible to all.
                </p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                  {[
                    {
                      title: "Foster Collaboration",
                      description:
                        "Create an ecosystem where faculty and students can easily connect and collaborate on innovative research projects.",
                      icon: Users,
                    },
                    {
                      title: "Enhance Research Output",
                      description:
                        "Increase the quantity and quality of research output from Manipal University Jaipur.",
                      icon: Award,
                    },
                    {
                      title: "Develop Future Researchers",
                      description:
                        "Provide students with valuable research experience that prepares them for future academic and professional endeavors.",
                      icon: GraduationCap,
                    },
                  ].map((item, i) => (
                    <Card key={i} className="border-none shadow-md">
                      <CardHeader className="pb-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <item.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-primary">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-primary">About Manipal University Jaipur</h2>
                <div className="grid gap-8 md:grid-cols-2 items-center">
                  <div>
                    <p className="text-muted-foreground md:text-lg mb-4">
                      Manipal University Jaipur (MUJ) was established in 2011 as a self-financed institution of higher
                      education. MUJ has redefined academic excellence in the region, with the Manipal legacy of
                      providing high-quality education to its students.
                    </p>
                    <p className="text-muted-foreground md:text-lg">
                      The campus is a reflection of the Manipal philosophy of providing world-class educational
                      facilities to its students. The multi-disciplinary university offers career-oriented courses at
                      all levels, i.e., UG, PG and doctoral, across diverse streams including Engineering, Architecture,
                      Planning, Fashion Design, Fine Arts, Hospitality, Humanities, Journalism and Mass Communication,
                      Basic Sciences, Law, Commerce, Computer Applications, Management, etc.
                    </p>
                  </div>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                    <Building className="h-16 w-16 text-primary/50" />
                    <span className="sr-only">Manipal University Jaipur Campus</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-primary">Key Features</h2>
                <div className="grid gap-6">
                  {[
                    {
                      title: "Comprehensive Project Listings",
                      description:
                        "Faculty can create detailed project listings with specific requirements, research areas, and expected outcomes.",
                    },
                    {
                      title: "Student Profile Showcase",
                      description:
                        "Students can showcase their academic achievements, skills, and upload their CV and certificates.",
                    },
                    {
                      title: "Streamlined Application Process",
                      description:
                        "Simple application process with status tracking and direct communication between faculty and students.",
                    },
                    {
                      title: "Research Area Discovery",
                      description:
                        "Browse projects by department, research area, or faculty member to find the perfect match.",
                    },
                    {
                      title: "Secure Document Management",
                      description: "Secure storage and sharing of academic documents, CVs, and certificates.",
                    },
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-primary">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-primary">Get Involved</h2>
                <p className="text-muted-foreground md:text-lg">
                  Whether you're a faculty member looking for talented students or a student eager to gain research
                  experience, the Research Portal is your gateway to exciting opportunities.
                </p>
                <div className="grid gap-6 md:grid-cols-2 mt-8">
                  <Card className="border-none shadow-md">
                    <CardHeader>
                      <CardTitle className="text-primary">For Faculty</CardTitle>
                      <CardDescription>Create research opportunities and find qualified students</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {[
                          "Post detailed research project listings",
                          "Review student applications and credentials",
                          "Communicate directly with potential research assistants",
                          "Track ongoing projects and collaborations",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href="/register?role=faculty" className="w-full">
                        <Button className="w-full bg-primary hover:bg-primary/90">Join as Faculty</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  <Card className="border-none shadow-md">
                    <CardHeader>
                      <CardTitle className="text-primary">For Students</CardTitle>
                      <CardDescription>Discover research opportunities and showcase your talents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {[
                          "Create a comprehensive academic profile",
                          "Upload your CV and achievement certificates",
                          "Browse and apply to research projects",
                          "Gain valuable research experience and skills",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href="/register?role=student" className="w-full">
                        <Button className="w-full bg-primary hover:bg-primary/90">Join as Student</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-primary">Contact Us</h2>
                <p className="text-muted-foreground md:text-lg">
                  Have questions about the Research Portal? We're here to help. Reach out to our support team for
                  assistance.
                </p>
                <div className="grid gap-4 md:grid-cols-3 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-primary">Email</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>research.portal@jaipur.manipal.edu</p>
                      <p>tanishkmittal38@gmail.com</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-primary">Phone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>+91 9728014818</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-primary">Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>
                        Department IoT & Intelligent Systems, Third Floor, Academic Block 1
                        <br />
                        Manipal University Jaipur
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0 bg-primary text-white">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/muj.png" alt="Manipal University Jaipur Logo" width={30} height={30} />
            <p className="text-center text-sm leading-loose md:text-left">
              © {new Date().getFullYear()} Manipal University Jaipur Research Portal. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-white/80 hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-white/80 hover:text-white">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-white/80 hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
