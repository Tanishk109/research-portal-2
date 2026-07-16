import Link from "next/link"
import { AdminNav } from "@/components/admin-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminSettingsPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="md:w-64">
          <AdminNav />
        </aside>
        <main className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Check deployment, environment, and database configuration.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild>
                <Link href="/admin/database-connection">Database</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/database-health">Health</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
