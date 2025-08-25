import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CheckCircle, FileText, Users, ArrowLeft, Award, Search } from "lucide-react"

export default function StudentGuidePage() {
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
            <Link href="/about" className="text-white/80 hover:text-white transition-colors">
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
      <main className="flex-1 p-6 md:p-10">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Student Guide</h1>
            <p className="text-muted-foreground">
              Learn how to find research opportunities and make successful applications
            </p>
          </div>

          <Tabs defaultValue="getting-started" className="space-y-8">
            <TabsList className="bg-white border">
              <TabsTrigger
                value="getting-started"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Getting Started
              </TabsTrigger>
              <TabsTrigger
                value="finding-projects"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Finding Projects
              </TabsTrigger>
              <TabsTrigger value="applying" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Applying Successfully
              </TabsTrigger>
              <TabsTrigger value="faq" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                FAQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="getting-started">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started as a Student</CardTitle>
                  <CardDescription>Learn the basics of using the Research Portal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-primary">
                      Welcome to the Manipal University Jaipur Research Portal
                    </h3>
                    <p>
                      The Research Portal connects students with faculty members for exciting research opportunities.
                      This guide will help you navigate the platform and find projects that match your interests and
                      skills.
                    </p>

                    <h3 className="text-lg font-medium text-primary mt-6">Key Benefits for Students</h3>
                    <ul className="space-y-2">
                      {[
                        "Discover research opportunities across various departments",
                        "Showcase your academic achievements and skills to faculty",
                        "Upload your CV and certificates to strengthen your applications",
                        "Track application status and receive feedback",
                        "Gain valuable research experience to enhance your academic profile",
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <h3 className="text-lg font-medium text-primary mt-6">Getting Started in 4 Simple Steps</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        {
                          title: "Create Your Profile",
                          description:
                            "Register as a student and complete your academic profile with your achievements.",
                          icon: Users,
                        },
                        {
                          title: "Upload Documents",
                          description: "Add your CV and certificates to showcase your qualifications and skills.",
                          icon: FileText,
                        },
                        {
                          title: "Explore Projects",
                          description: "Browse research opportunities that match your interests and qualifications.",
                          icon: Search,
                        },
                        {
                          title: "Apply and Track",
                          description: "Submit applications to projects and track their status in your dashboard.",
                          icon: CheckCircle,
                        },
                      ].map((step, i) => (
                        <Card key={i} className="border-l-4 border-l-secondary">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <step.icon className="h-5 w-5 text-secondary" />
                              <CardTitle className="text-base">{step.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{step.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Watch Tutorial</Button>
                  <Link href="/register?role=student">
                    <Button className="bg-primary hover:bg-primary/90">Register as Student</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="finding-projects">
              <Card>
                <CardHeader>
                  <CardTitle>Finding Research Projects</CardTitle>
                  <CardDescription>Learn how to discover projects that match your interests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <p>
                      The Research Portal offers various ways to find research projects that align with your academic
                      interests, skills, and career goals.
                    </p>

                    <h3 className="text-lg font-medium text-primary mt-6">Search and Filter Options</h3>
                    <div className="grid gap-4">
                      {[
                        {
                          title: "Department Filter",
                          description:
                            "Find projects within your department or explore interdisciplinary opportunities.",
                        },
                        {
                          title: "Research Area",
                          description:
                            "Filter projects by specific research areas like AI, biotechnology, or renewable energy.",
                        },
                        {
                          title: "Keyword Search",
                          description: "Search for specific terms related to your interests or skills.",
                        },
                        {
                          title: "Faculty Filter",
                          description: "Find projects by specific faculty members you're interested in working with.",
                        },
                        {
                          title: "Duration Filter",
                          description: "Filter projects based on their expected duration to match your availability.",
                        },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-lg font-medium text-primary mt-6">Understanding Project Listings</h3>
                    <p>Each project listing contains important information to help you determine if it's a good fit:</p>
                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                      {[
                        {
                          title: "Project Description",
                          description: "Overview of the research goals, methodology, and expected outcomes.",
                        },
                        {
                          title: "Faculty Information",
                          description: "Details about the faculty mentor, their expertise, and department.",
                        },
                        {
                          title: "Requirements",
                          description: "Academic qualifications, technical skills, and prerequisites needed.",
                        },
                        {
                          title: "Time Commitment",
                          description: "Expected duration and weekly time commitment for the project.",
                        },
                        {
                          title: "Application Deadline",
                          description: "Last date to submit your application for consideration.",
                        },
                        {
                          title: "Learning Outcomes",
                          description: "Skills and knowledge you'll gain from participating in the project.",
                        },
                      ].map((item, i) => (
                        <div key={i} className="border p-3 rounded-md">
                          <h4 className="font-medium text-primary">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-lg font-medium text-primary mt-6">Tips for Finding the Right Projects</h3>
                    <ul className="space-y-2">
                      {[
                        "Start by exploring projects in your field of study",
                        "Consider interdisciplinary projects that combine your interests",
                        "Look for projects that help you develop skills relevant to your career goals",
                        "Check the requirements carefully to ensure you're qualified",
                        "Read about the faculty member's research interests and previous work",
                      ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/projects" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90">Explore Projects</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="applying">
              <Card>
                <CardHeader>
                  <CardTitle>Applying Successfully</CardTitle>
                  <CardDescription>Tips for creating strong applications that stand out</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <p>
                      Creating a strong application increases your chances of being selected for research projects.
                      Here's how to make your applications stand out.
                    </p>

                    <h3 className="text-lg font-medium text-primary mt-6">Complete Your Profile</h3>
                    <p>
                      Before applying to any projects, make sure your profile is complete and showcases your strengths:
                    </p>
                    <div className="grid gap-4 mt-4">
                      {[
                        {
                          title: "Academic Information",
                          description: "Ensure your CGPA, department, and year of study are up-to-date.",
                        },
                        {
                          title: "Professional CV",
                          description:
                            "Upload a well-formatted CV that highlights your academic achievements and relevant experience.",
                        },
                        {
                          title: "Achievement Certificates",
                          description:
                            "Add certificates for academic awards, technical skills, and extracurricular achievements.",
                        },
                        {
                          title: "Skills Section",
                          description: "List technical and soft skills relevant to research work.",
                        },
                        {
                          title: "Bio/Statement",
                          description: "Write a concise statement about your research interests and career goals.",
                        },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-lg font-medium text-primary mt-6">Crafting a Strong Application</h3>
                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                      {[
                        {
                          title: "Tailor Your Application",
                          description:
                            "Customize your application for each project, highlighting relevant skills and experience.",
                          icon: FileText,
                        },
                        {
                          title: "Show Genuine Interest",
                          description:
                            "Explain why you're interested in the specific research area and what you hope to learn.",
                          icon: BookOpen,
                        },
                        {
                          title: "Highlight Relevant Coursework",
                          description: "Mention courses you've taken that are relevant to the research project.",
                          icon: Award,
                        },
                        {
                          title: "Demonstrate Initiative",
                          description: "Show that you've done some background reading on the research topic.",
                          icon: Search,
                        },
                      ].map((tip, i) => (
                        <Card key={i} className="border-l-4 border-l-accent">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <tip.icon className="h-5 w-5 text-accent" />
                              <CardTitle className="text-base">{tip.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{tip.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <h3 className="text-lg font-medium text-primary mt-6">After Applying</h3>
                    <ul className="space-y-2">
                      {[
                        "Check your dashboard regularly for application status updates",
                        "Respond promptly to any messages from faculty members",
                        "Be prepared for potential interviews or follow-up questions",
                        "If rejected, review any feedback provided to improve future applications",
                        "Don't be discouraged by rejections - keep applying to suitable projects",
                      ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/student/profile" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90">Complete Your Profile</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Common questions about using the Research Portal as a student</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    {[
                      {
                        question: "How many projects can I apply to at once?",
                        answer:
                          "There is no limit to the number of projects you can apply to. However, we recommend being selective and applying only to projects you're genuinely interested in and qualified for.",
                      },
                      {
                        question: "What file formats are accepted for CV uploads?",
                        answer:
                          "You can upload your CV in PDF, DOCX, or ODT formats. PDF is recommended as it ensures consistent formatting across different devices.",
                      },
                      {
                        question: "Can I update my application after submitting it?",
                        answer:
                          "No, you cannot edit an application after submission. However, you can message the faculty member with additional information if needed.",
                      },
                      {
                        question: "How will I know if I'm selected for a project?",
                        answer:
                          "You'll receive a notification when a faculty member approves your application. You can also check the status in your dashboard under 'My Applications'.",
                      },
                      {
                        question: "What should I do if my application is rejected?",
                        answer:
                          "Review any feedback provided, update your profile if necessary, and continue applying to other suitable projects. Each application is a learning experience.",
                      },
                      {
                        question: "Can I withdraw my application?",
                        answer:
                          "Yes, you can withdraw an application before it's approved or rejected. Go to 'My Applications' in your dashboard and select the withdraw option.",
                      },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <h3 className="font-medium text-primary">{item.question}</h3>
                        <p className="text-muted-foreground">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Contact Support</Button>
                  <Link href="/register?role=student">
                    <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
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
