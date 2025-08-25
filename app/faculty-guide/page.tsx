import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CheckCircle, FileText, Users, ArrowLeft } from "lucide-react"

export default function FacultyGuidePage() {
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
            <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Faculty Guide</h1>
            <p className="text-muted-foreground">
              Learn how to effectively use the Research Portal to post projects and find qualified students
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
                value="posting-projects"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Posting Projects
              </TabsTrigger>
              <TabsTrigger
                value="managing-applications"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Managing Applications
              </TabsTrigger>
              <TabsTrigger value="faq" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                FAQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="getting-started">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started as Faculty</CardTitle>
                  <CardDescription>Learn the basics of using the Research Portal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-primary">
                      Welcome to the Manipal University Jaipur Research Portal
                    </h3>
                    <p>
                      The Research Portal is designed to streamline the process of connecting faculty members with
                      qualified and enthusiastic students for research projects. This guide will help you navigate the
                      platform and make the most of its features.
                    </p>

                    <h3 className="text-lg font-medium text-primary mt-6">Key Benefits for Faculty</h3>
                    <ul className="space-y-2">
                      {[
                        "Easily create and manage research project listings",
                        "Specify detailed requirements to attract qualified students",
                        "Review student applications with their academic credentials",
                        "Track ongoing projects and student progress",
                        "Build a research profile to showcase your work",
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
                          title: "Create Your Account",
                          description:
                            "Register as a faculty member with your institutional credentials and complete your profile.",
                          icon: Users,
                        },
                        {
                          title: "Post a Research Project",
                          description:
                            "Create a detailed project listing with requirements, duration, and expected outcomes.",
                          icon: FileText,
                        },
                        {
                          title: "Review Applications",
                          description: "Evaluate student applications based on their qualifications and interests.",
                          icon: CheckCircle,
                        },
                        {
                          title: "Manage Your Projects",
                          description: "Track ongoing projects, communicate with students, and document progress.",
                          icon: BookOpen,
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
                  <Link href="/register?role=faculty">
                    <Button className="bg-primary hover:bg-primary/90">Register as Faculty</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="posting-projects">
              <Card>
                <CardHeader>
                  <CardTitle>Posting Research Projects</CardTitle>
                  <CardDescription>Learn how to create effective project listings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <p>
                      Creating clear and detailed project listings helps attract the right students for your research
                      initiatives. Follow these guidelines to create effective project postings.
                    </p>

                    <h3 className="text-lg font-medium text-primary mt-6">Elements of a Great Project Listing</h3>
                    <div className="grid gap-4">
                      {[
                        {
                          title: "Descriptive Title",
                          description:
                            "Use a clear, specific title that accurately reflects the research area and focus.",
                        },
                        {
                          title: "Comprehensive Description",
                          description: "Provide a detailed overview of the project, its goals, and potential impact.",
                        },
                        {
                          title: "Clear Requirements",
                          description: "Specify academic requirements, technical skills, and any prerequisites needed.",
                        },
                        {
                          title: "Time Commitment",
                          description: "Indicate the expected duration and weekly time commitment for the project.",
                        },
                        {
                          title: "Learning Outcomes",
                          description: "Highlight what students will learn and how it benefits their academic growth.",
                        },
                        {
                          title: "Relevant Tags",
                          description:
                            "Add keywords and tags to make your project discoverable to interested students.",
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

                    <h3 className="text-lg font-medium text-primary mt-6">Project Posting Process</h3>
                    <ol className="space-y-4 list-decimal list-inside">
                      <li className="pl-2">
                        <span className="font-medium">Navigate to your dashboard</span>
                        <p className="text-sm text-muted-foreground mt-1 ml-6">
                          Log in to your account and access the faculty dashboard.
                        </p>
                      </li>
                      <li className="pl-2">
                        <span className="font-medium">Click "Create New Project"</span>
                        <p className="text-sm text-muted-foreground mt-1 ml-6">
                          Find this button at the top of your dashboard.
                        </p>
                      </li>
                      <li className="pl-2">
                        <span className="font-medium">Fill in project details</span>
                        <p className="text-sm text-muted-foreground mt-1 ml-6">
                          Complete all required fields with comprehensive information.
                        </p>
                      </li>
                      <li className="pl-2">
                        <span className="font-medium">Set requirements and deadlines</span>
                        <p className="text-sm text-muted-foreground mt-1 ml-6">
                          Specify academic criteria, skills needed, and application deadlines.
                        </p>
                      </li>
                      <li className="pl-2">
                        <span className="font-medium">Review and publish</span>
                        <p className="text-sm text-muted-foreground mt-1 ml-6">
                          Double-check all information and publish your project listing.
                        </p>
                      </li>
                    </ol>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/login?redirect=/dashboard/faculty/projects/new" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90">Create a New Project</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="managing-applications">
              <Card>
                <CardHeader>
                  <CardTitle>Managing Student Applications</CardTitle>
                  <CardDescription>Learn how to review and respond to student applications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <p>
                      The Research Portal streamlines the process of reviewing student applications, allowing you to
                      efficiently identify the best candidates for your research projects.
                    </p>

                    <h3 className="text-lg font-medium text-primary mt-6">Application Review Process</h3>
                    <div className="grid gap-4">
                      {[
                        {
                          title: "Notification System",
                          description: "Receive instant notifications when students apply to your projects.",
                        },
                        {
                          title: "Comprehensive Student Profiles",
                          description:
                            "View detailed student profiles including academic records, skills, and previous research experience.",
                        },
                        {
                          title: "CV and Certificate Review",
                          description:
                            "Access student-uploaded CVs and achievement certificates directly from their applications.",
                        },
                        {
                          title: "Application Sorting",
                          description:
                            "Sort and filter applications based on various criteria like CGPA, skills, or department.",
                        },
                        {
                          title: "Communication Tools",
                          description:
                            "Message applicants directly through the platform to ask questions or schedule interviews.",
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

                    <h3 className="text-lg font-medium text-primary mt-6">Making Decisions</h3>
                    <p>For each application, you can take one of the following actions:</p>
                    <div className="grid gap-4 md:grid-cols-3 mt-4">
                      {[
                        {
                          title: "Approve",
                          description: "Accept the student for your research project.",
                          color: "bg-green-100 text-green-800 border-green-200",
                        },
                        {
                          title: "Reject",
                          description: "Decline the application with optional feedback.",
                          color: "bg-red-100 text-red-800 border-red-200",
                        },
                        {
                          title: "Request More Info",
                          description: "Ask for additional information before deciding.",
                          color: "bg-amber-100 text-amber-800 border-amber-200",
                        },
                      ].map((action, i) => (
                        <div key={i} className={`p-4 rounded-lg border ${action.color}`}>
                          <h4 className="font-medium mb-1">{action.title}</h4>
                          <p className="text-sm">{action.description}</p>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-lg font-medium text-primary mt-6">Best Practices</h3>
                    <ul className="space-y-2">
                      {[
                        "Review applications promptly to maintain student interest",
                        "Provide constructive feedback, especially for rejected applications",
                        "Consider a brief interview for promising candidates",
                        "Clearly communicate expectations to approved students",
                        "Keep track of your project capacity and close applications when filled",
                      ].map((practice, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/login?redirect=/dashboard/faculty/applications" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90">View Your Applications</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Common questions about using the Research Portal as faculty</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    {[
                      {
                        question: "How many research projects can I post?",
                        answer:
                          "There is no limit to the number of research projects you can post. However, we recommend managing a reasonable number that you can effectively supervise.",
                      },
                      {
                        question: "Can I edit a project listing after publishing it?",
                        answer:
                          "Yes, you can edit any aspect of your project listing after publishing. Students who have already applied will be notified of significant changes.",
                      },
                      {
                        question: "How do I close applications for a project?",
                        answer:
                          "You can close applications by changing the project status to 'Filled' or 'Closed' from your dashboard. This will prevent new students from applying while maintaining the listing for reference.",
                      },
                      {
                        question: "Can I communicate with students before approving their application?",
                        answer:
                          "Yes, you can message applicants directly through the platform to ask questions, request additional information, or schedule interviews before making a decision.",
                      },
                      {
                        question: "How can I view a student's CV and certificates?",
                        answer:
                          "When reviewing an application, you'll see options to view the student's uploaded CV and certificates directly within the application details page.",
                      },
                      {
                        question: "What happens after I approve a student?",
                        answer:
                          "The student will receive a notification of acceptance. You'll then have access to their contact information, and they'll appear in your 'Active Projects' section for ongoing management.",
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
                  <Link href="/register?role=faculty">
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
