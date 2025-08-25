// This is a simplified version of the toast component
"use client"

import type React from "react"

import { useState, createContext, useContext } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type ToastContextType = {
  toast: (props: ToastProps) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([])
  const [counter, setCounter] = useState(0)

  const toast = (props: ToastProps) => {
    const id = counter
    setCounter((prev) => prev + 1)
    setToasts((prev) => [...prev, { ...props, id }])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-md w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "p-4 rounded-md shadow-md border flex items-start gap-3",
              t.variant === "destructive" ? "bg-red-50 border-red-200" : "bg-white border-gray-200",
            )}
          >
            <div className="flex-1">
              {t.title && (
                <h3
                  className={cn("font-medium text-sm", t.variant === "destructive" ? "text-red-800" : "text-gray-900")}
                >
                  {t.title}
                </h3>
              )}
              {t.description && (
                <p className={cn("text-sm mt-1", t.variant === "destructive" ? "text-red-700" : "text-gray-700")}>
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className={cn(
                "text-sm p-1 rounded-full",
                t.variant === "destructive" ? "text-red-700 hover:bg-red-100" : "text-gray-500 hover:bg-gray-100",
              )}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const toast = (props: ToastProps) => {
  if (typeof window !== "undefined") {
    // Create a custom event to trigger the toast
    const event = new CustomEvent("toast", { detail: props })
    window.dispatchEvent(event)
  }
}
