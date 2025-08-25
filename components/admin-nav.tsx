"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Database, Server, Home, Settings, Users, FileText, Activity, LayoutDashboard } from "lucide-react"

export function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      title: "Database Connection",
      href: "/admin/database-connection",
      icon: <Database className="mr-2 h-4 w-4" />,
    },
    {
      title: "API Test",
      href: "/api-test",
      icon: <Server className="mr-2 h-4 w-4" />,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Projects",
      href: "/admin/projects",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Activity Logs",
      href: "/admin/activity",
      icon: <Activity className="mr-2 h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
    {
      title: "Back to Home",
      href: "/",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <div className="space-y-1">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={cn("w-full justify-start", pathname === item.href && "bg-muted")}
          asChild
        >
          <Link href={item.href}>
            {item.icon}
            {item.title}
          </Link>
        </Button>
      ))}
    </div>
  )
}
