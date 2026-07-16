import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"

export default function AnalyticsLoading() {
  return (
    <div className="flex min-h-screen flex-col dashboard-shell">
      <FacultyDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="grid gap-6">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>

          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="dashboard-panel rounded-lg">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-20" />
                  </CardContent>
                </Card>
              ))}
          </div>

          <Tabs defaultValue="projects" className="space-y-4">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-lg border border-slate-200 bg-white/90 p-1 shadow-sm md:grid-cols-3">
              <TabsTrigger value="projects" disabled>
                Project Analytics
              </TabsTrigger>
              <TabsTrigger value="applications" disabled>
                Application Analytics
              </TabsTrigger>
              <TabsTrigger value="students" disabled>
                Student Demographics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className={i === 2 ? "dashboard-panel rounded-lg md:col-span-2" : "dashboard-panel rounded-lg"}>
                      <CardHeader>
                        <Skeleton className="h-6 w-48 mb-1" />
                        <Skeleton className="h-4 w-64" />
                      </CardHeader>
                      <CardContent className="h-80">
                        <Skeleton className="h-full w-full" />
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
