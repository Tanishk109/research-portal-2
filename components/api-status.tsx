"use client"

import { useEffect, useState } from "react"
import { api, endpoints } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function ApiStatus() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [details, setDetails] = useState<any>(null)

  const checkApiStatus = async () => {
    setStatus("loading")
    try {
      const response = await api.get(endpoints.health)
      if (response.success) {
        setStatus("online")
        setDetails(response.data)
      } else {
        setStatus("offline")
      }
    } catch (error) {
      setStatus("offline")
    }
    setLastChecked(new Date())
  }

  useEffect(() => {
    checkApiStatus()
    // Check status every 5 minutes
    const interval = setInterval(checkApiStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer" onClick={checkApiStatus}>
            <Badge
              variant="outline"
              className={`
                px-2 py-1 
                ${status === "online" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""} 
                ${status === "offline" ? "bg-red-100 text-red-800 hover:bg-red-200" : ""}
                ${status === "loading" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : ""}
              `}
            >
              {status === "loading" && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
              {status === "online" && <CheckCircle className="h-3 w-3 mr-1" />}
              {status === "offline" && <AlertCircle className="h-3 w-3 mr-1" />}
              API {status === "loading" ? "Checking" : status}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2 p-1">
            <p className="text-sm font-medium">API Status: {status}</p>
            {lastChecked && (
              <p className="text-xs text-muted-foreground">Last checked: {lastChecked.toLocaleTimeString()}</p>
            )}
            {details && status === "online" && (
              <div className="text-xs">
                <p>Database: {details.database.connected ? "Connected" : "Disconnected"}</p>
                <p>DB Name: {details.database.info.database}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Click to refresh</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
