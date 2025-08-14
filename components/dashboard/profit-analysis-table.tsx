'use client'

import React, { useState, useEffect } from 'react'
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

  const handleDateRangeChange = (from: Date | undefined, to: Date | undefined) => {
    setFromDate(from)
    setToDate(to)
  }

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
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profit Analysis - SEB Vehicle</CardTitle>
              <CardDescription>
                {profitGroups.length} invoices with detailed profit margins | Click invoice to view item details
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
            >
              {expandedInvoices.size === profitGroups.length ? (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Expand All
                </>
              )}
            </Button>
          </div>
          <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Invoice No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Sale</TableHead>
                <TableHead className="text-right">Sale w/VAT</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Total Row */}
              <TableRow className="bg-slate-100 font-bold">
                <TableCell></TableCell>
                <TableCell>TOTAL</TableCell>
                <TableCell></TableCell>
                <TableCell>
                  <Badge variant="default">{profitGroups.length} invoices</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">
                    {profitGroups.reduce((sum, g) => sum + g.itemCount, 0)} items
                  </Badge>
                </TableCell>
                <TableCell className={`text-right ${getValueColor(totalQty)}`}>
                  {formatNumber(totalQty)}
                </TableCell>
                <TableCell className={`text-right ${getValueColor(totalSale)}`}>
                  {formatCurrency(totalSale)}
                </TableCell>
                <TableCell className={`text-right ${getValueColor(totalSaleWithVat)}`}>
                  {formatCurrency(totalSaleWithVat)}
                </TableCell>
                <TableCell className={`text-right ${getValueColor(totalCost)}`}>
                  {formatCurrency(totalCost)}
                </TableCell>
                <TableCell className={`text-right font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="flex items-center justify-end gap-1">
                    {totalProfit >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {formatCurrency(totalProfit)}
                  </div>
                </TableCell>
                <TableCell className={`text-right font-bold ${overallProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className={isCredit ? 'text-orange-600' : 'text-blue-600'}>
                            {group.invoiceNumber}
                          </span>
                          {isCredit && <Badge variant="outline" className="text-xs">Credit</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(group.date)}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="truncate font-medium">{group.customerName}</div>
                          <div className="text-xs text-muted-foreground">{group.salesPerson}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{group.itemCount} items</Badge>
                      </TableCell>
                      <TableCell className={`text-right ${getValueColor(group.totalQty)}`}>
                        {formatNumber(group.totalQty)}
                      </TableCell>
                      <TableCell className={`text-right ${getValueColor(group.totalSale)}`}>
                        {formatCurrency(group.totalSale)}
                      </TableCell>
                      <TableCell className={`text-right ${getValueColor(group.totalSaleWithVat)}`}>
                        {formatCurrency(group.totalSaleWithVat)}
                      </TableCell>
                      <TableCell className={`text-right ${getValueColor(group.totalCost)}`}>
                        {formatCurrency(group.totalCost)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${group.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {group.totalProfit >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatCurrency(group.totalProfit)}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-bold ${group.avgProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {group.avgProfitMargin.toFixed(2)}%
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={11} className="bg-muted/30 p-0">
                          <div className="pl-12 pr-4 py-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">Item Name</TableHead>
                                  <TableHead className="text-xs text-right">Qty</TableHead>
                                  <TableHead className="text-xs text-right">Unit Price</TableHead>
                                  <TableHead className="text-xs text-right">Sale Price</TableHead>
                                  <TableHead className="text-xs text-right">Sale w/VAT</TableHead>
                                  <TableHead className="text-xs text-right">Unit Cost</TableHead>
                                  <TableHead className="text-xs text-right">Total Cost</TableHead>
                                  <TableHead className="text-xs text-right">Profit</TableHead>
                                  <TableHead className="text-xs text-right">Margin %</TableHead>
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
  )
}