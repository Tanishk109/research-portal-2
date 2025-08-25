"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ShieldAlert, Smartphone, Laptop, Tablet, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getRecentLoginActivity } from "@/app/actions/activity"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface RecentLoginActivityProps {
  userRole: "student" | "faculty"
}

export default function RecentLoginActivity({ userRole }: RecentLoginActivityProps) {
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true)
      try {
        const result = await getRecentLoginActivity(5)
        if (result.success) {
          setActivities(result.activities)
        }
      } catch (error) {
        console.error("Error fetching recent login activity:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      case "desktop":
        return <Laptop className="h-4 w-4" />
      default:
        return <Laptop className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Login Activity</CardTitle>
        <CardDescription>Monitor your recent account access</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No login activity found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">{getDeviceIcon(activity.device_type)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      {activity.success ? (
                        <Badge className="bg-green-500 text-white flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Successful
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{activity.ip_address}</span>
                    </div>
                    <p className="text-sm mt-1">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link
          href={`/dashboard/${userRole}/security`}
          className="text-sm text-primary flex items-center gap-1 hover:underline"
        >
          View all login activity
          <ExternalLink className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  )
}
