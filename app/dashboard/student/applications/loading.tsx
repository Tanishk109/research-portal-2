import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import StudentDashboardHeader from "@/components/student-dashboard-header"

export default function ApplicationsLoading() {
  return (
    <div className="flex min-h-screen flex-col dashboard-shell">
      <StudentDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="grid gap-6">
          <div>
            <Skeleton className="h-10 w-[250px] mb-2" />
            <Skeleton className="h-4 w-[350px]" />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Skeleton className="h-10 w-full md:w-[400px]" />
            <Skeleton className="h-10 w-full md:w-[200px]" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
