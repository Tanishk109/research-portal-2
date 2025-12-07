"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, AlertCircle, Database, Info } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { AuthBackground } from "@/components/auth-background"
import { api, endpoints, getClientIpAddress } from "@/lib/api-client"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "faculty"
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultRole)
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "disconnected" | "preview">("checking")
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

  // Check database connection
  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        const response = await api.get(endpoints.health)

        if (response.success && response.data) {
          // Check if database is connected
          if (response.data.status === "preview_no_db") {
            setDbStatus("preview")
          } else if (response.data.database?.connected === true || response.data.status === "healthy") {
            setDbStatus("connected")
          } else {
            setDbStatus("disconnected")
          }
        } else {
          // If health check fails, still allow login (database might be slow to connect)
          // The actual login will handle the connection
          console.warn("Health check returned unsuccessful, but allowing login attempt")
          setDbStatus("connected") // Allow login to proceed
        }
      } catch (error) {
        console.error("Health check error:", error)
        // Don't block login if health check fails - let the actual login handle it
        setDbStatus("connected") // Allow login to proceed
      }
    }

    checkDbConnection()
  }, [])

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

      // In preview mode with no DB, simulate successful login
      if (dbStatus === "preview") {
        toast({
          title: "Preview Mode Login",
          description: "Simulating successful login in preview mode",
        })

        // Redirect based on role
        setTimeout(() => {
          router.push(`/dashboard/${role}`)
        }, 1500)

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

              {/* Database connection status */}
              <div className="flex items-center justify-center mt-2">
                <div
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                    dbStatus === "checking"
                      ? "bg-yellow-100 text-yellow-800"
                      : dbStatus === "connected"
                        ? "bg-green-100 text-green-800"
                        : dbStatus === "preview"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  <Database className="h-3 w-3" />
                  <span>
                    {dbStatus === "checking"
                      ? "Checking database..."
                      : dbStatus === "connected"
                        ? "Database connected"
                        : dbStatus === "preview"
                          ? "Preview mode (no database)"
                          : "Database disconnected"}
                  </span>
                </div>
              </div>
            </div>

            {dbStatus === "preview" && (
              <div className="p-3 bg-blue-100 text-blue-800 rounded-md text-sm">
                <div className="font-semibold flex items-center gap-1.5">
                  <Info className="h-4 w-4" />
                  Preview Mode
                </div>
                <p className="mt-1">
                  Running in preview mode without a database connection. Login functionality is simulated.
                </p>
              </div>
            )}

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
                        disabled={isLoading || (dbStatus !== "connected" && dbStatus !== "preview")}
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
                        disabled={isLoading || (dbStatus !== "connected" && dbStatus !== "preview")}
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

            {dbStatus === "disconnected" && (
              <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  Database Connection Error
                </div>
                <p className="mt-1">
                  Unable to connect to the database. Please check your database configuration or visit the{" "}
                  <Link href="/admin/database-test" className="underline font-medium">
                    database test page
                  </Link>{" "}
                  for troubleshooting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
