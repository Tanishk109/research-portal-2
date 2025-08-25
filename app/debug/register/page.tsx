"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export default function DebugRegisterPage() {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        role: "student",
        firstName: "Test",
        lastName: "Student",
        email: "test.student@example.com",
        password: "password123",
        registrationNumber: "REG12345",
        department: "Computer Science",
        year: "2023",
        cgpa: "8.5",
        userAgent: "Debug Test",
        ipAddress: "127.0.0.1",
      },
      null,
      2,
    ),
  )

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      // Parse the request body
      const body = JSON.parse(requestBody)

      // Make the request
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      // Parse the response
      const data = await res.json()
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: data,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleTestDbConnection = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch("/api/db-test")
      const data = await res.json()
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: data,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleTestEnvVars = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch("/api/env-check")
      const data = await res.json()
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: data,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Debug Registration</CardTitle>
          <CardDescription>Test the registration API directly</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="register">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="db">Database</TabsTrigger>
              <TabsTrigger value="env">Environment</TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requestBody">Request Body (JSON)</Label>
                <Textarea
                  id="requestBody"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </TabsContent>

            <TabsContent value="db" className="space-y-4">
              <p className="text-sm text-gray-500">Test the database connection</p>
              <Button onClick={handleTestDbConnection} disabled={loading}>
                {loading ? "Testing..." : "Test Database Connection"}
              </Button>
            </TabsContent>

            <TabsContent value="env" className="space-y-4">
              <p className="text-sm text-gray-500">Check environment variables</p>
              <Button onClick={handleTestEnvVars} disabled={loading}>
                {loading ? "Checking..." : "Check Environment Variables"}
              </Button>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
              <h3 className="font-medium">Error</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm">{error}</pre>
            </div>
          )}

          {response && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="font-medium">Response</h3>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="font-medium">Status:</span> {response.status} {response.statusText}
                </div>
                <div>
                  <span className="font-medium">Headers:</span>
                  <pre className="mt-1 text-xs">{JSON.stringify(response.headers, null, 2)}</pre>
                </div>
                <div>
                  <span className="font-medium">Body:</span>
                  <pre className="mt-1 text-xs overflow-auto max-h-96">{JSON.stringify(response.body, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/register")}>
            Go to Register Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
