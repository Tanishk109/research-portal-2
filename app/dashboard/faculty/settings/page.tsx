import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"

export default function FacultySettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <FacultyDashboardHeader />
      <main className="container mx-auto flex-1 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage account preferences from the dedicated profile and security pages.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/dashboard/faculty/profile">Profile</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/faculty/security">Security</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
