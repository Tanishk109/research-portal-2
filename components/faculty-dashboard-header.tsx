"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  User, 
  Settings, 
  LogOut, 
  BookOpen, 
  Users, 
  TrendingUp,
  Shield
} from "lucide-react"
import { useRouter } from "next/navigation"

interface FacultyDashboardHeaderProps {
  user?: {
    id: string
    first_name: string
    last_name: string
    email: string
    role: string
  }
}

const FacultyDashboardHeader = React.memo(({ user }: FacultyDashboardHeaderProps) => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        router.push("/login")
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-primary-600 to-accent-600 text-white">
      <div className="container flex h-16 items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-white">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex items-center gap-2 font-bold text-xl mb-8">
              <Image src="/muj.png" alt="Manipal University Jaipur Logo" width={40} height={40} />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-accent-500">
                Research Portal
              </span>
            </div>
            <nav className="flex flex-col gap-4">
              <Link href="/dashboard/faculty" className="text-lg font-medium" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <Link href="/dashboard/faculty/projects" className="text-lg font-medium" onClick={() => setOpen(false)}>
                Projects
              </Link>
              <Link
                href="/dashboard/faculty/applications"
                className="text-lg font-medium"
                onClick={() => setOpen(false)}
              >
                Applications
              </Link>
              <Link href="/dashboard/faculty/analytics" className="text-lg font-medium" onClick={() => setOpen(false)}>
                Analytics
              </Link>
              <Link href="/dashboard/faculty/security" className="text-lg font-medium" onClick={() => setOpen(false)}>
                Security
              </Link>
              <Link href="/dashboard/faculty/profile" className="text-lg font-medium" onClick={() => setOpen(false)}>
                Profile
              </Link>
              <Link href="/dashboard/faculty/settings" className="text-lg font-medium" onClick={() => setOpen(false)}>
                Settings
              </Link>
              <Link href="/logout" className="text-lg font-medium text-red-400" onClick={() => setOpen(false)}>
                Logout
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-8">
          <Image src="/muj.png" alt="Manipal University Jaipur Logo" width={30} height={30} />
          <span className="text-white">Manipal University Jaipur</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium flex-1">
          <Link
            href="/dashboard/faculty"
            className={
              isActive("/dashboard/faculty") &&
              !isActive("/dashboard/faculty/projects") &&
              !isActive("/dashboard/faculty/applications") &&
              !isActive("/dashboard/faculty/analytics") &&
              !isActive("/dashboard/faculty/security")
                ? "font-bold text-white"
                : "text-white/80 hover:text-white transition-colors"
            }
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/faculty/projects"
            className={
              isActive("/dashboard/faculty/projects")
                ? "font-bold text-white"
                : "text-white/80 hover:text-white transition-colors"
            }
          >
            Projects
          </Link>
          <Link
            href="/dashboard/faculty/applications"
            className={
              isActive("/dashboard/faculty/applications")
                ? "font-bold text-white"
                : "text-white/80 hover:text-white transition-colors"
            }
          >
            Applications
          </Link>
          <Link
            href="/dashboard/faculty/analytics"
            className={
              isActive("/dashboard/faculty/analytics")
                ? "font-bold text-white"
                : "text-white/80 hover:text-white transition-colors"
            }
          >
            Analytics
          </Link>
          <Link
            href="/dashboard/faculty/security"
            className={
              isActive("/dashboard/faculty/security")
                ? "font-bold text-white"
                : "text-white/80 hover:text-white transition-colors"
            }
          >
            Security
          </Link>
          <Link
            href="/dashboard/faculty/profile"
            className={
              isActive("/dashboard/faculty/profile")
                ? "font-bold text-white"
                : "text-white/80 hover:text-white transition-colors"
            }
          >
            Profile
          </Link>
        </nav>
        <div className="flex items-center gap-4 ml-auto">
          <Button variant="ghost" size="icon" className="relative text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-secondary-500 animate-pulse"></span>
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt={user?.first_name} />
                  <AvatarFallback>
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/faculty/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/faculty/security" className="flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Security</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
})

FacultyDashboardHeader.displayName = "FacultyDashboardHeader"

export default FacultyDashboardHeader
