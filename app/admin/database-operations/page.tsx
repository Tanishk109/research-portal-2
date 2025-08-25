"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Database, Plus, RefreshCw, Trash2, Edit, Save, AlertTriangle, Info } from "lucide-react"
import {
  createTestEntry,
  getTestEntries,
  updateTestEntry,
  deleteTestEntry,
  deleteAllTestEntries,
  getDatabaseStats,
} from "@/app/actions/test-db-operations"

type TestEntry = {
  id: number
  title: string
  description: string
  created_at: string
}

export default function DatabaseOperationsPage() {
  const [entries, setEntries] = useState<TestEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newEntry, setNewEntry] = useState({ title: "", description: "" })
  const [editEntry, setEditEntry] = useState<TestEntry | null>(null)
  const [dbStats, setDbStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // Load entries on page load
  useEffect(() => {
    loadEntries()
    loadDatabaseStats()
  }, [])

  // Load all entries
  const loadEntries = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getTestEntries()
      if (result.success) {
        setEntries(result.entries)
        setSuccess("Entries loaded successfully")
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(`Error loading entries: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  // Load database stats
  const loadDatabaseStats = async () => {
    setStatsLoading(true)
    try {
      const result = await getDatabaseStats()
      if (result.success) {
        setDbStats(result.stats)
      }
    } catch (err) {
      console.error("Error loading database stats:", err)
    } finally {
      setStatsLoading(false)
    }
  }

  // Create a new entry
  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await createTestEntry(newEntry)
      if (result.success) {
        setSuccess(result.message)
        setNewEntry({ title: "", description: "" })
        loadEntries()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(`Error creating entry: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  // Update an entry
  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editEntry) return

    setLoading(true)
    setError(null)
    try {
      const result = await updateTestEntry(editEntry.id, {
        title: editEntry.title,
        description: editEntry.description,
      })
      if (result.success) {
        setSuccess(result.message)
        setEditEntry(null)
        loadEntries()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(`Error updating entry: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete an entry
  const handleDeleteEntry = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await deleteTestEntry(id)
      if (result.success) {
        setSuccess(result.message)
        loadEntries()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(`Error deleting entry: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete all entries
  const handleDeleteAllEntries = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await deleteAllTestEntries()
      if (result.success) {
        setSuccess(result.message)
        loadEntries()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(`Error deleting all entries: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Database Operations Test</h1>

      <Tabs defaultValue="operations" className="w-full">
        <TabsList>
          <TabsTrigger value="operations">CRUD Operations</TabsTrigger>
          <TabsTrigger value="stats">Database Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-6">
          {/* Status messages */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Create Entry Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Entry
                </CardTitle>
                <CardDescription>Add a new entry to test database write operations</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateEntry}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      placeholder="Enter a title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                      placeholder="Enter a description"
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Entry
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Actions
                </CardTitle>
                <CardDescription>Perform various database operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Button onClick={loadEntries} variant="outline" className="w-full justify-start">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Entries
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full justify-start">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete All Entries
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                          This action will delete all test entries from the database. This cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {}}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAllEntries}>
                          Delete All
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Database Test Information</AlertTitle>
                  <AlertDescription>
                    This page tests CRUD (Create, Read, Update, Delete) operations against your database. Each operation
                    will verify that your backend is properly connected to the database.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Entries Table */}
          <Card>
            <CardHeader>
              <CardTitle>Test Entries</CardTitle>
              <CardDescription>
                Entries stored in your database. You can edit or delete these entries to test database operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No entries found. Create your first entry to test database operations.</p>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of test entries in your database.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.id}</TableCell>
                        <TableCell>{entry.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                        <TableCell>{formatDate(entry.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Entry</DialogTitle>
                                  <DialogDescription>
                                    Make changes to the entry. Click save when you're done.
                                  </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleUpdateEntry}>
                                  <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-title">Title</Label>
                                      <Input
                                        id="edit-title"
                                        value={editEntry?.title || ""}
                                        onChange={(e) =>
                                          setEditEntry(editEntry ? { ...editEntry, title: e.target.value } : null)
                                        }
                                        placeholder="Enter a title"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-description">Description</Label>
                                      <Textarea
                                        id="edit-description"
                                        value={editEntry?.description || ""}
                                        onChange={(e) =>
                                          setEditEntry(editEntry ? { ...editEntry, description: e.target.value } : null)
                                        }
                                        placeholder="Enter a description"
                                        rows={4}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button type="submit">
                                      <Save className="mr-2 h-4 w-4" />
                                      Save Changes
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Statistics
              </CardTitle>
              <CardDescription>Information about your database connection and tables</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !dbStats ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Failed to load database statistics</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Connection Information</h3>
                    <div className="grid gap-2">
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Database Name:</span>
                        <span>{dbStats.connection.database_name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Username:</span>
                        <span>{dbStats.connection.username}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Database Size:</span>
                        <span>{dbStats.size}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">PostgreSQL Version:</span>
                        <span className="text-sm">{dbStats.connection.version.split(",")[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Table Statistics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-primary/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Tables</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{dbStats.counts.table_count}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-primary/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{dbStats.counts.user_count}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-primary/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Login Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{dbStats.counts.login_activity_count}</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Last updated: {new Date(dbStats.timestamp).toLocaleString()}
                    </div>
                    <Button variant="outline" size="sm" onClick={loadDatabaseStats}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Stats
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
