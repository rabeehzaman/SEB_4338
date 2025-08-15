'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardSummary } from '@/hooks/use-dashboard-summary'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Calculator,
  AlertCircle
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function NetBalance() {
  const { data: summary, isLoading, error } = useDashboardSummary()

  const formatCurrency = (amount: number) => {
    return `SAR ${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Loading Detailed Table */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error Loading Net Balance</h3>
          </div>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : 'Failed to load net balance data'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const netBalance = summary?.netBalance ?? 0
  const totalReceivables = summary?.totalReceivables ?? 0
  const transferOrdersTotal = summary?.transferOrdersTotal ?? 0
  const dueFromSEBTotal = summary?.dueFromSEBTotal ?? 0
  const fundTransfersTotal = summary?.fundTransfersTotal ?? 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Balance Card */}
        <Card className={netBalance < 0 ? 'border-red-200' : 'border-green-200'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className={`text-2xl font-bold ${netBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(netBalance)}
              </p>
              {netBalance >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {netBalance < 0 ? 'SEB owes the branch' : 'Branch owes SEB'}
            </p>
          </CardContent>
        </Card>

        {/* Total Receivables Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-green-600" />
              Total Receivables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalReceivables)}
              </p>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Amount to be received
            </p>
          </CardContent>
        </Card>

        {/* Fund Transfers Out Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-orange-600" />
              Fund Transfers Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(fundTransfersTotal)}
              </p>
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Amount transferred out
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Net Balance Calculation</CardTitle>
          <CardDescription>
            Detailed breakdown of receivables and transfers
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Receivables Section */}
              <TableRow className="bg-green-50/50">
                <TableCell className="font-semibold" colSpan={2}>
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    Total Receivables
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-green-600">
                  {formatCurrency(totalReceivables)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-green-100 text-green-700">Inflow</Badge>
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-8">Transfer Orders</TableCell>
                <TableCell className="text-muted-foreground">
                  Pending transfer order amounts
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(transferOrdersTotal)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">Component</Badge>
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-8">Due from SEB</TableCell>
                <TableCell className="text-muted-foreground">
                  Outstanding amounts from SEB
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(dueFromSEBTotal)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">Component</Badge>
                </TableCell>
              </TableRow>

              {/* Transfers Section */}
              <TableRow className="bg-orange-50/50 border-t-2">
                <TableCell className="font-semibold" colSpan={2}>
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4 text-orange-600" />
                    Fund Transfers Out
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-orange-600">
                  ({formatCurrency(fundTransfersTotal)})
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-orange-100 text-orange-700">Outflow</Badge>
                </TableCell>
              </TableRow>

              {/* Net Balance Row */}
              <TableRow className="border-t-2 bg-slate-100">
                <TableCell className="font-bold text-lg" colSpan={2}>
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Net Balance
                  </div>
                </TableCell>
                <TableCell className={`text-right font-bold text-xl ${netBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(netBalance)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={netBalance < 0 ? 'destructive' : 'default'}>
                    {netBalance < 0 ? 'Deficit' : 'Surplus'}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Calculation Summary Card */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg">Calculation Formula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-sm font-medium">Total Receivables</span>
              <span className="text-green-600 font-semibold">
                + {formatCurrency(totalReceivables)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-sm font-medium">Fund Transfers Out</span>
              <span className="text-orange-600 font-semibold">
                - {formatCurrency(fundTransfersTotal)}
              </span>
            </div>
            <div className="border-t-2 border-slate-300 pt-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border-2 border-slate-200">
                <span className="text-base font-bold">Net Balance</span>
                <span className={`text-lg font-bold ${netBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  = {formatCurrency(netBalance)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> A negative net balance indicates that SEB owes money to the branch, 
              while a positive balance indicates the branch owes money to SEB.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}