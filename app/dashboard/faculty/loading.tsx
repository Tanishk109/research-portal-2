import { Skeleton } from "@/components/ui/skeleton"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <FacultyDashboardHeader />
      <main className="flex-1 p-6 md:p-10">
        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Skeleton className="h-8 w-64 bg-gray-200" />
              <Skeleton className="h-4 w-48 mt-2 bg-gray-200" />
            </div>
            <Skeleton className="h-10 w-40 bg-gray-200" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-5 w-32 bg-gray-200" />
                  <Skeleton className="h-4 w-4 bg-gray-200" />
                </div>
                <Skeleton className="h-8 w-16 bg-gray-200" />
                <Skeleton className="h-4 w-24 mt-2 bg-gray-200" />
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4 bg-white">
            <div className="flex mb-6">
              <Skeleton className="h-10 w-32 mr-2 bg-gray-200" />
              <Skeleton className="h-10 w-32 bg-gray-200" />
            </div>
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-48 bg-gray-200" />
              <Skeleton className="h-10 w-64 bg-gray-200" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Skeleton className="h-6 w-48 bg-gray-200" />
                      <Skeleton className="h-4 w-64 mt-2 bg-gray-200" />
                    </div>
                    <Skeleton className="h-6 w-20 bg-gray-200" />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-6 w-16 bg-gray-200" />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32 bg-gray-200" />
                    <Skeleton className="h-4 w-32 bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
