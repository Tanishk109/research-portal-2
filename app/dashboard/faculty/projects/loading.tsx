import { Skeleton } from "@/components/ui/skeleton"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"

export default function FacultyProjectsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <FacultyDashboardHeader />
      <main className="flex-1 p-6 md:p-10">
        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-full md:w-[180px]" />
          </div>

          <div className="grid gap-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}
