'use client'

import React, { useState, useMemo } from 'react'
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSEBFinancials, FinancialSummary } from '@/hooks/use-seb-financials'
import { formatCurrency, formatNumber } from '@/lib/formatters'
import { LoadingDashboard } from './loading'

export function FinancialsTable() {
  const { data, isLoading, error } = useSEBFinancials()
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  const monthlyData = data?.monthlyData || []
  const metrics = data?.metrics

  const availableMonths = useMemo(() => {
    return monthlyData.map(m => m.month)
  }, [monthlyData])

  const selectedData = useMemo(() => {
    if (selectedMonth === 'all') {
      // Calculate totals for all months
      return {
        month: 'All Time',
        total_sales: metrics?.totalRevenue || 0,
        total_sales_with_vat: monthlyData.reduce((sum, m) => sum + m.total_sales_with_vat, 0),
        cost_of_goods_sold: metrics?.totalCOGS || 0,
        gross_profit: metrics?.totalGrossProfit || 0,
        operating_expenses: metrics?.totalExpenses || 0,
        net_profit: metrics?.totalNetProfit || 0,
        gross_profit_margin: metrics?.avgGrossMargin || 0,
        net_profit_margin: metrics?.avgNetMargin || 0,
        expense_ratio: metrics?.totalRevenue ? (metrics.totalExpenses / metrics.totalRevenue) * 100 : 0,
        invoice_count: monthlyData.reduce((sum, m) => sum + m.invoice_count, 0),
        expense_count: monthlyData.reduce((sum, m) => sum + m.expense_count, 0)
      }
    } else if (selectedMonth === 'ytd') {
      // Year to date
      const currentYear = new Date().getFullYear()
      const ytdMonths = monthlyData.filter(m => m.month.startsWith(currentYear.toString()))
      const ytdRevenue = ytdMonths.reduce((sum, m) => sum + m.total_sales, 0)
      const ytdCOGS = ytdMonths.reduce((sum, m) => sum + m.cost_of_goods_sold, 0)
      const ytdGrossProfit = ytdMonths.reduce((sum, m) => sum + m.gross_profit, 0)
      const ytdExpenses = ytdMonths.reduce((sum, m) => sum + m.operating_expenses, 0)
      const ytdNetProfit = ytdMonths.reduce((sum, m) => sum + m.net_profit, 0)
      
      return {
        month: `Year ${currentYear}`,
        total_sales: ytdRevenue,
        total_sales_with_vat: ytdMonths.reduce((sum, m) => sum + m.total_sales_with_vat, 0),
        cost_of_goods_sold: ytdCOGS,
        gross_profit: ytdGrossProfit,
        operating_expenses: ytdExpenses,
        net_profit: ytdNetProfit,
        gross_profit_margin: ytdRevenue > 0 ? (ytdGrossProfit / ytdRevenue) * 100 : 0,
        net_profit_margin: ytdRevenue > 0 ? (ytdNetProfit / ytdRevenue) * 100 : 0,
        expense_ratio: ytdRevenue > 0 ? (ytdExpenses / ytdRevenue) * 100 : 0,
        invoice_count: ytdMonths.reduce((sum, m) => sum + m.invoice_count, 0),
        expense_count: ytdMonths.reduce((sum, m) => sum + m.expense_count, 0)
      }
    } else {
      const monthData = monthlyData.find(m => m.month === selectedMonth)
      if (monthData) {
        return monthData
      }
      return null
    }
  }, [selectedMonth, monthlyData, metrics])

  const getMarginColor = (margin: number) => {
    if (margin >= 15) return 'text-green-600'
    if (margin >= 8) return 'text-blue-600'
    if (margin >= 0) return 'text-orange-600'
    return 'text-red-600'
  }

  const getMarginBadge = (margin: number) => {
    if (margin >= 15) return <Badge className="bg-green-500">Excellent</Badge>
    if (margin >= 8) return <Badge className="bg-blue-500">Good</Badge>
    if (margin >= 0) return <Badge className="bg-orange-500">Low</Badge>
    return <Badge variant="destructive">Loss</Badge>
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
            <h3 className="font-semibold">Error Loading Financial Data</h3>
          </div>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : 'Failed to load financial data'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                YTD Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{formatCurrency(metrics.yearToDate.revenue)}</p>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Before VAT
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                YTD Gross Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{formatCurrency(metrics.yearToDate.grossProfit)}</p>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className={`text-xs mt-1 ${getMarginColor(metrics.yearToDate.revenue ? (metrics.yearToDate.grossProfit / metrics.yearToDate.revenue) * 100 : 0)}`}>
                {metrics.yearToDate.revenue ? ((metrics.yearToDate.grossProfit / metrics.yearToDate.revenue) * 100).toFixed(1) : 0}% margin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                YTD Net Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className={`text-2xl font-bold ${metrics.yearToDate.netProfit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(metrics.yearToDate.netProfit)}
                </p>
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className={`text-xs mt-1 ${getMarginColor(metrics.yearToDate.revenue ? (metrics.yearToDate.netProfit / metrics.yearToDate.revenue) * 100 : 0)}`}>
                {metrics.yearToDate.revenue ? ((metrics.yearToDate.netProfit / metrics.yearToDate.revenue) * 100).toFixed(1) : 0}% margin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className={`text-2xl font-bold ${(metrics.currentMonth?.net_profit || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(metrics.currentMonth?.net_profit || 0)}
                </p>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1 mt-1">
                {metrics.currentMonth && metrics.previousMonth && (
                  <>
                    {metrics.currentMonth.net_profit > metrics.previousMonth.net_profit ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${metrics.currentMonth.net_profit > metrics.previousMonth.net_profit ? 'text-green-500' : 'text-red-500'}`}>
                      vs {formatCurrency(metrics.previousMonth.net_profit)}
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* P&L Statement */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>
                SEB Vehicle Branch Financial Performance
              </CardDescription>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 text-sm border rounded-md"
            >
              <option value="all">All Time</option>
              <option value="ytd">Year to Date</option>
              <optgroup label="Monthly">
                {availableMonths.map(month => (
                  <option key={month} value={month}>
                    {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {selectedData && (
            <div className="p-6 space-y-6">
              {/* P&L Table */}
              <Table>
                <TableBody>
                  <TableRow className="border-t-2 border-b-2">
                    <TableCell className="font-semibold text-lg">Revenue</TableCell>
                    <TableCell className="text-right"></TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {formatCurrency(selectedData.total_sales)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Sales (before VAT)</TableCell>
                    <TableCell className="text-right">{formatCurrency(selectedData.total_sales)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">Sales (with VAT)</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(selectedData.total_sales_with_vat)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  
                  <TableRow className="border-t">
                    <TableCell className="font-semibold">Cost of Goods Sold</TableCell>
                    <TableCell className="text-right text-red-600">
                      ({formatCurrency(selectedData.cost_of_goods_sold)})
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      ({formatCurrency(selectedData.cost_of_goods_sold)})
                    </TableCell>
                  </TableRow>
                  
                  <TableRow className="border-t-2 bg-muted/30">
                    <TableCell className="font-semibold text-lg">Gross Profit</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        {selectedData.gross_profit_margin.toFixed(1)}% margin
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-bold text-lg ${getMarginColor(selectedData.gross_profit_margin)}`}>
                      {formatCurrency(selectedData.gross_profit)}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow className="border-t">
                    <TableCell className="font-semibold">Operating Expenses</TableCell>
                    <TableCell className="text-right text-red-600">
                      ({formatCurrency(selectedData.operating_expenses)})
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      ({formatCurrency(selectedData.operating_expenses)})
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8 text-sm text-muted-foreground">
                      {selectedData.expense_count} expense transactions
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {selectedData.expense_ratio.toFixed(1)}% of revenue
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  
                  <TableRow className="border-t-2 border-b-2 bg-muted/50">
                    <TableCell className="font-bold text-xl">Net Profit</TableCell>
                    <TableCell className="text-right">
                      {getMarginBadge(selectedData.net_profit_margin)}
                    </TableCell>
                    <TableCell className={`text-right font-bold text-xl ${selectedData.net_profit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(selectedData.net_profit)}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="text-sm text-muted-foreground">Net Profit Margin</TableCell>
                    <TableCell></TableCell>
                    <TableCell className={`text-right font-semibold ${getMarginColor(selectedData.net_profit_margin)}`}>
                      {selectedData.net_profit_margin.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Monthly Trend Table - Always visible */}
              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-4">Monthly Performance Trend</h3>
                <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                          <TableHead className="text-right">COGS</TableHead>
                          <TableHead className="text-right">Gross Profit</TableHead>
                          <TableHead className="text-right">Expenses</TableHead>
                          <TableHead className="text-right">Net Profit</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthlyData.slice(0, 6).map((month) => (
                          <TableRow key={month.month}>
                            <TableCell>
                              {new Date(month.month + '-01').toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short' 
                              })}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(month.total_sales)}</TableCell>
                            <TableCell className="text-right text-red-600">
                              {formatCurrency(month.cost_of_goods_sold)}
                            </TableCell>
                            <TableCell className={`text-right ${getMarginColor(month.gross_profit_margin)}`}>
                              {formatCurrency(month.gross_profit)}
                            </TableCell>
                            <TableCell className="text-right text-red-600">
                              {formatCurrency(month.operating_expenses)}
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${month.net_profit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(month.net_profit)}
                            </TableCell>
                            <TableCell className="text-center">
                              {getMarginBadge(month.net_profit_margin)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}