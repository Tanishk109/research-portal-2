import { Skeleton } from "@/components/ui/skeleton"
import StudentDashboardHeader from "@/components/student-dashboard-header"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <StudentDashboardHeader />
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <Skeleton className="h-8 w-48 bg-gray-200" />
              <Skeleton className="h-4 w-64 mt-2 bg-gray-200" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-36 bg-gray-200" />
              <Skeleton className="h-2 w-32 bg-gray-200" />
              <Skeleton className="h-4 w-8 bg-gray-200" />
            </div>
          </div>

          <div className="border rounded-lg bg-white mb-6">
            <div className="flex p-4 border-b">
              {["Personal Info", "CV & Resume", "Certificates", "Skills"].map((tab, i) => (
                <Skeleton key={i} className="h-10 w-28 mx-1 bg-gray-200" />
              ))}
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-24 w-24 rounded-full bg-gray-200" />
                  <Skeleton className="h-8 w-28 mt-2 bg-gray-200" />
                </div>
                <div className="flex-1 grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-gray-200" />
                      <Skeleton className="h-10 w-full bg-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-gray-200" />
                      <Skeleton className="h-10 w-full bg-gray-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12 bg-gray-200" />
                    <Skeleton className="h-10 w-full bg-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36 bg-gray-200" />
                    <Skeleton className="h-10 w-full bg-gray-200" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-gray-200" />
                  <Skeleton className="h-10 w-full bg-gray-200" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-gray-200" />
                  <Skeleton className="h-10 w-full bg-gray-200" />
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <Skeleton className="h-4 w-8 bg-gray-200" />
                <Skeleton className="h-32 w-full bg-gray-200" />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end">
              <Skeleton className="h-10 w-32 bg-gray-200" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
