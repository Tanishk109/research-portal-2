"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Database, UserPlus, RefreshCw } from "lucide-react"
import { testDatabase } from "@/app/actions/test-db-connection"
import { seedTestAccounts } from "@/app/actions/seed-test-accounts"

export default function DatabaseTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    loading: boolean
    tested: boolean
    success?: boolean
    message?: string
    details?: any
  }>({
    loading: false,
    tested: false,
  })

  const [seedStatus, setSeedStatus] = useState<{
    loading: boolean
    seeded: boolean
    success?: boolean
    message?: string
    accounts?: any[]
  }>({
    loading: false,
    seeded: false,
  })

  const testDatabaseConnection = async () => {
    setConnectionStatus({ loading: true, tested: false })
    try {
      const result = await testDatabase()
      setConnectionStatus({
        loading: false,
        tested: true,
        success: result.success,
        message: result.message,
        details: result,
      })
    } catch (error) {
      setConnectionStatus({
        loading: false,
        tested: true,
        success: false,
        message: `Error testing database: ${error instanceof Error ? error.message : String(error)}`,
      })
    }
  }

  const createTestAccounts = async () => {
    setSeedStatus({ loading: true, seeded: false })
    try {
      const result = await seedTestAccounts()
      setSeedStatus({
        loading: false,
        seeded: true,
        success: result.success,
        message: result.message,
        accounts: result.accounts,
      })
    } catch (error) {
      setSeedStatus({
        loading: false,
        seeded: true,
        success: false,
        message: `Error seeding accounts: ${error instanceof Error ? error.message : String(error)}`,
      })
    }
  }

  // Run database test on page load
  useEffect(() => {
    testDatabaseConnection()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Connection
            </CardTitle>
            <CardDescription>Test the connection to your Neon PostgreSQL database</CardDescription>
          </CardHeader>
          <CardContent>
            {connectionStatus.tested && (
              <Alert variant={connectionStatus.success ? "default" : "destructive"} className="mb-4">
                <div className="flex items-center gap-2">
                  {connectionStatus.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  <AlertTitle>{connectionStatus.success ? "Connection Successful" : "Connection Failed"}</AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  {connectionStatus.message}

                  {connectionStatus.success && connectionStatus.details?.currentTime && (
                    <div className="mt-2 text-sm">
                      <strong>Database Time:</strong> {new Date(connectionStatus.details.currentTime).toLocaleString()}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={testDatabaseConnection} disabled={connectionStatus.loading} className="w-full">
              {connectionStatus.loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create Test Accounts
            </CardTitle>
            <CardDescription>Seed the database with test faculty and student accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {seedStatus.seeded && (
              <Alert variant={seedStatus.success ? "default" : "destructive"} className="mb-4">
                <div className="flex items-center gap-2">
                  {seedStatus.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  <AlertTitle>{seedStatus.success ? "Accounts Created" : "Account Creation Failed"}</AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  {seedStatus.message}

                  {seedStatus.success && seedStatus.accounts && seedStatus.accounts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Test Account Credentials:</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {seedStatus.accounts.map((account, index) => (
                          <div key={index} className="p-2 bg-secondary/10 rounded-md">
                            <div>
                              <strong>Email:</strong> {account.email}
                            </div>
                            <div>
                              <strong>Password:</strong> {account.password}
                            </div>
                            <div>
                              <strong>Role:</strong> {account.role}
                            </div>
                            <div>
                              <strong>Status:</strong> {account.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={createTestAccounts}
              disabled={seedStatus.loading || !connectionStatus.success}
              className="w-full"
            >
              {seedStatus.loading ? (
                <>
                  <UserPlus className="mr-2 h-4 w-4 animate-spin" />
                  Creating Accounts...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Test Accounts
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Tips</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Ensure your <code>DATABASE_URL</code> environment variable is correctly set in your <code>.env</code> file
          </li>
          <li>Check that your Neon PostgreSQL database is active and accessible</li>
          <li>Verify that your IP address is allowed in the database firewall settings</li>
          <li>Make sure the database user has sufficient permissions to create tables and indexes</li>
          <li>If using Vercel, ensure the environment variable is properly configured in your project settings</li>
        </ul>
      </div>
    </div>
  )
}
