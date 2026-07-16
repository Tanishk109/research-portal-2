import Link from "next/link"
import { AdminNav } from "@/components/admin-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminUsersPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="md:w-64">
          <AdminNav />
        </aside>
        <main className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Use the API test client or student admin endpoint to inspect user records.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild>
                <Link href="/api-test">Open API Test</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/database-operations">Database Operations</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
