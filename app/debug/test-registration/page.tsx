"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Play } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TestResult {
  name: string
  success: boolean
  message: string
  data?: any
  duration?: number
}

export default function TestRegistrationPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string>("")

  const addResult = (result: TestResult) => {
    setResults((prev) => [...prev, result])
  }

  const clearResults = () => {
    setResults([])
  }

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    setCurrentTest(name)
    const startTime = Date.now()

    try {
      const result = await testFn()
      const duration = Date.now() - startTime

      addResult({
        name,
        success: true,
        message: "Test passed",
        data: result,
        duration,
      })
    } catch (error) {
      const duration = Date.now() - startTime

      addResult({
        name,
        success: false,
        message: error instanceof Error ? error.message : String(error),
        duration,
      })
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

  const testTableExists = async (tableName: string) => {
    const response = await fetch("/api/db-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table: tableName }),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(`Table ${tableName} does not exist or is not accessible`)
    }

    return data.data
  }

  const testFacultyRegistration = async () => {
    const testData = {
      role: "faculty",
      firstName: "Test",
      lastName: "Faculty",
      email: `test.faculty.${Date.now()}@example.com`,
      password: "TestPassword123!",
      facultyId: "FAC001",
      department: "Computer Science",
      specialization: "Machine Learning",
      dateOfJoining: "2023-01-01",
      dateOfBirth: "1980-01-01",
      userAgent: navigator.userAgent,
      ipAddress: "127.0.0.1",
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Faculty registration failed")
    }

    return data.data
  }

  const testStudentRegistration = async () => {
    const testData = {
      role: "student",
      firstName: "Test",
      lastName: "Student",
      email: `test.student.${Date.now()}@example.com`,
      password: "TestPassword123!",
      registrationNumber: "STU001",
      department: "Computer Science",
      year: "3",
      cgpa: "8.5",
      userAgent: navigator.userAgent,
      ipAddress: "127.0.0.1",
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Student registration failed")
    }

    return data.data
  }

  const testLogin = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        userAgent: navigator.userAgent,
        ipAddress: "127.0.0.1",
      }),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Login failed")
    }

    return data.data
  }

  const runAllTests = async () => {
    setIsRunning(true)
    clearResults()

    try {
      // Test database connection
      await runTest("Database Connection", testDatabaseConnection)

      // Test required tables
      const tables = ["users", "faculty_profiles", "student_profiles", "login_activity"]
      for (const table of tables) {
        await runTest(`Table: ${table}`, () => testTableExists(table))
      }

      // Test faculty registration
      let facultyEmail = ""
      await runTest("Faculty Registration", async () => {
        const result = await testFacultyRegistration()
        facultyEmail = result.user.email
        return result
      })

      // Test student registration
      let studentEmail = ""
      await runTest("Student Registration", async () => {
        const result = await testStudentRegistration()
        studentEmail = result.user.email
        return result
      })

      // Test login with registered users
      if (facultyEmail) {
        await runTest("Faculty Login", () => testLogin(facultyEmail, "TestPassword123!"))
      }

      if (studentEmail) {
        await runTest("Student Login", () => testLogin(studentEmail, "TestPassword123!"))
      }
    } catch (error) {
      console.error("Test suite error:", error)
    } finally {
      setIsRunning(false)
      setCurrentTest("")
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const successCount = results.filter((r) => r.success).length
  const totalCount = results.length

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Registration Testing</h1>
            <p className="text-gray-600">Comprehensive testing of registration and authentication</p>
          </div>
          <Button onClick={runAllTests} disabled={isRunning}>
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Running Tests..." : "Run All Tests"}
          </Button>
        </div>

        {isRunning && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Running Tests</AlertTitle>
            <AlertDescription>Currently testing: {currentTest || "Initializing..."}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Test Results
                <Badge variant={successCount === totalCount ? "default" : "destructive"}>
                  {successCount}/{totalCount} Passed
                </Badge>
              </CardTitle>
              <CardDescription>Detailed results of all registration and authentication tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(result.success)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{result.name}</h3>
                        {result.duration && <span className="text-sm text-gray-500">{result.duration}ms</span>}
                      </div>
                      <p className={`text-sm ${result.success ? "text-green-600" : "text-red-600"}`}>
                        {result.message}
                      </p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-sm text-blue-600 cursor-pointer">View Details</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="instructions" className="w-full">
          <TabsList>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions">
            <Card>
              <CardHeader>
                <CardTitle>How to Use This Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">What This Test Does:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Verifies database connection</li>
                    <li>Checks if all required tables exist</li>
                    <li>Tests faculty registration process</li>
                    <li>Tests student registration process</li>
                    <li>Verifies login functionality</li>
                    <li>Measures response times</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Before Running Tests:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Ensure your DATABASE_URL is configured</li>
                    <li>Run database setup script if tables don't exist</li>
                    <li>Check that JWT_SECRET is set</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="troubleshooting">
            <Card>
              <CardHeader>
                <CardTitle>Common Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2 text-red-600">Database Connection Failed</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Check if DATABASE_URL environment variable is set</li>
                    <li>Verify database server is running</li>
                    <li>Test connection manually using database client</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-red-600">Tables Missing</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      Run: <code className="bg-gray-100 px-1 rounded">npx tsx scripts/setup-database.ts</code>
                    </li>
                    <li>Check database permissions</li>
                    <li>Verify schema creation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-red-600">Registration Failed</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Check API route implementation</li>
                    <li>Verify password hashing is working</li>
                    <li>Check transaction support</li>
                    <li>Review server logs for detailed errors</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
