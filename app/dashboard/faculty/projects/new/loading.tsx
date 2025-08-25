import { Skeleton } from "@/components/ui/skeleton"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <FacultyDashboardHeader />
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 bg-gray-200" />
            <Skeleton className="h-4 w-96 mt-2 bg-gray-200" />
          </div>

          <div className="border rounded-lg bg-white">
            <div className="p-6 border-b">
              <Skeleton className="h-6 w-32 mb-2 bg-gray-200" />
              <Skeleton className="h-4 w-64 bg-gray-200" />
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-200" />
                <Skeleton className="h-10 w-full bg-gray-200" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-36 bg-gray-200" />
                <Skeleton className="h-32 w-full bg-gray-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 bg-gray-200" />
                  <Skeleton className="h-10 w-full bg-gray-200" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36 bg-gray-200" />
                  <Skeleton className="h-10 w-full bg-gray-200" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-48 bg-gray-200" />
                <Skeleton className="h-10 w-full bg-gray-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-gray-200" />
                  <Skeleton className="h-10 w-full bg-gray-200" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36 bg-gray-200" />
                  <Skeleton className="h-10 w-full bg-gray-200" />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-b">
              <Skeleton className="h-6 w-32 mb-2 bg-gray-200" />
              <Skeleton className="h-4 w-64 bg-gray-200" />
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 bg-gray-200" />
                <Skeleton className="h-10 w-full bg-gray-200" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-36 bg-gray-200" />
                <Skeleton className="h-24 w-full bg-gray-200" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-28 bg-gray-200" />
                <Skeleton className="h-24 w-full bg-gray-200" />
              </div>
            </div>

            <div className="p-6 border-t flex justify-between">
              <Skeleton className="h-10 w-24 bg-gray-200" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32 bg-gray-200" />
                <Skeleton className="h-10 w-32 bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
