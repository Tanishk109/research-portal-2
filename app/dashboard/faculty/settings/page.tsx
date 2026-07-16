import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"

export default function FacultySettingsPage() {
  return (
    <div className="flex min-h-screen flex-col dashboard-shell">
      <FacultyDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="container mx-auto space-y-6">
        <section className="dashboard-hero rounded-lg p-6 text-white md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">Faculty Settings</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Settings</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 md:text-base">
            Manage account preferences from your profile and security pages.
          </p>
        </section>
        <Card className="dashboard-panel-strong rounded-lg">
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
        </div>
      </main>
    </div>
  )
}
