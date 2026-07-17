"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { AuthBackground } from "@/components/auth-background"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Mail } from "lucide-react"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const initialRole = searchParams?.get("role") === "faculty" ? "faculty" : "student"
  const [role, setRole] = useState(initialRole)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState("")
  const [verificationEmail, setVerificationEmail] = useState("")
  const { toast } = useToast()

  // Get client IP address
  const [ipAddress, setIpAddress] = useState("unknown")
  useEffect(() => {
    // Fetch IP address from ipify API
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => setIpAddress(data.ip))
      .catch((error) => console.error("Error fetching IP:", error))
  }, [])

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

      registrationData.password = password

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
        const normalizedEmail = data.data?.email || email
        setVerificationEmail(normalizedEmail)
        setPassword("")
        toast({
          title: "Verification email sent",
          description: "Open the link in your inbox to finish creating your account.",
        })
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

  const handleResend = async () => {
    if (!verificationEmail) return

    setResending(true)
    setError("")

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: verificationEmail }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to resend verification email.")
      }

      toast({
        title: "Verification email sent",
        description: "Please check your inbox again.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to resend verification email."
      setError(message)
      toast({
        variant: "destructive",
        title: "Resend failed",
        description: message,
      })
    } finally {
      setResending(false)
    }
  }

  if (verificationEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center py-10">
        <AuthBackground />
        <Card className="w-full max-w-lg z-10">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your inbox</CardTitle>
            <CardDescription>
              We sent a verification link to {verificationEmail}. Your account will be created after you verify this email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Almost done</AlertTitle>
              <AlertDescription>
                Open the email and click the verification link. You will be signed in automatically after verification.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="button" className="w-full" onClick={handleResend} disabled={resending}>
              {resending ? "Sending..." : "Resend verification email"}
            </Button>
            <Button type="button" variant="outline" className="w-full" asChild>
              <Link href="/login">Back to login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-10">
      <AuthBackground />
      <Card className="w-full max-w-2xl z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Create your account now and complete your profile after login.
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
              <RadioGroup value={role} onValueChange={setRole} className="flex space-x-4">
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending verification email..." : "Register"}
            </Button>
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
