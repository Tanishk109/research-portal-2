"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Database, X, RefreshCw, Table, User, FileText, AlertCircle, CheckCircle, Server } from "lucide-react"

interface DatabaseStatus {
  success: boolean
  message: string
  data?: {
    status: string
    info: {
      database_name: string
      user: string
      version: string
      timestamp: string
    }
    tables: Record<
      string,
      {
        exists: boolean
        count: number
        status: string
        error?: string
      }
    >
  }
}

export default function DatabaseConnectionPage() {
  const [loading, setLoading] = useState(true)
  const [testingTable, setTestingTable] = useState("")
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

  const testTable = async (tableName: string) => {
    setTestingTable(tableName)

    try {
      const response = await fetch("/api/db-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: tableName }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ Table "${tableName}" test successful!\n\nRecords found: ${data.data.count}`)
        // Refresh the main status to update counts
        fetchDbStatus()
      } else {
        alert(`❌ Table "${tableName}" test failed!\n\nError: ${data.message}`)
      }
    } catch (err) {
      console.error(`Error testing table ${tableName}:`, err)
      alert(`❌ Error testing table "${tableName}"`)
    } finally {
      setTestingTable("")
    }
  }

  useEffect(() => {
    fetchDbStatus()
  }, [])

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">MySQL Database Connection</h1>
          <p className="text-muted-foreground">Test and monitor your MySQL database connection</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDbStatus}
          disabled={loading}
          className="flex items-center gap-2 bg-transparent"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </>
          )}
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
              MySQL Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : dbStatus?.success ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Connected
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {dbStatus?.data?.info?.database_name || "Unknown database"}
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
              <Table className="h-5 w-5" />
              Tables Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : dbStatus?.data?.tables ? (() => {
                  const tables = dbStatus.data.tables;
                  if (tables && typeof tables === 'object' && !Array.isArray(tables)) {
                    return Object.entries(tables).map(([tableName, tableInfo]) => (
                  <div key={tableName} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{tableName}</span>
                    <div className="flex items-center gap-2">
                      {tableInfo.exists ? (
                        <>
                          <Badge variant="outline" className="text-xs">
                            {tableInfo.count} records
                          </Badge>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </>
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                    ));
                  } else {
                    // Debug log
                    console.log('dbStatus.data.tables is not a valid object:', tables);
                    return (
                      <div className="text-sm text-muted-foreground">
                        No table information available
              </div>
                    );
                  }
                })()
              : <div className="text-sm text-muted-foreground">No table information available</div>
            }
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status">
        <TabsList className="mb-4">
          <TabsTrigger value="status">Connection Details</TabsTrigger>
          <TabsTrigger value="tables">Test Tables</TabsTrigger>
          <TabsTrigger value="raw">Raw Response</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Database Information
              </CardTitle>
              <CardDescription>Details about your MySQL database connection</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : dbStatus?.success && dbStatus.data ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Database Name</p>
                      <p className="text-sm font-mono">{dbStatus?.data?.info?.database_name || "Unknown database"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">User</p>
                      <p className="text-sm font-mono">{dbStatus?.data?.info?.user || "Unknown user"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">MySQL Version</p>
                      <p className="text-sm font-mono">{dbStatus?.data?.info?.version || "Unknown version"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Checked</p>
                      <p className="text-sm font-mono">{dbStatus?.data?.info?.timestamp ? new Date(dbStatus.data.info.timestamp).toLocaleString() : "Unknown"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {dbStatus.data.tables && typeof dbStatus.data.tables === 'object' && !Array.isArray(dbStatus.data.tables) ? 
                      Object.entries(dbStatus.data.tables).map(([tableName, tableInfo]) => (
                      <div key={tableName} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{tableName}</h4>
                          {tableInfo.exists ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tableInfo.exists ? `${tableInfo.count} records` : "Missing"}
                        </p>
                      </div>
                      ))
                      : <div className="col-span-full text-center text-muted-foreground">No table information available</div>
                    }
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

        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Test Individual Tables
              </CardTitle>
              <CardDescription>Click on any table to test its connectivity and get record count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "users", icon: <User className="h-4 w-4" />, description: "User accounts" },
                  { name: "faculty_profiles", icon: <User className="h-4 w-4" />, description: "Faculty information" },
                  { name: "student_profiles", icon: <User className="h-4 w-4" />, description: "Student information" },
                  { name: "projects", icon: <FileText className="h-4 w-4" />, description: "Research projects" },
                  { name: "applications", icon: <FileText className="h-4 w-4" />, description: "Project applications" },
                  { name: "login_activity", icon: <Database className="h-4 w-4" />, description: "Login tracking" },
                ].map((table) => (
                  <Button
                    key={table.name}
                    variant="outline"
                    className="h-auto py-4 justify-start bg-transparent"
                    onClick={() => testTable(table.name)}
                    disabled={testingTable === table.name}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {table.icon}
                      <div className="text-left flex-1">
                        <div className="font-medium">{table.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {testingTable === table.name ? "Testing..." : table.description}
                        </div>
                      </div>
                      {testingTable === table.name && <RefreshCw className="h-4 w-4 animate-spin" />}
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
