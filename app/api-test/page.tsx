"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { XCircle, RefreshCw } from "lucide-react"

export default function ApiTestPage() {
  const [endpoint, setEndpoint] = useState("/api/health")
  const [method, setMethod] = useState("GET")
  const [headers, setHeaders] = useState("{}")
  const [body, setBody] = useState("{}")
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      // Parse headers
      let headerObj = {}
      try {
        headerObj = JSON.parse(headers)
      } catch (err) {
        setError("Invalid headers JSON")
        setLoading(false)
        return
      }

      // Parse body for non-GET requests
      let bodyData = undefined
      if (method !== "GET") {
        try {
          bodyData = JSON.parse(body)
        } catch (err) {
          setError("Invalid body JSON")
          setLoading(false)
          return
        }
      }

      // Make request
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headerObj,
        },
        ...(method !== "GET" && { body: JSON.stringify(bodyData) }),
      })

      // Parse response
      const data = await response.json()

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      })
    } catch (err) {
      setError(`Request failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const presetEndpoints = [
    { name: "Health Check", endpoint: "/api/health", method: "GET", body: "{}" },
    {
      name: "Faculty Login",
      endpoint: "/api/auth/login",
      method: "POST",
      body: JSON.stringify({ email: "faculty@test.com", password: "faculty123", role: "faculty" }, null, 2),
    },
    {
      name: "Student Login",
      endpoint: "/api/auth/login",
      method: "POST",
      body: JSON.stringify({ email: "student@test.com", password: "student123", role: "student" }, null, 2),
    },
    { name: "Check Current User", endpoint: "/api/auth/me", method: "GET", body: "{}" },
    { name: "Logout", endpoint: "/api/auth/logout", method: "POST", body: "{}" },
  ]

  const loadPreset = (preset: (typeof presetEndpoints)[0]) => {
    setEndpoint(preset.endpoint)
    setMethod(preset.method)
    setBody(preset.body)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">API Test Client</h1>

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Preset Endpoints</h2>
        <div className="flex flex-wrap gap-2">
          {presetEndpoints.map((preset, index) => (
            <Button key={index} variant="outline" onClick={() => loadPreset(preset)} className="text-sm">
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
            <CardDescription>Configure your API request</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="method">Method</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/api/health"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headers">Headers (JSON)</Label>
                <Textarea
                  id="headers"
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder='{"Authorization": "Bearer token"}'
                  rows={3}
                />
              </div>

              {method !== "GET" && (
                <div className="space-y-2">
                  <Label htmlFor="body">Body (JSON)</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={5}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Request"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>API response details</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : response ? (
              <Tabs defaultValue="body" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="body">Body</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                </TabsList>
                <TabsContent value="body" className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        response.status >= 200 && response.status < 300
                          ? "bg-green-500"
                          : response.status >= 400
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }`}
                    />
                    <span className="font-medium">
                      Status: {response.status} {response.statusText}
                    </span>
                  </div>
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </TabsContent>
                <TabsContent value="headers">
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Send a request to see the response</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
