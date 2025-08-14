import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { DashboardSummary } from '@/lib/types'

interface SummaryCardsProps {
  summary: DashboardSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalOrders}</div>
          <p className="text-xs text-muted-foreground">Total transfer orders</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
          <p className="text-xs text-muted-foreground">Including VAT</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inbound (to SEB)</CardTitle>
          <ArrowDownToLine className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.inboundValue)}
          </div>
          <p className="text-xs text-muted-foreground">Incoming inventory</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outbound (to Main)</CardTitle>
          <ArrowUpFromLine className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(Math.abs(summary.outboundValue))}
          </div>
          <p className="text-xs text-muted-foreground">Outgoing inventory</p>
        </CardContent>
      </Card>
    </div>
  )
}