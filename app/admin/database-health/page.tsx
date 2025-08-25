"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Users, FileText } from "lucide-react"

interface DatabaseHealth {
  connection: {
    success: boolean
    message: string
    data?: any
  }
  tables: {
    [key: string]: {
      success: boolean
      data?: { count: number }
      message?: string
    }
  }
}

export default function DatabaseHealthPage() {
  const [health, setHealth] = useState<DatabaseHealth | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkDatabaseHealth = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check database connection
      const connectionResponse = await fetch("/api/db-test")
      const connectionData = await connectionResponse.json()

      // Check individual tables
      const tables = ["users", "faculty_profiles", "student_profiles", "projects", "applications", "login_activity"]
      const tableChecks: { [key: string]: any } = {}

      for (const table of tables) {
        try {
          const tableResponse = await fetch("/api/db-test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ table }),
          })
          const tableData = await tableResponse.json()
          tableChecks[table] = tableData
        } catch (err) {
          tableChecks[table] = {
            success: false,
            message: `Failed to check ${table} table`,
          }
        }
      }

      setHealth({
        connection: connectionData,
        tables: tableChecks,
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
            <p className="text-gray-600">Monitor database connection and table status</p>
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
            {/* Database Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Connection
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
                        <p className="text-sm">{health.connection.data.info.database}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">User</p>
                        <p className="text-sm">{health.connection.data.info.user}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Version</p>
                        <p className="text-sm">{health.connection.data.info.version?.split(" ")[0]}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tables Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tables Status
                </CardTitle>
                <CardDescription>Status and record counts for all database tables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(health.tables).map(([tableName, tableData]) => (
                    <div key={tableName} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium capitalize">{tableName.replace("_", " ")}</h3>
                        {getStatusIcon(tableData.success)}
                      </div>

                      {tableData.success && tableData.data ? (
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-blue-600">{tableData.data.count}</p>
                          <p className="text-sm text-gray-500">records</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-red-600">{tableData.message || "Table check failed"}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
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
                    <p className="text-2xl font-bold text-blue-600">{health.tables.users?.data?.count || 0}</p>
                    <p className="text-sm text-gray-500">Total Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {health.tables.faculty_profiles?.data?.count || 0}
                    </p>
                    <p className="text-sm text-gray-500">Faculty</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {health.tables.student_profiles?.data?.count || 0}
                    </p>
                    <p className="text-sm text-gray-500">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{health.tables.projects?.data?.count || 0}</p>
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
