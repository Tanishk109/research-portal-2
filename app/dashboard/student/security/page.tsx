import type { Metadata } from "next"
import StudentDashboardHeader from "@/components/student-dashboard-header"
import LoginActivityTable from "@/components/login-activity-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, KeyRound } from "lucide-react"

export const metadata: Metadata = {
  title: "Account Security | Student Dashboard",
  description: "Manage your account security and review login activity",
}

export default function StudentSecurityPage() {
  return (
    <div className="flex min-h-screen flex-col dashboard-shell">
      <StudentDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="container mx-auto grid gap-6">
          <section className="dashboard-hero rounded-lg p-6 text-white md:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">Student Security</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Account Security</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 md:text-base">
              Manage account protection and review recent access from the same student workspace.
            </p>
          </section>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="dashboard-panel dashboard-lift rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Status</CardTitle>
                <Shield className="h-4 w-4 text-[#0c2461]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Secure</div>
                <p className="text-xs text-muted-foreground">Last checked: Today</p>
              </CardContent>
            </Card>
            <Card className="dashboard-panel dashboard-lift rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Password Status</CardTitle>
                <Lock className="h-4 w-4 text-[#e1b12c]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#e1b12c]">Good</div>
                <p className="text-xs text-muted-foreground">Last changed: 30 days ago</p>
              </CardContent>
            </Card>
            <Card className="dashboard-panel dashboard-lift rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <KeyRound className="h-4 w-4 text-[#4a69bd]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#4a69bd]">1</div>
                <p className="text-xs text-muted-foreground">Current device only</p>
              </CardContent>
            </Card>
          </div>

          <LoginActivityTable />
        </div>
      </main>
    </div>
  )
}
