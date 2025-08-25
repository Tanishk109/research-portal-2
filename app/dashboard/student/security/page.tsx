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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <StudentDashboardHeader />
      <main className="flex-1 p-6 md:p-10">
        <div className="grid gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0c2461]">Account Security</h1>
            <p className="text-muted-foreground">Manage your account security and review login activity</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-t-4 border-t-[#0c2461]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Status</CardTitle>
                <Shield className="h-4 w-4 text-[#0c2461]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Secure</div>
                <p className="text-xs text-muted-foreground">Last checked: Today</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#e1b12c]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Password Status</CardTitle>
                <Lock className="h-4 w-4 text-[#e1b12c]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#e1b12c]">Good</div>
                <p className="text-xs text-muted-foreground">Last changed: 30 days ago</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#4a69bd]">
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
