"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Database, RefreshCw } from "lucide-react"

export default function DatabaseConnectionTest() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [details, setDetails] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const testConnection = async () => {
    setStatus("loading")
    try {
      const response = await fetch("/api/db-test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setStatus("connected")
        setDetails(data.data)
      } else {
        setStatus("error")
        setErrorMessage(data.message || "Unknown error")
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Unknown error")
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Database Connection Test
          </CardTitle>
          <CardDescription>Test the connection to your Neon PostgreSQL database</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : status === "connected" ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-700">Connection Successful</AlertTitle>
              <AlertDescription className="text-green-600">Successfully connected to the database.</AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-5 w-5 text-red-500" />
              <AlertTitle className="text-red-700">Connection Failed</AlertTitle>
              <AlertDescription className="text-red-600">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {details && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md border">
              <h3 className="font-medium mb-2">Connection Details:</h3>
              <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">{JSON.stringify(details, null, 2)}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={testConnection} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Test Connection Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
