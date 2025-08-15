'use client'

import React, { useState, useMemo } from 'react'
import { Search, AlertCircle, TrendingUp, TrendingDown, DollarSign, Calendar, Hash, BarChart3 } from 'lucide-react'
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
import { useSEBExpenses, SEBExpense } from '@/hooks/use-seb-expenses'
import { formatCurrency, formatNumber, formatDate } from '@/lib/formatters'
import { LoadingDashboard } from './loading'

type SortField = 'expense_date' | 'account_name' | 'description' | 'amount'
type SortDirection = 'asc' | 'desc'

export function ExpensesTable() {
  const { data, isLoading, error } = useSEBExpenses()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('expense_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // Set current month as default
  const getCurrentMonth = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }
  
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth())

  const expenses = data?.expenses || []
  const summary = data?.summary

  const availableMonths = useMemo(() => {
    if (!summary?.monthlyExpenses) return []
    return Object.keys(summary.monthlyExpenses).sort().reverse()
  }, [summary])

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        (expense.full_description && expense.full_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (expense.account_name && expense.account_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (expense.reference_number && expense.reference_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (expense.reference_no && expense.reference_no.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by month
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(expense => expense.year_month === selectedMonth)
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'expense_date') {
        aValue = a.expense_date ? new Date(a.expense_date).getTime() : 0
        bValue = b.expense_date ? new Date(b.expense_date).getTime() : 0
      } else if (sortField === 'account_name' || sortField === 'description') {
        aValue = (aValue || '').toLowerCase()
        bValue = (bValue || '').toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [expenses, searchTerm, selectedMonth, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getAccountColor = (accountName: string | null) => {
    if (!accountName) return ''
    const lowerName = accountName.toLowerCase()
    if (lowerName.includes('salary') || lowerName.includes('loan')) return 'text-blue-600'
    if (lowerName.includes('food') || lowerName.includes('expense')) return 'text-orange-600'
    if (lowerName.includes('pos')) return 'text-purple-600'
    if (lowerName.includes('telephone') || lowerName.includes('phone')) return 'text-green-600'
    if (lowerName.includes('vat') || lowerName.includes('tax')) return 'text-red-600'
    return 'text-gray-600'
  }

  const getAmountBadge = (amount: number) => {
    if (amount >= 1000) return <Badge variant="destructive">High</Badge>
    if (amount >= 500) return <Badge className="bg-orange-500">Medium</Badge>
    if (amount >= 100) return <Badge className="bg-yellow-500">Low</Badge>
    return <Badge className="bg-green-500">Minimal</Badge>
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
            <h3 className="font-semibold">Error Loading Expenses</h3>
          </div>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : 'Failed to load expenses'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const filteredTotal = filteredAndSortedExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1 sm:pt-2">
              <div className="flex items-center justify-between">
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hidden sm:block" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.expenseCount} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Current Month
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1 sm:pt-2">
              <div className="flex items-center justify-between">
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(summary.currentMonthTotal)}</p>
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hidden sm:block" />
              </div>
              <div className="flex items-center gap-1 mt-1">
                {summary.monthlyChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-red-500" />
                ) : summary.monthlyChange < 0 ? (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                ) : null}
                <span className={`text-xs ${summary.monthlyChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {summary.monthlyChange > 0 ? '+' : ''}{summary.monthlyChange.toFixed(1)}%
                  <span className="hidden sm:inline"> vs last month</span>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Daily Average
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1 sm:pt-2">
              <div className="flex items-center justify-between">
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(summary.dailyAverage)}</p>
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hidden sm:block" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per active day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Largest Expense
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1 sm:pt-2">
              <div className="flex items-center justify-between">
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(summary.largestExpense)}</p>
                <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hidden sm:block" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Single transaction
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expenses Table */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg">SEB Vehicle Expenses</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                {filteredAndSortedExpenses.length} expenses 
                {selectedMonth !== 'all' && ` for ${selectedMonth}`}
                {searchTerm && ` matching "${searchTerm}"`}
                <span className="block sm:inline">{' '}• Total: {formatCurrency(filteredTotal)}</span>
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border rounded-md"
              >
                <option value="all">All Months</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>
                    {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </option>
                ))}
              </select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2 sm:top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 sm:pl-8 h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-xs sm:text-sm"
                    onClick={() => handleSort('expense_date')}
                  >
                    Date
                    {sortField === 'expense_date' && (
                      sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-xs sm:text-sm hidden sm:table-cell"
                    onClick={() => handleSort('account_name')}
                  >
                    Account
                    {sortField === 'account_name' && (
                      sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-xs sm:text-sm"
                    onClick={() => handleSort('description')}
                  >
                    Description
                    {sortField === 'description' && (
                      sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50 text-xs sm:text-sm"
                    onClick={() => handleSort('amount')}
                  >
                    Amount
                    {sortField === 'amount' && (
                      sortDirection === 'asc' ? <TrendingUp className="inline ml-1 h-3 w-3" /> : <TrendingDown className="inline ml-1 h-3 w-3" />
                    )}
                  </TableHead>
                  <TableHead className="text-center hidden lg:table-cell">Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No expenses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-xs sm:text-sm">
                        {expense.expense_date ? formatDate(expense.expense_date) : 
                         expense.original_date || '-'}
                      </TableCell>
                      <TableCell className={`${getAccountColor(expense.account_name)} text-xs sm:text-sm hidden sm:table-cell`}>
                        {expense.account_name || 'Uncategorized'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="max-w-[200px] sm:max-w-md">
                          <p className="truncate">{expense.full_description}</p>
                          {expense.reference_no && (
                            <p className="text-xs text-muted-foreground hidden sm:block">Ref: {expense.reference_no}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs sm:text-sm">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className="text-center hidden lg:table-cell">
                        {getAmountBadge(expense.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}