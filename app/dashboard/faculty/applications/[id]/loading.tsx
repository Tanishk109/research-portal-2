import { Skeleton } from "@/components/ui/skeleton"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"

export default function ApplicationDetailsLoading() {
  return (
    <div className="flex min-h-screen flex-col dashboard-shell">
      <FacultyDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="mb-6">
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="grid gap-6">
          <Skeleton className="h-10 w-3/4" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40 md:col-span-2" />
          </div>
          <Skeleton className="h-60" />
          <Skeleton className="h-40" />
        </div>
      </main>
    </div>
  )
}
