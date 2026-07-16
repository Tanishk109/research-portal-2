import Link from "next/link"
import { AdminNav } from "@/components/admin-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminActivityPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="md:w-64">
          <AdminNav />
        </aside>
        <main className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Login activity is available from each account security view.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/api-test">Query Activity APIs</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
