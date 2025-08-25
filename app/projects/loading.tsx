import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export default function ProjectsLoading() {
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
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 bg-gray-200" />
            <Skeleton className="h-5 w-96 mt-2 bg-gray-200" />
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Skeleton className="h-10 flex-1 bg-gray-200" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full bg-gray-200" />
              <Skeleton className="h-10 w-full bg-gray-200" />
              <Skeleton className="h-10 w-full bg-gray-200" />
            </div>
          </div>

          <div className="grid gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border rounded-lg p-6 bg-white">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <Skeleton className="h-7 w-64 bg-gray-200" />
                    <div className="flex items-center gap-2 mt-2">
                      <Skeleton className="h-6 w-6 rounded-full bg-gray-200" />
                      <Skeleton className="h-4 w-48 bg-gray-200" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Skeleton className="h-6 w-32 mb-2 bg-gray-200" />
                    <Skeleton className="h-4 w-48 bg-gray-200" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full mb-4 bg-gray-200" />
                <div className="flex flex-wrap gap-2 mb-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-6 w-20 bg-gray-200" />
                  ))}
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-32 bg-gray-200" />
                  <Skeleton className="h-10 w-32 bg-gray-200" />
                </div>
              </div>
            ))}
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
