'use client'

import React, { useState, useMemo } from 'react'
import { Search, AlertCircle, TrendingUp, TrendingDown, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useVendorBalances, VendorBalance } from '@/hooks/use-vendor-balances'
import { formatCurrency, formatNumber, formatDate } from '@/lib/formatters'
import { LoadingDashboard } from './loading'

type SortField = 'vendor_name' | 'total_outstanding' | 'current_0_30' | 'past_due_31_60' | 
                  'past_due_61_90' | 'past_due_91_120' | 'past_due_over_120' | 'outstanding_bills_count' | 'oldest_due_date'
type SortDirection = 'asc' | 'desc'

export function VendorBalancesTable() {
  const { data: balances, isLoading, error } = useVendorBalances()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('total_outstanding')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filteredAndSortedBalances = useMemo(() => {
    if (!balances) return []

    let filtered = balances
    if (searchTerm) {
      filtered = balances.filter(balance =>
        balance.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (balance.company_name && balance.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter out vendors with zero balance
    filtered = filtered.filter(balance => balance.total_outstanding > 0)

    return [...filtered].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'vendor_name') {
        aValue = a.vendor_name.toLowerCase()
        bValue = b.vendor_name.toLowerCase()
      } else if (sortField === 'oldest_due_date') {
        aValue = a.oldest_due_date ? new Date(a.oldest_due_date).getTime() : 0
        bValue = b.oldest_due_date ? new Date(b.oldest_due_date).getTime() : 0
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
    
    const activeBalances = balances.filter(b => b.total_outstanding > 0)
    
    return {
      total_outstanding: activeBalances.reduce((sum, b) => sum + b.total_outstanding, 0),
      current_0_30: activeBalances.reduce((sum, b) => sum + b.current_0_30, 0),
      past_due_31_60: activeBalances.reduce((sum, b) => sum + b.past_due_31_60, 0),
      past_due_61_90: activeBalances.reduce((sum, b) => sum + b.past_due_61_90, 0),
      past_due_91_120: activeBalances.reduce((sum, b) => sum + b.past_due_91_120, 0),
      past_due_over_120: activeBalances.reduce((sum, b) => sum + b.past_due_over_120, 0),
      outstanding_bills_count: activeBalances.reduce((sum, b) => sum + b.outstanding_bills_count, 0),
      vendor_count: activeBalances.length
    }
  }, [balances])

  const getAgingColor = (days: string) => {
    switch (days) {
      case 'current': return 'text-green-600'
      case '31-60': return 'text-yellow-600'
      case '61-90': return 'text-orange-600'
      case '91-120': return 'text-red-600'
      case 'over-120': return 'text-red-800'
      default: return ''
    }
  }

  const getRiskBadge = (riskCategory: string) => {
    if (riskCategory === 'High Risk (120+ days)') {
      return <Badge variant="destructive">High Risk</Badge>
    } else if (riskCategory === 'Medium Risk') {
      return <Badge className="bg-orange-500">Medium Risk</Badge>
    } else {
      return <Badge className="bg-green-500">Low Risk</Badge>
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
            <h3 className="font-semibold">Error Loading Vendor Balances</h3>
          </div>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : 'Failed to load vendor balances'}
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
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              SEB Vendor Balances
            </CardTitle>
            <CardDescription>
              {totals?.vendor_count || 0} vendors with outstanding balances • Total payable: {formatCurrency(totals?.total_outstanding || 0)}
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {totals && (
          <div className="grid grid-cols-7 gap-4 p-4 bg-slate-50 border-b">
            <div>
              <p className="text-xs text-muted-foreground">Total Payable</p>
              <p className="text-lg font-bold">{formatCurrency(totals.total_outstanding)}</p>
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
              <p className="text-xs text-muted-foreground">91-120 Days</p>
              <p className={`text-sm font-semibold ${getAgingColor('91-120')}`}>
                {formatCurrency(totals.past_due_91_120)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Over 120 Days</p>
              <p className={`text-sm font-semibold ${getAgingColor('over-120')}`}>
                {formatCurrency(totals.past_due_over_120)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Bills</p>
              <p className="text-sm font-semibold">{formatNumber(totals.outstanding_bills_count)}</p>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('vendor_name')}
                >
                  Vendor Name
                  {sortField === 'vendor_name' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('total_outstanding')}
                >
                  Total Outstanding
                  {sortField === 'total_outstanding' && (
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
                  onClick={() => handleSort('past_due_91_120')}
                >
                  91-120
                  {sortField === 'past_due_91_120' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('past_due_over_120')}
                >
                  120+
                  {sortField === 'past_due_over_120' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('outstanding_bills_count')}
                >
                  Bills
                  {sortField === 'outstanding_bills_count' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('oldest_due_date')}
                >
                  Oldest Due
                  {sortField === 'oldest_due_date' && (
                    sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                  )}
                </TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedBalances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    No outstanding vendor balances found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedBalances.map((balance) => (
                  <TableRow key={balance.vendor_id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{balance.vendor_name}</div>
                        {balance.company_name && (
                          <div className="text-xs text-muted-foreground">{balance.company_name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(balance.total_outstanding)}
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
                    <TableCell className={`text-right ${getAgingColor('91-120')}`}>
                      {balance.past_due_91_120 > 0 ? formatCurrency(balance.past_due_91_120) : '-'}
                    </TableCell>
                    <TableCell className={`text-right ${getAgingColor('over-120')}`}>
                      {balance.past_due_over_120 > 0 ? formatCurrency(balance.past_due_over_120) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{balance.outstanding_bills_count}</Badge>
                    </TableCell>
                    <TableCell>
                      {balance.oldest_due_date ? formatDate(balance.oldest_due_date) : '-'}
                    </TableCell>
                    <TableCell>
                      {getRiskBadge(balance.risk_category)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}