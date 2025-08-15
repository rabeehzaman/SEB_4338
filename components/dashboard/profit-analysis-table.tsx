'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProfitAnalysisGroup } from '@/lib/types'
import { formatCurrency, formatNumber, formatDate, getValueColor } from '@/lib/formatters'
import { DateRangeFilter } from './date-range-filter'
import { useProfitAnalysis, groupProfitByInvoice } from '@/hooks/use-profit-analysis'

interface ProfitAnalysisTableProps {
  initialGroups?: ProfitAnalysisGroup[]
}

export function ProfitAnalysisTable({ initialGroups }: ProfitAnalysisTableProps) {
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set())
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()
  
  // Fetch data with date filter
  const { data: profitData, isLoading, error } = useProfitAnalysis(fromDate, toDate)
  const profitGroups = profitData ? groupProfitByInvoice(profitData) : (initialGroups || [])

  const toggleInvoice = (invoiceNumber: string) => {
    const newExpanded = new Set(expandedInvoices)
    if (newExpanded.has(invoiceNumber)) {
      newExpanded.delete(invoiceNumber)
    } else {
      newExpanded.add(invoiceNumber)
    }
    setExpandedInvoices(newExpanded)
  }

  const toggleAll = () => {
    if (expandedInvoices.size === profitGroups.length) {
      setExpandedInvoices(new Set())
    } else {
      setExpandedInvoices(new Set(profitGroups.map(g => g.invoiceNumber)))
    }
  }

  const handleDateRangeChange = useCallback((from: Date | undefined, to: Date | undefined) => {
    setFromDate(from)
    setToDate(to)
  }, [])

  const totalSale = profitGroups.reduce((sum, g) => sum + g.totalSale, 0)
  const totalSaleWithVat = profitGroups.reduce((sum, g) => sum + g.totalSaleWithVat, 0)
  const totalCost = profitGroups.reduce((sum, g) => sum + g.totalCost, 0)
  const totalProfit = profitGroups.reduce((sum, g) => sum + g.totalProfit, 0)
  const totalQty = profitGroups.reduce((sum, g) => sum + g.totalQty, 0)
  const overallProfitMargin = totalSale !== 0 ? (totalProfit / Math.abs(totalSale)) * 100 : 0

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profit Analysis - SEB Vehicle</CardTitle>
          <CardDescription>Loading profit analysis data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profit Analysis - SEB Vehicle</CardTitle>
          <CardDescription>Error loading profit analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">{error.message}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Date Filter Section - Outside the card for better visibility */}
      <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm relative z-10">
        <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
      </div>
      
      {/* Main Card */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg">Profit Analysis - SEB Vehicle</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                {profitGroups.length} invoices with detailed profit margins <span className="hidden sm:inline">| Click invoice to view item details</span>
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
              className="h-8 px-2 sm:px-3"
            >
              {expandedInvoices.size === profitGroups.length ? (
                <>
                  <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="ml-1.5 hidden sm:inline">Collapse All</span>
                </>
              ) : (
                <>
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="ml-1.5 hidden sm:inline">Expand All</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px] sm:w-[40px]"></TableHead>
                <TableHead className="text-xs sm:text-sm">Invoice No</TableHead>
                <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Customer</TableHead>
                <TableHead className="text-center text-xs sm:text-sm hidden md:table-cell">Items</TableHead>
                <TableHead className="text-right text-xs sm:text-sm hidden sm:table-cell">Qty</TableHead>
                <TableHead className="text-right text-xs sm:text-sm hidden md:table-cell">Sale</TableHead>
                <TableHead className="text-right text-xs sm:text-sm hidden lg:table-cell">Sale w/VAT</TableHead>
                <TableHead className="text-right text-xs sm:text-sm hidden md:table-cell">Cost</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Profit</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Total Row */}
              <TableRow className="bg-slate-100 font-bold">
                <TableCell></TableCell>
                <TableCell className="text-xs sm:text-sm">TOTAL</TableCell>
                <TableCell className="hidden sm:table-cell"></TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="default" className="text-xs">{profitGroups.length} invoices</Badge>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  <Badge variant="secondary" className="text-xs">
                    {profitGroups.reduce((sum, g) => sum + g.itemCount, 0)} items
                  </Badge>
                </TableCell>
                <TableCell className={`text-right text-xs sm:text-sm hidden sm:table-cell ${getValueColor(totalQty)}`}>
                  {formatNumber(totalQty)}
                </TableCell>
                <TableCell className={`text-right text-xs sm:text-sm hidden md:table-cell ${getValueColor(totalSale)}`}>
                  {formatCurrency(totalSale)}
                </TableCell>
                <TableCell className={`text-right text-xs sm:text-sm hidden lg:table-cell ${getValueColor(totalSaleWithVat)}`}>
                  {formatCurrency(totalSaleWithVat)}
                </TableCell>
                <TableCell className={`text-right text-xs sm:text-sm hidden md:table-cell ${getValueColor(totalCost)}`}>
                  {formatCurrency(totalCost)}
                </TableCell>
                <TableCell className={`text-right font-bold text-xs sm:text-sm ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="flex items-center justify-end gap-1">
                    {totalProfit >= 0 ? (
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    <span className="text-xs sm:text-sm">{formatCurrency(totalProfit)}</span>
                  </div>
                </TableCell>
                <TableCell className={`text-right font-bold text-xs sm:text-sm ${overallProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overallProfitMargin.toFixed(2)}%
                </TableCell>
              </TableRow>

              {/* Invoice Rows */}
              {profitGroups.map((group) => {
                const isExpanded = expandedInvoices.has(group.invoiceNumber)
                const isCredit = group.invoiceNumber.startsWith('CN-')
                
                return (
                  <React.Fragment key={group.invoiceNumber}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleInvoice(group.invoiceNumber)}
                    >
                      <TableCell className="p-1 sm:p-2">
                        <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6">
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className={`${isCredit ? 'text-orange-600' : 'text-blue-600'} text-xs sm:text-sm`}>
                            {group.invoiceNumber}
                          </span>
                          {isCredit && <Badge variant="outline" className="text-[10px] sm:text-xs hidden sm:inline">Credit</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{formatDate(group.date)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="max-w-[200px]">
                          <div className="truncate font-medium text-xs sm:text-sm">{group.customerName}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">{group.salesPerson}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        <Badge variant="secondary" className="text-xs">{group.itemCount} items</Badge>
                      </TableCell>
                      <TableCell className={`text-right text-xs sm:text-sm hidden sm:table-cell ${getValueColor(group.totalQty)}`}>
                        {formatNumber(group.totalQty)}
                      </TableCell>
                      <TableCell className={`text-right text-xs sm:text-sm hidden md:table-cell ${getValueColor(group.totalSale)}`}>
                        {formatCurrency(group.totalSale)}
                      </TableCell>
                      <TableCell className={`text-right text-xs sm:text-sm hidden lg:table-cell ${getValueColor(group.totalSaleWithVat)}`}>
                        {formatCurrency(group.totalSaleWithVat)}
                      </TableCell>
                      <TableCell className={`text-right text-xs sm:text-sm hidden md:table-cell ${getValueColor(group.totalCost)}`}>
                        {formatCurrency(group.totalCost)}
                      </TableCell>
                      <TableCell className={`text-right font-medium text-xs sm:text-sm ${group.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {group.totalProfit >= 0 ? (
                            <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          ) : (
                            <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          )}
                          <span className="text-xs sm:text-sm">{formatCurrency(group.totalProfit)}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-bold text-xs sm:text-sm ${group.avgProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {group.avgProfitMargin.toFixed(2)}%
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={11} className="bg-muted/30 p-0">
                          <div className="pl-6 sm:pl-12 pr-2 sm:pr-4 py-2 sm:py-4 overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-[10px] sm:text-xs">Item Name</TableHead>
                                  <TableHead className="text-[10px] sm:text-xs text-right">Qty</TableHead>
                                  <TableHead className="text-[10px] sm:text-xs text-right hidden sm:table-cell">Unit Price</TableHead>
                                  <TableHead className="text-[10px] sm:text-xs text-right hidden md:table-cell">Sale Price</TableHead>
                                  <TableHead className="text-[10px] sm:text-xs text-right hidden lg:table-cell">Sale w/VAT</TableHead>
                                  <TableHead className="text-[10px] sm:text-xs text-right hidden sm:table-cell">Unit Cost</TableHead>
                                  <TableHead className="text-[10px] sm:text-xs text-right hidden md:table-cell">Total Cost</TableHead>
                                  <TableHead className="text-[10px] sm:text-xs text-right">Profit</TableHead>
                                  <TableHead className="text-[10px] sm:text-xs text-right">Margin %</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.items.map((item, idx) => (
                                  <TableRow key={`${group.invoiceNumber}-${idx}`}>
                                    <TableCell className="text-xs">
                                      <div className="flex items-center gap-2">
                                        <Package className="h-3 w-3 text-muted-foreground" />
                                        <span className="max-w-[200px] truncate">{item.item}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className={`text-xs text-right ${getValueColor(item.qty)}`}>
                                      {formatNumber(item.qty)}
                                    </TableCell>
                                    <TableCell className={`text-xs text-right ${getValueColor(item.unit_price)}`}>
                                      {formatCurrency(item.unit_price)}
                                    </TableCell>
                                    <TableCell className={`text-xs text-right ${getValueColor(item.sale_price)}`}>
                                      {formatCurrency(item.sale_price)}
                                    </TableCell>
                                    <TableCell className={`text-xs text-right ${getValueColor(item.sale_with_vat)}`}>
                                      {formatCurrency(item.sale_with_vat)}
                                    </TableCell>
                                    <TableCell className={`text-xs text-right ${getValueColor(item.unit_cost)}`}>
                                      {formatCurrency(item.unit_cost)}
                                    </TableCell>
                                    <TableCell className={`text-xs text-right ${getValueColor(item.cost)}`}>
                                      {formatCurrency(item.cost)}
                                    </TableCell>
                                    <TableCell className={`text-xs text-right font-medium ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatCurrency(item.profit)}
                                    </TableCell>
                                    <TableCell className={`text-xs text-right font-medium ${item.profit_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {item.profit_percentage.toFixed(2)}%
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}