'use client'

import React, { useState, useMemo } from 'react'
import { Search, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCustomerBalances, CustomerBalance } from '@/hooks/use-customer-balances'
import { formatCurrency, formatNumber, formatDate } from '@/lib/formatters'
import { LoadingDashboard } from './loading'

type SortField = 'customer_name' | 'total_balance' | 'current_0_30' | 'past_due_31_60' | 
                  'past_due_61_90' | 'past_due_91_180' | 'past_due_over_180' | 'total_invoices' | 'last_invoice_date'
type SortDirection = 'asc' | 'desc'

export function CustomerBalancesTable() {
  const { data: balances, isLoading, error } = useCustomerBalances()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('total_balance')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filteredAndSortedBalances = useMemo(() => {
    if (!balances) return []

    let filtered = balances
    if (searchTerm) {
      filtered = balances.filter(balance =>
        balance.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (balance.display_name && balance.display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (balance.company_name && balance.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    return [...filtered].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'customer_name') {
        aValue = a.customer_name.toLowerCase()
        bValue = b.customer_name.toLowerCase()
      } else if (sortField === 'last_invoice_date') {
        aValue = a.last_invoice_date ? new Date(a.last_invoice_date).getTime() : 0
        bValue = b.last_invoice_date ? new Date(b.last_invoice_date).getTime() : 0
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [balances, searchTerm, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const totals = useMemo(() => {
    if (!balances || balances.length === 0) return null
    
    return {
      total_balance: balances.reduce((sum, b) => sum + b.total_balance, 0),
      current_0_30: balances.reduce((sum, b) => sum + b.current_0_30, 0),
      past_due_31_60: balances.reduce((sum, b) => sum + b.past_due_31_60, 0),
      past_due_61_90: balances.reduce((sum, b) => sum + b.past_due_61_90, 0),
      past_due_91_180: balances.reduce((sum, b) => sum + b.past_due_91_180, 0),
      past_due_over_180: balances.reduce((sum, b) => sum + b.past_due_over_180, 0),
      total_invoices: balances.reduce((sum, b) => sum + b.total_invoices, 0),
    }
  }, [balances])

  const getAgingColor = (days: string) => {
    switch (days) {
      case 'current': return 'text-green-600'
      case '31-60': return 'text-yellow-600'
      case '61-90': return 'text-orange-600'
      case '91-180': return 'text-red-600'
      case 'over-180': return 'text-red-800'
      default: return ''
    }
  }

  const getRiskBadge = (balance: CustomerBalance) => {
    if (balance.past_due_over_180 > 0) {
      return <Badge variant="destructive">Very High Risk</Badge>
    } else if (balance.past_due_91_180 > 0) {
      return <Badge variant="destructive">High Risk</Badge>
    } else if (balance.past_due_61_90 > 0) {
      return <Badge className="bg-orange-500">Medium Risk</Badge>
    } else if (balance.past_due_31_60 > 0) {
      return <Badge className="bg-yellow-500">Low Risk</Badge>
    } else {
      return <Badge className="bg-green-500">Current</Badge>
    }
  }

  if (isLoading) {
    return <LoadingDashboard />
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error Loading Customer Balances</h3>
          </div>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : 'Failed to load customer balances'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Customer Balances - Shibili S Man</CardTitle>
            <CardDescription>
              {balances?.length || 0} customers with outstanding balances
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {totals && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 p-4 bg-slate-50 border-b overflow-x-auto">
            <div>
              <p className="text-xs text-muted-foreground">Total Outstanding</p>
              <p className="text-lg font-bold">{formatCurrency(totals.total_balance)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current (0-30)</p>
              <p className={`text-sm font-semibold ${getAgingColor('current')}`}>
                {formatCurrency(totals.current_0_30)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">31-60 Days</p>
              <p className={`text-sm font-semibold ${getAgingColor('31-60')}`}>
                {formatCurrency(totals.past_due_31_60)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">61-90 Days</p>
              <p className={`text-sm font-semibold ${getAgingColor('61-90')}`}>
                {formatCurrency(totals.past_due_61_90)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">91-180 Days</p>
              <p className={`text-sm font-semibold ${getAgingColor('91-180')}`}>
                {formatCurrency(totals.past_due_91_180)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Over 180 Days</p>
              <p className={`text-sm font-semibold ${getAgingColor('over-180')}`}>
                {formatCurrency(totals.past_due_over_180)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Invoices</p>
              <p className="text-sm font-semibold">{formatNumber(totals.total_invoices)}</p>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('customer_name')}
                >
                  Customer Name
                  {sortField === 'customer_name' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('total_balance')}
                >
                  Total Balance
                  {sortField === 'total_balance' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('current_0_30')}
                >
                  Current
                  {sortField === 'current_0_30' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('past_due_31_60')}
                >
                  31-60
                  {sortField === 'past_due_31_60' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('past_due_61_90')}
                >
                  61-90
                  {sortField === 'past_due_61_90' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('past_due_91_180')}
                >
                  91-180
                  {sortField === 'past_due_91_180' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('past_due_over_180')}
                >
                  180+
                  {sortField === 'past_due_over_180' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('total_invoices')}
                >
                  Invoices
                  {sortField === 'total_invoices' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('last_invoice_date')}
                >
                  Last Invoice
                  {sortField === 'last_invoice_date' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedBalances.map((balance) => (
                <TableRow key={balance.customer_id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{balance.customer_name}</div>
                      {balance.company_name && (
                        <div className="text-xs text-muted-foreground">{balance.company_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-bold">{formatCurrency(balance.total_balance)}</div>
                      <Progress 
                        value={balance.total_balance} 
                        max={Math.max(...filteredAndSortedBalances.map(b => b.total_balance))}
                        className="mt-1 h-1.5"
                        indicatorClassName={
                          balance.past_due_over_180 > 0 ? "bg-red-600" :
                          balance.past_due_91_180 > 0 ? "bg-orange-600" :
                          balance.past_due_61_90 > 0 ? "bg-yellow-600" :
                          "bg-green-600"
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className={`text-right ${getAgingColor('current')}`}>
                    {balance.current_0_30 > 0 ? formatCurrency(balance.current_0_30) : '-'}
                  </TableCell>
                  <TableCell className={`text-right ${getAgingColor('31-60')}`}>
                    {balance.past_due_31_60 > 0 ? formatCurrency(balance.past_due_31_60) : '-'}
                  </TableCell>
                  <TableCell className={`text-right ${getAgingColor('61-90')}`}>
                    {balance.past_due_61_90 > 0 ? formatCurrency(balance.past_due_61_90) : '-'}
                  </TableCell>
                  <TableCell className={`text-right ${getAgingColor('91-180')}`}>
                    {balance.past_due_91_180 > 0 ? formatCurrency(balance.past_due_91_180) : '-'}
                  </TableCell>
                  <TableCell className={`text-right ${getAgingColor('over-180')}`}>
                    {balance.past_due_over_180 > 0 ? formatCurrency(balance.past_due_over_180) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{balance.total_invoices}</Badge>
                  </TableCell>
                  <TableCell>
                    {balance.last_invoice_date ? formatDate(balance.last_invoice_date) : '-'}
                  </TableCell>
                  <TableCell>
                    {getRiskBadge(balance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}