"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    async function logout() {
      await fetch("/api/auth/logout", { method: "POST" })
      router.replace("/login")
    }

    logout()
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing you out...</p>
    </main>
  )
}
