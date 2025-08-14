import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function LoadingDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-7 w-[180px]" />
              <Skeleton className="h-4 w-[250px] mt-2" />
            </div>
            <Skeleton className="h-9 w-[120px]" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 bg-slate-50 border-b">
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4"><Skeleton className="h-4 w-4" /></th>
                  <th className="p-4"><Skeleton className="h-4 w-24" /></th>
                  <th className="p-4"><Skeleton className="h-4 w-20" /></th>
                  <th className="p-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="p-4"><Skeleton className="h-4 w-20" /></th>
                  <th className="p-4"><Skeleton className="h-4 w-24" /></th>
                  <th className="p-4"><Skeleton className="h-4 w-28" /></th>
                  <th className="p-4"><Skeleton className="h-4 w-16" /></th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4"><Skeleton className="h-6 w-6" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="p-4"><Skeleton className="h-5 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-28" /></td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function LoadingTableRow() {
  return (
    <tr className="border-b animate-pulse">
      <td className="p-4"><Skeleton className="h-6 w-6" /></td>
      <td className="p-4"><Skeleton className="h-5 w-32" /></td>
      <td className="p-4"><Skeleton className="h-5 w-24" /></td>
      <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
      <td className="p-4"><Skeleton className="h-5 w-16" /></td>
      <td className="p-4"><Skeleton className="h-5 w-24" /></td>
      <td className="p-4"><Skeleton className="h-5 w-28" /></td>
      <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
    </tr>
  )
}

export function LoadingSummaryCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}