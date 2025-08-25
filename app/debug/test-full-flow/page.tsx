"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Play, User, UserCheck, LogIn, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"

interface TestStep {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "success" | "error"
  message?: string
  data?: any
  duration?: number
}

export default function TestFullFlowPage() {
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: "db-connection",
      name: "Database Connection",
      description: "Test database connectivity and health",
      status: "pending",
    },
    {
      id: "table-check",
      name: "Table Verification",
      description: "Verify all required tables exist",
      status: "pending",
    },
    {
      id: "create-test-users",
      name: "Create Test Users",
      description: "Create faculty and student test accounts",
      status: "pending",
    },
    {
      id: "test-registration",
      name: "Test Registration",
      description: "Test new user registration process",
      status: "pending",
    },
    {
      id: "test-login",
      name: "Test Login",
      description: "Test login with created accounts",
      status: "pending",
    },
    {
      id: "test-dashboard-access",
      name: "Dashboard Access",
      description: "Verify dashboard access after login",
      status: "pending",
    },
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [testAccounts, setTestAccounts] = useState<any[]>([])
  const router = useRouter()

  const updateStep = (id: string, updates: Partial<TestStep>) => {
    setSteps((prev) => prev.map((step) => (step.id === id ? { ...step, ...updates } : step)))
  }

  const runStep = async (stepId: string, testFn: () => Promise<any>) => {
    const startTime = Date.now()
    updateStep(stepId, { status: "running" })

    try {
      const result = await testFn()
      const duration = Date.now() - startTime

      updateStep(stepId, {
        status: "success",
        message: "Completed successfully",
        data: result,
        duration,
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      const message = error instanceof Error ? error.message : String(error)

      updateStep(stepId, {
        status: "error",
        message,
        duration,
      })

      throw error
    }
  }

  const testDatabaseConnection = async () => {
    const response = await fetch("/api/db-test")
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Database connection failed")
    }

    return data.data
  }

  const testTableVerification = async () => {
    const tables = ["users", "faculty_profiles", "student_profiles", "login_activity"]
    const results = {}

    for (const table of tables) {
      const response = await fetch("/api/db-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(`Table ${table} verification failed: ${data.message}`)
      }

      results[table] = data.data
    }

    return results
  }

  const createTestUsers = async () => {
    const users = []

    // Create faculty user
    const facultyResponse = await fetch("/api/registration-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "faculty" }),
    })

    const facultyData = await facultyResponse.json()
    if (!facultyData.success) {
      throw new Error(`Faculty user creation failed: ${facultyData.message}`)
    }

    users.push(facultyData.data.user)

    // Create student user
    const studentResponse = await fetch("/api/registration-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "student" }),
    })

    const studentData = await studentResponse.json()
    if (!studentData.success) {
      throw new Error(`Student user creation failed: ${studentData.message}`)
    }

    users.push(studentData.data.user)

    setTestAccounts(users)
    return users
  }

  const testRegistration = async () => {
    const timestamp = Date.now()

    // Test faculty registration
    const facultyData = {
      role: "faculty",
      firstName: "New",
      lastName: "Faculty",
      email: `new.faculty.${timestamp}@test.com`,
      password: "TestPassword123!",
      facultyId: `NEWFAC${timestamp}`,
      department: "Computer Science",
      specialization: "Data Science",
      dateOfJoining: "2024-01-01",
      dateOfBirth: "1985-01-01",
      userAgent: navigator.userAgent,
      ipAddress: "127.0.0.1",
    }

    const facultyResponse = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(facultyData),
    })

    const facultyResult = await facultyResponse.json()
    if (!facultyResult.success) {
      throw new Error(`Faculty registration failed: ${facultyResult.message}`)
    }

    // Test student registration
    const studentData = {
      role: "student",
      firstName: "New",
      lastName: "Student",
      email: `new.student.${timestamp}@test.com`,
      password: "TestPassword123!",
      registrationNumber: `NEWSTU${timestamp}`,
      department: "Computer Science",
      year: "2",
      cgpa: "8.0",
      userAgent: navigator.userAgent,
      ipAddress: "127.0.0.1",
    }

    const studentResponse = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    })

    const studentResult = await studentResponse.json()
    if (!studentResult.success) {
      throw new Error(`Student registration failed: ${studentResult.message}`)
    }

    return {
      faculty: facultyResult.data,
      student: studentResult.data,
    }
  }

  const testLogin = async () => {
    const loginResults = []

    // Test login with test accounts
    for (const account of testAccounts) {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
          userAgent: navigator.userAgent,
          ipAddress: "127.0.0.1",
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(`Login failed for ${account.email}: ${data.message}`)
      }

      loginResults.push({
        email: account.email,
        role: account.role,
        loginSuccess: true,
      })
    }

    return loginResults
  }

  const testDashboardAccess = async () => {
    // Test dashboard access by checking if we can fetch user data
    const response = await fetch("/api/auth/me")
    const data = await response.json()

    if (!data.success) {
      throw new Error("Dashboard access test failed: User not authenticated")
    }

    return {
      authenticated: true,
      user: data.data,
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setCurrentStepIndex(0)

    try {
      // Step 1: Database Connection
      setCurrentStepIndex(0)
      await runStep("db-connection", testDatabaseConnection)

      // Step 2: Table Verification
      setCurrentStepIndex(1)
      await runStep("table-check", testTableVerification)

      // Step 3: Create Test Users
      setCurrentStepIndex(2)
      await runStep("create-test-users", createTestUsers)

      // Step 4: Test Registration
      setCurrentStepIndex(3)
      await runStep("test-registration", testRegistration)

      // Step 5: Test Login
      setCurrentStepIndex(4)
      await runStep("test-login", testLogin)

      // Step 6: Test Dashboard Access
      setCurrentStepIndex(5)
      await runStep("test-dashboard-access", testDashboardAccess)

      console.log("🎉 All tests completed successfully!")
    } catch (error) {
      console.error("❌ Test suite failed:", error)
    } finally {
      setIsRunning(false)
      setCurrentStepIndex(-1)
    }
  }

  const getStepIcon = (step: TestStep) => {
    switch (step.status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "running":
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
    }
  }

  const getStepBadge = (step: TestStep) => {
    switch (step.status) {
      case "success":
        return <Badge className="bg-green-500">Success</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "running":
        return <Badge className="bg-blue-500">Running</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const successCount = steps.filter((s) => s.status === "success").length
  const errorCount = steps.filter((s) => s.status === "error").length

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Full Flow Testing</h1>
            <p className="text-gray-600">Complete registration to dashboard flow testing</p>
          </div>
          <Button onClick={runAllTests} disabled={isRunning} size="lg">
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Running Tests..." : "Run Full Test"}
          </Button>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Test Progress
              <div className="flex gap-2">
                <Badge className="bg-green-500">{successCount} Passed</Badge>
                {errorCount > 0 && <Badge variant="destructive">{errorCount} Failed</Badge>}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    currentStepIndex === index ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  {getStepIcon(step)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{step.name}</h3>
                      {getStepBadge(step)}
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {step.message && (
                      <p className={`text-sm mt-1 ${step.status === "error" ? "text-red-600" : "text-green-600"}`}>
                        {step.message}
                      </p>
                    )}
                    {step.duration && <p className="text-xs text-gray-500 mt-1">Completed in {step.duration}ms</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Accounts */}
        {testAccounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Test Accounts Created
              </CardTitle>
              <CardDescription>Use these accounts to test login functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testAccounts.map((account, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium capitalize">{account.role}</h3>
                      <Badge variant="outline">{account.role}</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Email:</strong> {account.email}
                      </p>
                      <p>
                        <strong>Password:</strong> {account.password}
                      </p>
                      <p>
                        <strong>Name:</strong> {account.name}
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(account.email)
                        }}
                      >
                        Copy Email
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          router.push(`/login?email=${encodeURIComponent(account.email)}`)
                        }}
                      >
                        <LogIn className="h-4 w-4 mr-1" />
                        Test Login
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Test individual components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/register")}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <UserCheck className="h-6 w-6" />
                Test Registration
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <LogIn className="h-6 w-6" />
                Test Login
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/faculty")}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <LayoutDashboard className="h-6 w-6" />
                Faculty Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/student")}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <LayoutDashboard className="h-6 w-6" />
                Student Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
