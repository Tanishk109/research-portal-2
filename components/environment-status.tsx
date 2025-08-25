"use client"

import { useState, useEffect } from "react"
import { Database, Server, Info } from "lucide-react"
import { api, endpoints } from "@/lib/api-client"

interface EnvironmentStatusProps {
  showDetails?: boolean
  className?: string
}

export function EnvironmentStatus({ showDetails = false, className = "" }: EnvironmentStatusProps) {
  const [status, setStatus] = useState<{
    loading: boolean
    dbConnected: boolean
    apiConnected: boolean
    environment: string
    isPreview: boolean
    details?: any
  }>({
    loading: true,
    dbConnected: false,
    apiConnected: false,
    environment: "unknown",
    isPreview: false,
  })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get(endpoints.health)

        setStatus({
          loading: false,
          dbConnected: response.success,
          apiConnected: true,
          environment: response.data?.environment?.node_env || "unknown",
          isPreview: response.data?.status === "preview_no_db",
          details: response.data,
        })
      } catch (error) {
        console.error("Status check error:", error)
        setStatus({
          loading: false,
          dbConnected: false,
          apiConnected: false,
          environment: "unknown",
          isPreview: false,
        })
      }
    }

    checkStatus()
  }, [])

  if (status.loading) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
        <span>Checking environment...</span>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {/* API Status */}
        <div
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
            status.apiConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          <Server className="h-3 w-3" />
          <span>API {status.apiConnected ? "Connected" : "Disconnected"}</span>
        </div>

        {/* Database Status */}
        <div
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
            status.isPreview
              ? "bg-blue-100 text-blue-800"
              : status.dbConnected
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          <Database className="h-3 w-3" />
          <span>
            {status.isPreview
              ? "Preview Mode (No DB)"
              : `Database ${status.dbConnected ? "Connected" : "Disconnected"}`}
          </span>
        </div>

        {/* Environment */}
        <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
          <Info className="h-3 w-3" />
          <span>
            {status.environment === "production"
              ? "Production"
              : status.environment === "development"
                ? "Development"
                : "Preview"}
          </span>
        </div>
      </div>

      {showDetails && status.details && (
        <div className="text-xs mt-2 p-2 bg-gray-50 rounded border border-gray-200">
          <div className="font-medium mb-1">Environment Details:</div>
          <pre className="overflow-auto text-xs max-h-32">{JSON.stringify(status.details, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
