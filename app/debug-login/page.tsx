"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DebugLoginPage() {
  const [email, setEmail] = useState("faculty@example.com")
  const [password, setPassword] = useState("password123")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

  // For registration
  const [firstName, setFirstName] = useState("Test")
  const [lastName, setLastName] = useState("User")
  const [role, setRole] = useState("faculty")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
          ipAddress: "127.0.0.1",
          userAgent: navigator.userAgent,
        }),
      })

      const data = await response.json()
      setResult(data)

      if (!data.success) {
        setError(data.message || "Login failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const userData = {
        role,
        firstName,
        lastName,
        email,
        password,
        // Faculty fields
        facultyId: "F12345",
        department: "Computer Science",
        specialization: "AI",
        dateOfJoining: "2023-01-01",
        dateOfBirth: "1980-01-01",
        // Student fields
        registrationNumber: "S12345",
        year: "3",
        cgpa: "8.5",
        // Client info
        userAgent: navigator.userAgent,
        ipAddress: "127.0.0.1",
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      setResult(data)

      if (!data.success) {
        setError(data.message || "Registration failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Debug Authentication</CardTitle>
          <CardDescription>Test login and registration with detailed error reporting</CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    className="w-full p-2 border rounded"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="faculty">Faculty</option>
                    <option value="student">Student</option>
                  </select>
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : "Debug Login"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-role">Role</Label>
                  <select
                    id="reg-role"
                    className="w-full p-2 border rounded"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="faculty">Faculty</option>
                    <option value="student">Student</option>
                  </select>
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : "Debug Register"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="px-6 pb-6">
            <Alert className="bg-red-50 border-red-200">
              <AlertTitle className="text-red-700">Error</AlertTitle>
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {result && (
          <div className="px-6 pb-6">
            <div className="mt-4 p-4 bg-gray-50 rounded-md border">
              <h3 className="font-medium mb-2">Response:</h3>
              <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
