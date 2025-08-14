'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { OrdersTable } from '@/components/dashboard/orders-table'
import { DueFromSEBTable } from '@/components/dashboard/due-from-seb-table'
import { VehicleStatusTable } from '@/components/dashboard/vehicle-status-table'
import { ProfitAnalysisTable } from '@/components/dashboard/profit-analysis-table'
import { CustomerBalancesTable } from '@/components/dashboard/customer-balances-table'
import { ExpensesTable } from '@/components/dashboard/expenses-table'
import { FinancialsTable } from '@/components/dashboard/financials-table'
import { VendorBalancesTable } from '@/components/dashboard/vendor-balances-table'
import { ViewSwitcher } from '@/components/dashboard/view-switcher'
import { LoadingDashboard } from '@/components/dashboard/loading'
import { FloatingSummary } from '@/components/dashboard/floating-summary'
import { useTransferOrders } from '@/hooks/use-transfer-orders'
import { groupOrdersByOrderNumber } from '@/lib/formatters'
import { AlertCircle, DollarSign, ArrowRightLeft, ShoppingCart, TrendingUp, Users, Receipt, FileText, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const viewGroups = [
  {
    id: 'operations',
    label: 'Operations',
    color: 'blue',
    views: [
      { id: 'orders', label: 'Transfer Orders', icon: <ShoppingCart className="h-4 w-4" /> },
      { id: 'due-from-seb', label: 'Due from SEB', icon: <DollarSign className="h-4 w-4" /> },
      { id: 'vehicles', label: 'SEB Fund Transfers', icon: <ArrowRightLeft className="h-4 w-4" /> },
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    color: 'green',
    views: [
      { id: 'profit', label: 'Profit Analysis', icon: <TrendingUp className="h-4 w-4" /> },
      { id: 'balances', label: 'Customer Balances', icon: <Users className="h-4 w-4" /> },
      { id: 'vendor-balances', label: 'Vendor Balances', icon: <Building2 className="h-4 w-4" /> },
      { id: 'expenses', label: 'Expenses', icon: <Receipt className="h-4 w-4" /> },
      { id: 'financials', label: 'Financials', icon: <FileText className="h-4 w-4" /> },
    ]
  }
]

export default function DashboardPage() {
  const [activeView, setActiveView] = useState('orders')
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useTransferOrders()
  
  const orderGroups = orders ? groupOrdersByOrderNumber(orders) : []
  
  const isLoading = activeView === 'orders' ? ordersLoading : false
  const error = activeView === 'orders' ? ordersError : null

  if (isLoading) {
    return (
      <>
        <DashboardHeader />
        <main className="container mx-auto px-4 py-6">
          <LoadingDashboard />
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <DashboardHeader />
        <main className="container mx-auto px-4 py-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-semibold">Error Loading Data</h3>
              </div>
              <p className="mt-2 text-sm text-red-600">
                {error instanceof Error ? error.message : 'Failed to load transfer orders'}
              </p>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  const renderActiveTable = () => {
    switch (activeView) {
      case 'orders':
        return <OrdersTable orderGroups={orderGroups} />
      case 'due-from-seb':
        return <DueFromSEBTable />
      case 'vehicles':
        return <VehicleStatusTable />
      case 'profit':
        return <ProfitAnalysisTable />
      case 'balances':
        return <CustomerBalancesTable />
      case 'vendor-balances':
        return <VendorBalancesTable />
      case 'expenses':
        return <ExpensesTable />
      case 'financials':
        return <FinancialsTable />
      default:
        return <OrdersTable orderGroups={orderGroups} />
    }
  }

  return (
    <>
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <ViewSwitcher 
              viewGroups={viewGroups}
              activeView={activeView}
              onViewChange={setActiveView}
            />
          </div>
          {renderActiveTable()}
        </div>
      </main>
      <FloatingSummary />
    </>
  )
}