import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/ui/use-toast"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Manipal University Research Portal",
  description: "Connect, Collaborate, and Advance Research at Manipal University Jaipur",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ToastProvider>
          {children}
          <SonnerToaster />
        </ToastProvider>
      </body>
    </html>
  )
}
