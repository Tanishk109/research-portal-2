"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, CheckCircle2, MailCheck } from "lucide-react"
import { AuthBackground } from "@/components/auth-background"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams?.get("token") || ""
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [verified, setVerified] = useState(false)
  const { toast } = useToast()

  const handleVerify = async () => {
    if (!token) {
      setError("Verification token is missing.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to verify this email.")
      }

      setVerified(true)
      toast({
        title: "Email verified",
        description: "Your account is ready.",
      })

      window.location.href = data.redirectTo || "/login"
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to verify this email."
      setError(message)
      toast({
        title: "Verification failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-10">
      <AuthBackground />
      <Card className="w-full max-w-lg z-10">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {verified ? <CheckCircle2 className="h-6 w-6" /> : <MailCheck className="h-6 w-6" />}
          </div>
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            Confirm your email address to create your account and continue to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!token && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Missing link details</AlertTitle>
              <AlertDescription>This verification link is incomplete. Please request a new verification email.</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {verified && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Verified</AlertTitle>
              <AlertDescription>Your account has been created. Redirecting now...</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="button" className="w-full" onClick={handleVerify} disabled={!token || loading || verified}>
            {loading ? "Verifying..." : "Verify and continue"}
          </Button>
          <Button type="button" variant="outline" className="w-full" asChild>
            <Link href="/login">Back to login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  )
}
