"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Boxes, CheckCircle, Database, FileText, RefreshCw, Users, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DatabaseHealth {
  connection: {
    success: boolean
    message: string
    data?: any
  }
  collections: {
    [key: string]: {
      success: boolean
      data?: { count: number }
      message?: string
    }
  }
}

const collections = ["users", "faculty_profiles", "student_profiles", "projects", "applications", "login_activity"]

export default function DatabaseHealthPage() {
  const [health, setHealth] = useState<DatabaseHealth | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkDatabaseHealth = async () => {
    setLoading(true)
    setError(null)

    try {
      const connectionResponse = await fetch("/api/db-test")
      const connectionData = await connectionResponse.json()
      const collectionChecks: DatabaseHealth["collections"] = {}

      for (const collection of collections) {
        try {
          const response = await fetch("/api/db-test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ collection }),
          })
          collectionChecks[collection] = await response.json()
        } catch {
          collectionChecks[collection] = {
            success: false,
            message: `Failed to check ${collection} collection`,
          }
        }
      }

      setHealth({
        connection: connectionData,
        collections: collectionChecks,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDatabaseHealth()
  }, [])

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (success: boolean) => {
    return <Badge variant={success ? "default" : "destructive"}>{success ? "Healthy" : "Error"}</Badge>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Database Health</h1>
            <p className="text-gray-600">Monitor MongoDB connection and collection status</p>
          </div>
          <Button onClick={checkDatabaseHealth} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {health && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  MongoDB Connection
                  {getStatusBadge(health.connection.success)}
                </CardTitle>
                <CardDescription>Connection status and database information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(health.connection.success)}
                    <span className="font-medium">{health.connection.success ? "Connected" : "Connection Failed"}</span>
                  </div>

                  {health.connection.data?.info && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Database</p>
                        <p className="text-sm">{health.connection.data.info.database_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Host</p>
                        <p className="text-sm">{health.connection.data.info.host}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Version</p>
                        <p className="text-sm">{health.connection.data.info.version}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Boxes className="h-5 w-5" />
                  Collections Status
                </CardTitle>
                <CardDescription>Status and document counts for all MongoDB collections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(health.collections).map(([collectionName, collectionData]) => (
                    <div key={collectionName} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium capitalize">{collectionName.replace("_", " ")}</h3>
                        {getStatusIcon(collectionData.success)}
                      </div>

                      {collectionData.success && collectionData.data ? (
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-blue-600">{collectionData.data.count}</p>
                          <p className="text-sm text-gray-500">documents</p>
                        </div>
                      ) : (
                        <p className="text-sm text-red-600">{collectionData.message || "Collection check failed"}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{health.collections.users?.data?.count || 0}</p>
                    <p className="text-sm text-gray-500">Total Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {health.collections.faculty_profiles?.data?.count || 0}
                    </p>
                    <p className="text-sm text-gray-500">Faculty</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {health.collections.student_profiles?.data?.count || 0}
                    </p>
                    <p className="text-sm text-gray-500">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{health.collections.projects?.data?.count || 0}</p>
                    <p className="text-sm text-gray-500">Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg">Checking database health...</span>
          </div>
        )}
      </div>
    </div>
  )
}
