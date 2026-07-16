"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { AuthBackground } from "@/components/auth-background"
import { api, endpoints, getClientIpAddress } from "@/lib/api-client"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams?.get("role") || "faculty"
  const authError = searchParams?.get("error") || ""
  const redirectTo = searchParams?.get("redirect") || ""
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultRole)
  const [ipAddress, setIpAddress] = useState<string>("unknown")

  const [formData, setFormData] = useState({
    faculty: {
      email: "",
      password: "",
    },
    student: {
      email: "",
      password: "",
    },
  })

  // Update active tab when defaultRole changes
  useEffect(() => {
    setActiveTab(defaultRole)
  }, [defaultRole])

  useEffect(() => {
    if (!authError) return

    const messages: Record<string, string> = {
      google_not_configured: "Google sign-in is not configured yet.",
      google_state_invalid: "Google sign-in expired. Please try again.",
      google_email_unverified: "Google could not verify that email address.",
      google_auth_failed: "Google sign-in failed. Please try again.",
      google_account_not_found: "No portal account exists for that Google email. Please register first.",
    }

    toast({
      title: "Google sign-in unavailable",
      description: messages[authError] || "Google sign-in could not be completed.",
      variant: "destructive",
    })
  }, [authError])

  // Get client IP address
  useEffect(() => {
    const fetchIp = async () => {
      const ip = await getClientIpAddress()
      setIpAddress(ip)
    }
    fetchIp()
  }, [])

  const handleInputChange = (role: "faculty" | "student", field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent, role: "faculty" | "student") => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formValues = formData[role]

      if (!formValues.email || !formValues.password) {
        toast({
          title: "Validation Error",
          description: "Please enter both email and password",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const response = await api.post(endpoints.auth.login, {
        email: formValues.email,
        password: formValues.password,
        role: role,
        ipAddress: ipAddress,
        userAgent: navigator.userAgent,
      })

      console.log("Login response:", JSON.stringify(response, null, 2))

      // Check if response has success property
      if (response && response.success === true) {
        console.log("Login successful, redirecting...")
        toast({
          title: "Login successful",
          description: "Welcome back to the Research Portal",
        })

        // Get user role from response
        const userRole = response.data?.user?.role || response.data?.role || role
        console.log(`Redirecting to dashboard/${userRole}`)

        // Use window.location for more reliable redirect with cookie
        window.location.href = `/dashboard/${userRole}`
      } else {
        console.error("Login failed - response:", JSON.stringify(response, null, 2))
        const errorMessage = response?.message || response?.error || "Invalid email or password"
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = (role: "faculty" | "student") => {
    const params = new URLSearchParams({ role })
    if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
      params.set("redirect", redirectTo)
    }
    window.location.href = `/api/auth/google/start?${params.toString()}`
  }

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.5L15.4 17c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6C4.7 19.7 8.1 22 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H3.1C2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.4l3.3-2.6z"
      />
      <path
        fill="#EA4335"
        d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3.1 14.7 2 12 2 8.1 2 4.7 4.3 3.1 7.6l3.3 2.6C7.2 7.9 9.4 6.1 12 6.1z"
      />
    </svg>
  )

  return (
    <>
      <AuthBackground />
      <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-600 to-primary-600" />
          <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
            <Image src="/muj.png" alt="Manipal University Jaipur Logo" width={40} height={40} />
            Manipal University Jaipur
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "Join our vibrant research community and collaborate on groundbreaking projects that shape the future."
              </p>
              <footer className="text-sm">Associate Prof. Dr. Geeta Rani - Head of Department </footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-secondary-500 to-primary-500">
                Sign in to your account
              </h1>
              <p className="text-sm text-muted-foreground">Enter your credentials to access the portal</p>
            </div>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="faculty">Faculty</TabsTrigger>
                <TabsTrigger value="student">Student</TabsTrigger>
              </TabsList>
              <TabsContent value="faculty">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Faculty Login</CardTitle>
                    <CardDescription>Enter your faculty credentials</CardDescription>
                  </CardHeader>
                  <form onSubmit={(e) => handleSubmit(e, "faculty")}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="faculty-email">Email</Label>
                        <Input
                          id="faculty-email"
                          type="email"
                          placeholder="john.doe@example.com"
                          value={formData.faculty.email}
                          onChange={(e) => handleInputChange("faculty", "email", e.target.value)}
                          className="bg-white/50 backdrop-blur-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="faculty-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="faculty-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.faculty.password}
                            onChange={(e) => handleInputChange("faculty", "password", e.target.value)}
                            className="bg-white/50 backdrop-blur-sm pr-10"
                            required
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-secondary-500 to-primary-500 hover:from-secondary-600 hover:to-primary-600 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <span>Signing in...</span>
                          </div>
                        ) : (
                          "Sign in"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                  <CardFooter className="pt-0">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2 bg-white/70"
                      onClick={() => handleGoogleSignIn("faculty")}
                      disabled={isLoading}
                    >
                      <GoogleIcon />
                      Continue with Google
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="student">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Student Login</CardTitle>
                    <CardDescription>Enter your student credentials</CardDescription>
                  </CardHeader>
                  <form onSubmit={(e) => handleSubmit(e, "student")}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-email">Email</Label>
                        <Input
                          id="student-email"
                          type="email"
                          placeholder="jane.smith@example.com"
                          value={formData.student.email}
                          onChange={(e) => handleInputChange("student", "email", e.target.value)}
                          className="bg-white/50 backdrop-blur-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="student-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.student.password}
                            onChange={(e) => handleInputChange("student", "password", e.target.value)}
                            className="bg-white/50 backdrop-blur-sm pr-10"
                            required
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-secondary-500 to-primary-500 hover:from-secondary-600 hover:to-primary-600 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <span>Signing in...</span>
                          </div>
                        ) : (
                          "Sign in"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                  <CardFooter className="pt-0">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2 bg-white/70"
                      onClick={() => handleGoogleSignIn("student")}
                      disabled={isLoading}
                    >
                      <GoogleIcon />
                      Continue with Google
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href={activeTab === "faculty" ? "/register?role=faculty" : "/register?role=student"}
                className="text-primary-500 hover:text-primary-600 underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
