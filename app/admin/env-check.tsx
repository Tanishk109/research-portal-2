"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Settings } from "lucide-react"

export default function EnvCheck() {
  const [envVars, setEnvVars] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkEnv() {
      try {
        const response = await fetch("/api/env-check")
        const data = await response.json()

        if (data.success) {
          setEnvVars(data.environment)
        } else {
          setError(data.message || "Failed to fetch environment variables")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    checkEnv()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Environment Variables Check
          </CardTitle>
          <CardDescription>Verify that your environment variables are properly configured</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-5 w-5 text-red-500" />
              <AlertTitle className="text-red-700">Error</AlertTitle>
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 p-2 border-b">
                  <div className="font-medium w-1/3">{key}:</div>
                  <div className="flex-1">
                    {value === "not set" || value === false ? (
                      <span className="text-red-500 flex items-center gap-1">
                        <XCircle className="h-4 w-4" /> Not configured
                      </span>
                    ) : (
                      <span className="text-green-500 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> {value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
