import Link from "next/link"
import { AdminNav } from "@/components/admin-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminProjectsPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="md:w-64">
          <AdminNav />
        </aside>
        <main className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Review public project listings or create projects from the faculty dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild>
                <Link href="/projects">Browse Projects</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/faculty/projects/new">New Project</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
