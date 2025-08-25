"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">API Documentation</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Login Activity</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>
                The Research Portal API provides endpoints for managing users, login activity, and more.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Base URL</h3>
              <code className="block bg-muted p-2 rounded-md">https://your-domain.com/api</code>

              <h3 className="text-lg font-medium">Response Format</h3>
              <p>All API responses follow this standard format:</p>
              <pre className="bg-muted p-2 rounded-md overflow-auto">
                {`{
  "success": boolean,
  "message": string,
  "data": object (optional),
  "error": string (optional),
  "timestamp": string (ISO date)
}`}
              </pre>

              <h3 className="text-lg font-medium">Authentication</h3>
              <p>Most API endpoints require authentication. See the Authentication tab for details.</p>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>API Version</AlertTitle>
                <AlertDescription>
                  This is API version 1.0. All endpoints are subject to change in future versions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Endpoints for user authentication and session management.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Login</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Endpoint</p>
                    <code className="block bg-muted p-2 rounded-md">POST /api/auth/login</code>
                  </div>
                  <div>
                    <p className="font-medium">Authentication</p>
                    <p>None</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium">Request Body</p>
                  <pre className="bg-muted p-2 rounded-md overflow-auto">
                    {`{
  "email": string,
  "password": string
}`}
                  </pre>
                </div>

                <div>
                  <p className="font-medium">Response</p>
                  <pre className="bg-muted p-2 rounded-md overflow-auto">
                    {`{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": number,
      "role": string,
      "email": string,
      "name": string
    }
  },
  "timestamp": string
}`}
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Logout</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Endpoint</p>
                    <code className="block bg-muted p-2 rounded-md">POST /api/auth/logout</code>
                  </div>
                  <div>
                    <p className="font-medium">Authentication</p>
                    <p>Required</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium">Response</p>
                  <pre className="bg-muted p-2 rounded-md overflow-auto">
                    {`{
  "success": true,
  "message": "Logout successful",
  "timestamp": string
}`}
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Get Current User</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Endpoint</p>
                    <code className="block bg-muted p-2 rounded-md">GET /api/auth/me</code>
                  </div>
                  <div>
                    <p className="font-medium">Authentication</p>
                    <p>Required</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium">Response</p>
                  <pre className="bg-muted p-2 rounded-md overflow-auto">
                    {`{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": number,
      "role": string,
      "first_name": string,
      "last_name": string,
      "email": string,
      "created_at": string,
      "updated_at": string
    },
    "profile": {
      // Role-specific profile fields
    }
  },
  "timestamp": string
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Users API</CardTitle>
              <CardDescription>Endpoints for managing users.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Get All Users</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Endpoint</p>
                    <code className="block bg-muted p-2 rounded-md">GET /api/users</code>
                  </div>
                  <div>
                    <p className="font-medium">Authentication</p>
                    <p>Required</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium">Query Parameters</p>
                  <ul className="list-disc pl-5">
                    <li>
                      <code>role</code> - Filter by role (faculty, student)
                    </li>
                    <li>
                      <code>limit</code> - Number of results per page (default: 100)
                    </li>
                    <li>
                      <code>offset</code> - Pagination offset (default: 0)
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium">Response</p>
                  <pre className="bg-muted p-2 rounded-md overflow-auto">
                    {`{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": number,
        "role": string,
        "first_name": string,
        "last_name": string,
        "email": string,
        "created_at": string,
        "updated_at": string
      }
    ],
    "pagination": {
      "total": number,
      "limit": number,
      "offset": number
    }
  },
  "timestamp": string
}`}
                  </pre>
                </div>
              </div>

              {/* Additional user endpoints would be documented here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Login Activity API</CardTitle>
              <CardDescription>Endpoints for retrieving login activity data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Get All Login Activity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Endpoint</p>
                    <code className="block bg-muted p-2 rounded-md">GET /api/login-activity</code>
                  </div>
                  <div>
                    <p className="font-medium">Authentication</p>
                    <p>Required</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium">Query Parameters</p>
                  <ul className="list-disc pl-5">
                    <li>
                      <code>userId</code> - Filter by user ID
                    </li>
                    <li>
                      <code>success</code> - Filter by success status (true, false)
                    </li>
                    <li>
                      <code>limit</code> - Number of results per page (default: 100)
                    </li>
                    <li>
                      <code>offset</code> - Pagination offset (default: 0)
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium">Response</p>
                  <pre className="bg-muted p-2 rounded-md overflow-auto">
                    {`{
  "success": true,
  "message": "Login activity retrieved successfully",
  "data": {
    "activities": [
      {
        "id": number,
        "user_id": number,
        "timestamp": string,
        "ip_address": string,
        "user_agent": string,
        "success": boolean,
        "location": string,
        "device_type": string,
        "first_name": string,
        "last_name": string,
        "email": string,
        "role": string
      }
    ],
    "pagination": {
      "total": number,
      "limit": number,
      "offset": number
    }
  },
  "timestamp": string
}`}
                  </pre>
                </div>
              </div>

              {/* Additional login activity endpoints would be documented here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health API</CardTitle>
              <CardDescription>Endpoints for checking system health.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Health Check</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Endpoint</p>
                    <code className="block bg-muted p-2 rounded-md">GET /api/health</code>
                  </div>
                  <div>
                    <p className="font-medium">Authentication</p>
                    <p>None</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium">Response</p>
                  <pre className="bg-muted p-2 rounded-md overflow-auto">
                    {`{
  "success": true,
  "message": "Health check successful",
  "data": {
    "status": "healthy",
    "database": {
      "connected": boolean,
      "info": {
        "database": string,
        "user": string,
        "version": string
      }
    },
    "timestamp": string
  },
  "timestamp": string
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
