"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useEffect, useState } from "react"
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
  LogOut, 
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
    profile_picture_url?: string | null
    profilePictureUrl?: string | null
  }
}

const FacultyDashboardHeader = React.memo(({ user }: FacultyDashboardHeaderProps) => {
  const [open, setOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(user)
  const pathname = usePathname()
  const router = useRouter()
  const displayUser = currentUser || user
  const profileImageUrl = displayUser?.profile_picture_url || displayUser?.profilePictureUrl || ""
  const fallbackInitials = `${displayUser?.first_name?.charAt(0) || ""}${displayUser?.last_name?.charAt(0) || ""}` || "U"

  useEffect(() => {
    setCurrentUser(user)
  }, [user])

  useEffect(() => {
    let cancelled = false

    async function loadCurrentUser() {
      if (user) {
        return
      }

      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        const result = await res.json()
        const nextUser = result?.data?.user

        if (!cancelled && res.ok && result.success && nextUser) {
          setCurrentUser({
            id: nextUser.id,
            first_name: nextUser.firstName,
            last_name: nextUser.lastName,
            email: nextUser.email,
            role: nextUser.role,
            profile_picture_url: nextUser.profilePictureUrl || null,
          })
        }
      } catch (error) {
        console.error("Failed to load header user:", error)
      }
    }

    loadCurrentUser()

    const handleProfilePictureUpdated = (event: Event) => {
      const profilePictureUrl = (event as CustomEvent<string>).detail
      setCurrentUser((prev) => prev ? { ...prev, profile_picture_url: profilePictureUrl } : prev)
    }

    window.addEventListener("profile-picture-updated", handleProfilePictureUpdated)

    return () => {
      cancelled = true
      window.removeEventListener("profile-picture-updated", handleProfilePictureUpdated)
    }
  }, [user])

  useEffect(() => {
    let cancelled = false

    async function enforceProfileCompletion() {
      if (!pathname || !pathname.startsWith("/dashboard/faculty") || pathname.startsWith("/dashboard/faculty/profile")) {
        return
      }

      try {
        const res = await fetch("/api/profile/completion", { cache: "no-store" })
        const result = await res.json()

        if (!cancelled && res.ok && result.role === "faculty" && result.complete === false) {
          const params = new URLSearchParams()
          params.set("completeProfile", "1")
          if (Array.isArray(result.missing) && result.missing.length > 0) {
            params.set("missing", result.missing.slice(0, 6).join(", "))
          }
          router.replace(`/dashboard/faculty/profile?${params.toString()}`)
        }
      } catch (error) {
        console.error("Failed to check faculty profile completion:", error)
      }
    }

    enforceProfileCompletion()

    return () => {
      cancelled = true
    }
  }, [pathname, router])

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
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
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-slate-950/90 text-white shadow-[0_18px_45px_rgba(15,23,42,0.22)] backdrop-blur-xl">
      <div className="container flex h-16 min-w-0 items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 shrink-0 text-white hover:bg-white/10 hover:text-white md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] sm:w-[300px]">
            <SheetTitle className="sr-only">Faculty navigation</SheetTitle>
            <SheetDescription className="sr-only">Main faculty dashboard navigation menu</SheetDescription>
            <div className="flex items-center gap-2 font-bold text-xl mb-8">
              <Image src="/muj.png" alt="Manipal University Jaipur Logo" width={34} height={34} className="h-8 w-auto shrink-0" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-teal-500 to-amber-500">
                Research Portal
              </span>
            </div>
            <nav className="flex flex-col gap-3">
              <Link href="/dashboard/faculty" className="rounded-md px-3 py-2 text-base font-medium hover:bg-slate-100" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <Link href="/dashboard/faculty/projects" className="rounded-md px-3 py-2 text-base font-medium hover:bg-slate-100" onClick={() => setOpen(false)}>
                Projects
              </Link>
              <Link
                href="/dashboard/faculty/applications"
                className="rounded-md px-3 py-2 text-base font-medium hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                Applications
              </Link>
              <Link href="/dashboard/faculty/analytics" className="rounded-md px-3 py-2 text-base font-medium hover:bg-slate-100" onClick={() => setOpen(false)}>
                Analytics
              </Link>
              <Link href="/dashboard/faculty/security" className="rounded-md px-3 py-2 text-base font-medium hover:bg-slate-100" onClick={() => setOpen(false)}>
                Security
              </Link>
              <Link href="/dashboard/faculty/profile" className="rounded-md px-3 py-2 text-base font-medium hover:bg-slate-100" onClick={() => setOpen(false)}>
                Profile
              </Link>
              <Link href="/dashboard/faculty/settings" className="rounded-md px-3 py-2 text-base font-medium hover:bg-slate-100" onClick={() => setOpen(false)}>
                Settings
              </Link>
              <Link href="/logout" className="rounded-md px-3 py-2 text-base font-medium text-red-500 hover:bg-red-50" onClick={() => setOpen(false)}>
                Logout
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="mr-3 flex min-w-0 shrink items-center gap-2 font-bold lg:mr-5">
          <Image src="/muj.png" alt="Manipal University Jaipur Logo" width={28} height={28} className="h-7 w-auto shrink-0" />
          <span className="hidden max-w-[170px] truncate text-sm font-semibold text-white lg:inline xl:max-w-[240px]">
            MUJ Research Portal
          </span>
        </Link>
        <nav className="hidden min-w-0 flex-1 items-center gap-1 text-sm font-medium md:flex lg:gap-2">
          <Link
            href="/dashboard/faculty"
            className={
              isActive("/dashboard/faculty") &&
              !isActive("/dashboard/faculty/projects") &&
              !isActive("/dashboard/faculty/applications") &&
              !isActive("/dashboard/faculty/analytics") &&
              !isActive("/dashboard/faculty/security") &&
              !isActive("/dashboard/faculty/profile") &&
              !isActive("/dashboard/faculty/settings")
                ? "rounded-md bg-white/20 px-2 py-2 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] lg:px-3"
                : "rounded-md px-2 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:px-3"
            }
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/faculty/projects"
            className={
              isActive("/dashboard/faculty/projects")
                ? "rounded-md bg-white/20 px-2 py-2 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] lg:px-3"
                : "rounded-md px-2 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:px-3"
            }
          >
            Projects
          </Link>
          <Link
            href="/dashboard/faculty/applications"
            className={
              isActive("/dashboard/faculty/applications")
                ? "rounded-md bg-white/20 px-2 py-2 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] lg:px-3"
                : "rounded-md px-2 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:px-3"
            }
          >
            Applications
          </Link>
          <Link
            href="/dashboard/faculty/analytics"
            className={
              isActive("/dashboard/faculty/analytics")
                ? "rounded-md bg-white/20 px-2 py-2 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] lg:px-3"
                : "rounded-md px-2 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:px-3"
            }
          >
            Analytics
          </Link>
          <Link
            href="/dashboard/faculty/security"
            className={
              isActive("/dashboard/faculty/security")
                ? "rounded-md bg-white/20 px-2 py-2 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] lg:px-3"
                : "rounded-md px-2 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:px-3"
            }
          >
            Security
          </Link>
          <Link
            href="/dashboard/faculty/profile"
            className={
              isActive("/dashboard/faculty/profile")
                ? "rounded-md bg-white/20 px-2 py-2 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] lg:px-3"
                : "rounded-md px-2 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:px-3"
            }
          >
            Profile
          </Link>
        </nav>
        <div className="flex items-center gap-4 ml-auto">
          <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-white/10">
                <Avatar className="h-9 w-9 border border-white/30 shadow-md">
                  <AvatarImage src={profileImageUrl} alt={displayUser?.first_name || "User"} />
                  <AvatarFallback>
                    {fallbackInitials}
            </AvatarFallback>
          </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {displayUser?.first_name} {displayUser?.last_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayUser?.email}
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
