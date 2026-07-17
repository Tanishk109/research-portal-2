"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { AuthBackground } from "@/components/auth-background"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { getApiUrl } from "@/lib/api-client"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const initialRole = searchParams?.get("role") === "faculty" ? "faculty" : "student"
  const isGoogleSignup = searchParams?.get("error") === "google_account_not_found"
  const [role, setRole] = useState(initialRole)
  const [fullName, setFullName] = useState(
    [searchParams?.get("firstName"), searchParams?.get("lastName")].filter(Boolean).join(" "),
  )
  const [email, setEmail] = useState(searchParams?.get("email") || "")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  // Get client IP address
  const [ipAddress, setIpAddress] = useState("unknown")
  useEffect(() => {
    // Fetch IP address from ipify API
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => setIpAddress(data.ip))
      .catch((error) => console.error("Error fetching IP:", error))
  }, [])

  useEffect(() => {
    const error = searchParams?.get("error")
    if (error === "google_account_not_found") {
      toast({
        title: "Complete registration",
        description: "No portal account exists for that Google email yet. Confirm your role and name to continue.",
      })
    }
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmedName = fullName.trim()
    const [firstName, ...lastNameParts] = trimmedName.split(/\s+/)
    const lastName = lastNameParts.join(" ")

    if (!firstName || !lastName) {
      setError("Please enter your full name.")
      toast({
        variant: "destructive",
        title: "Full name required",
        description: "Please enter both first and last name.",
      })
      return
    }

    setLoading(true)

    try {
      // Prepare registration data
      const registrationData: any = {
        role,
        firstName,
        lastName,
        email,
        userAgent: navigator.userAgent,
        ipAddress,
      }

      if (!isGoogleSignup) {
        registrationData.password = password
      }

      console.log("Submitting registration data:", {
        ...registrationData,
        password: "[REDACTED]", // Don't log the actual password
      })

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      })

      const data = await response.json()
      console.log("Registration response:", data)

      if (data.success) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. Complete your profile to unlock portal actions.",
        })

        // Redirect based on user role
        if (role === "faculty") {
          router.push("/dashboard/faculty")
        } else {
          router.push("/dashboard/student")
        }
      } else {
        setError(data.message || "An error occurred during registration")
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: data.message || "An error occurred during registration",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Registration error",
        description: "An unexpected error occurred. Please try again.",
      })
      console.error("Registration error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    const params = new URLSearchParams({ role })
    window.location.href = getApiUrl(`/api/auth/google/start?${params.toString()}`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-10">
      <AuthBackground />
      <Card className="w-full max-w-2xl z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{isGoogleSignup ? "Complete Google sign-up" : "Create an account"}</CardTitle>
          <CardDescription>
            {isGoogleSignup
              ? "Confirm the basics now. You can complete your profile after sign-up."
              : "Create your account now and complete your profile after login."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>I am a</Label>
              <RadioGroup value={role} onValueChange={setRole} className="flex space-x-4" disabled={isGoogleSignup}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="faculty" id="faculty" />
                  <Label htmlFor="faculty">Faculty</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isGoogleSignup} required />
            </div>

            {!isGoogleSignup && (
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
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : isGoogleSignup ? "Create Google Account" : "Register"}
            </Button>
            {!isGoogleSignup && (
              <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={loading}>
                Continue with Google
              </Button>
            )}
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
