import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export default function ProjectDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-5 w-5" />
            <span>Research Portal</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/projects" className="font-medium">
              Projects
            </Link>
            <Link href="/faculty" className="text-muted-foreground hover:text-foreground transition-colors">
              Faculty
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-10">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Skeleton className="h-6 w-32 mb-4 bg-gray-200" />
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <Skeleton className="h-10 w-64 bg-gray-200" />
                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="h-6 w-32 bg-gray-200" />
                  <Skeleton className="h-6 w-48 bg-gray-200" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 bg-gray-200" />
                <Skeleton className="h-10 w-32 bg-gray-200" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div className="border rounded-lg p-6 bg-white">
                <Skeleton className="h-7 w-48 mb-4 bg-gray-200" />
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full bg-gray-200" />
                  <div className="flex flex-wrap gap-2 pt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-6 w-20 bg-gray-200" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6 bg-white">
                <Skeleton className="h-7 w-48 mb-4 bg-gray-200" />
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full bg-gray-200" />
                  <Skeleton className="h-16 w-full bg-gray-200" />
                  <Skeleton className="h-16 w-full bg-gray-200" />
                </div>
              </div>

              <div className="border rounded-lg p-6 bg-white">
                <Skeleton className="h-7 w-48 mb-4 bg-gray-200" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Skeleton className="h-5 w-5 mt-0.5 bg-gray-200" />
                      <Skeleton className="h-5 w-full bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-6 bg-white">
                <Skeleton className="h-7 w-48 mb-4 bg-gray-200" />
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-5 w-32 mb-1 bg-gray-200" />
                    <Skeleton className="h-5 w-16 bg-gray-200" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-32 mb-1 bg-gray-200" />
                    <Skeleton className="h-5 w-64 bg-gray-200" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-32 mb-1 bg-gray-200" />
                    <Skeleton className="h-5 w-full bg-gray-200" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border rounded-lg p-6 bg-white">
                <Skeleton className="h-7 w-48 mb-4 bg-gray-200" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 bg-gray-200" />
                      <div>
                        <Skeleton className="h-4 w-32 bg-gray-200" />
                        <Skeleton className="h-4 w-48 mt-1 bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Skeleton className="h-10 w-full bg-gray-200" />
                </div>
              </div>

              <div className="border rounded-lg p-6 bg-white">
                <Skeleton className="h-7 w-48 mb-4 bg-gray-200" />
                <div className="flex flex-col items-center text-center">
                  <Skeleton className="h-24 w-24 rounded-full mb-4 bg-gray-200" />
                  <Skeleton className="h-6 w-48 bg-gray-200" />
                  <Skeleton className="h-4 w-32 mt-1 bg-gray-200" />
                  <Skeleton className="h-4 w-64 mt-1 bg-gray-200" />
                </div>
                <Skeleton className="h-px w-full my-4 bg-gray-200" />
                <Skeleton className="h-16 w-full bg-gray-200" />
                <div className="mt-4">
                  <Skeleton className="h-10 w-full bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <Skeleton className="h-4 w-64 bg-gray-200" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16 bg-gray-200" />
            <Skeleton className="h-4 w-16 bg-gray-200" />
            <Skeleton className="h-4 w-16 bg-gray-200" />
          </div>
        </div>
      </footer>
    </div>
  )
}
