"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Boxes, CheckCircle, Database, FileText, RefreshCw, Server, User, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CollectionStatus {
  exists: boolean
  count: number
  status: string
  error?: string
}

interface DatabaseStatus {
  success: boolean
  message: string
  data?: {
    status: string
    info: {
      database_name: string
      host?: string
      version?: string
      timestamp?: string
    }
    collections: Record<string, CollectionStatus>
  }
}

const collections = [
  { name: "users", icon: <User className="h-4 w-4" />, description: "User accounts" },
  { name: "faculty_profiles", icon: <User className="h-4 w-4" />, description: "Faculty information" },
  { name: "student_profiles", icon: <User className="h-4 w-4" />, description: "Student information" },
  { name: "projects", icon: <FileText className="h-4 w-4" />, description: "Research projects" },
  { name: "applications", icon: <FileText className="h-4 w-4" />, description: "Project applications" },
  { name: "login_activity", icon: <Database className="h-4 w-4" />, description: "Login tracking" },
]

export default function DatabaseConnectionPage() {
  const [loading, setLoading] = useState(true)
  const [testingCollection, setTestingCollection] = useState("")
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchDbStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/db-test")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch database status")
      }

      setDbStatus(data)
    } catch (err) {
      console.error("Error fetching database status:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch database status")
    } finally {
      setLoading(false)
    }
  }

  const testCollection = async (collectionName: string) => {
    setTestingCollection(collectionName)

    try {
      const response = await fetch("/api/db-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: collectionName }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`Collection "${collectionName}" is accessible.\n\nDocuments found: ${data.data.count}`)
        fetchDbStatus()
      } else {
        alert(`Collection "${collectionName}" test failed.\n\nError: ${data.message}`)
      }
    } catch (err) {
      console.error(`Error testing collection ${collectionName}:`, err)
      alert(`Error testing collection "${collectionName}"`)
    } finally {
      setTestingCollection("")
    }
  }

  useEffect(() => {
    fetchDbStatus()
  }, [])

  const collectionStatus = dbStatus?.data?.collections || {}

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">MongoDB Connection</h1>
          <p className="text-muted-foreground">Test and monitor your MongoDB database connection</p>
        </div>
        <Button variant="outline" onClick={fetchDbStatus} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Checking..." : "Refresh"}</span>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              MongoDB Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <RefreshCw className="h-6 w-6 animate-spin" />
            ) : dbStatus?.success ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Connected
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {dbStatus.data?.info?.database_name || "Unknown database"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="destructive">
                  <X className="h-3.5 w-3.5 mr-1" />
                  Disconnected
                </Badge>
                <span className="text-sm text-muted-foreground">Connection failed</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Boxes className="h-5 w-5" />
              Collections Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(collectionStatus).length > 0 ? (
              Object.entries(collectionStatus).map(([collectionName, info]) => (
                <div key={collectionName} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{collectionName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {info.count} documents
                    </Badge>
                    {info.exists ? <CheckCircle className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No collection information available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status">
        <TabsList className="mb-4">
          <TabsTrigger value="status">Connection Details</TabsTrigger>
          <TabsTrigger value="collections">Test Collections</TabsTrigger>
          <TabsTrigger value="raw">Raw Response</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Database Information
              </CardTitle>
              <CardDescription>Details about your MongoDB connection</CardDescription>
            </CardHeader>
            <CardContent>
              {dbStatus?.success && dbStatus.data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Database Name</p>
                    <p className="text-sm font-mono">{dbStatus.data.info.database_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Host</p>
                    <p className="text-sm font-mono">{dbStatus.data.info.host || "Unknown host"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">MongoDB Version</p>
                    <p className="text-sm font-mono">{dbStatus.data.info.version || "Unknown version"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Checked</p>
                    <p className="text-sm font-mono">
                      {dbStatus.data.info.timestamp ? new Date(dbStatus.data.info.timestamp).toLocaleString() : "Unknown"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {error ? "Failed to connect to database" : "No database information available"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Boxes className="h-5 w-5" />
                Test Individual Collections
              </CardTitle>
              <CardDescription>Click a collection to test connectivity and get document count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((collection) => (
                  <Button
                    key={collection.name}
                    variant="outline"
                    className="h-auto py-4 justify-start"
                    onClick={() => testCollection(collection.name)}
                    disabled={testingCollection === collection.name}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {collection.icon}
                      <div className="text-left flex-1">
                        <div className="font-medium">{collection.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {testingCollection === collection.name ? "Testing..." : collection.description}
                        </div>
                      </div>
                      {testingCollection === collection.name && <RefreshCw className="h-4 w-4 animate-spin" />}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <CardTitle>Raw API Response</CardTitle>
              <CardDescription>Complete response from the database test API</CardDescription>
            </CardHeader>
            <CardContent>
              {dbStatus ? (
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs max-h-96">
                  {JSON.stringify(dbStatus, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No response data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
