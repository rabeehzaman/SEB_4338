'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Package, ShoppingCart, Download } from 'lucide-react'
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
import { EmptyState } from '@/components/ui/empty-state'
import { OrderGroup } from '@/lib/types'
import { formatCurrency, formatNumber, formatDate, getValueColor } from '@/lib/formatters'
import { exportToCSV } from '@/lib/export-utils'

interface OrdersTableProps {
  orderGroups: OrderGroup[]
}

export function OrdersTable({ orderGroups }: OrdersTableProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  const toggleOrder = (orderNumber: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderNumber)) {
      newExpanded.delete(orderNumber)
    } else {
      newExpanded.add(orderNumber)
    }
    setExpandedOrders(newExpanded)
  }

  const toggleAll = () => {
    if (expandedOrders.size === orderGroups.length) {
      setExpandedOrders(new Set())
    } else {
      setExpandedOrders(new Set(orderGroups.map(g => g.orderNumber)))
    }
  }

  const handleExport = () => {
    const exportData = orderGroups.flatMap(group => 
      group.items.map(item => ({
        'Order Number': group.orderNumber,
        'Date': group.date,
        'Item Name': item.item_name,
        'Quantity': item.qty,
        'Cost': item.cost,
        'Cost w/VAT': item.costwvat,
        'Total': item.total,
        'Total w/VAT': item.totalwvat,
      }))
    )
    exportToCSV(exportData, 'transfer_orders')
  }

  if (orderGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transfer Orders</CardTitle>
          <CardDescription>
            Manage warehouse transfer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={ShoppingCart}
            title="No transfer orders yet"
            description="Transfer orders will appear here once they are created. Start by creating your first transfer order."
            actionLabel="Create Transfer Order"
            onAction={() => console.log('Create order clicked')}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg">Transfer Orders</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              {orderGroups.length} orders with items <span className="hidden sm:inline">| Click order to view details</span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              title="Export to CSV"
              className="h-8 px-2 sm:px-3"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="ml-1.5 hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
              className="h-8 px-2 sm:px-3"
            >
              {expandedOrders.size === orderGroups.length ? (
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
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Sticky Total Row */}
        <div className="sticky top-0 z-10 bg-white border-b-2 border-slate-200">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm font-semibold text-slate-600">SUMMARY</span>
                <Badge variant="default" className="text-xs">{orderGroups.length} orders</Badge>
              </div>
              <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                <div className="text-right">
                  <span className="text-[10px] sm:text-xs text-slate-500 block">Total Qty</span>
                  <p className={`font-bold text-xs sm:text-sm ${getValueColor(orderGroups.reduce((sum, g) => sum + g.totalQty, 0))}`}>
                    {formatNumber(orderGroups.reduce((sum, g) => sum + g.totalQty, 0))}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-slate-500 block">Total (excl. VAT)</span>
                  <p className={`font-bold ${getValueColor(orderGroups.reduce((sum, g) => sum + (g.totalValue / 1.15), 0))}`}>
                    {formatCurrency(orderGroups.reduce((sum, g) => sum + (g.totalValue / 1.15), 0))}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] sm:text-xs text-slate-500 block">Total (incl. VAT)</span>
                  <p className={`font-bold text-sm sm:text-lg ${getValueColor(orderGroups.reduce((sum, g) => sum + g.totalValue, 0))}`}>
                    {formatCurrency(orderGroups.reduce((sum, g) => sum + g.totalValue, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px] sm:w-[40px]">
                  <span className="sr-only">Expand/Collapse</span>
                </TableHead>
                <TableHead className="text-xs sm:text-sm">Order Number</TableHead>
                <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-center text-xs sm:text-sm hidden lg:table-cell">Items</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Qty</TableHead>
                <TableHead className="text-right text-xs sm:text-sm hidden md:table-cell">Total</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Total w/VAT</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Order Rows */}
              {orderGroups.map((group) => {
                const isExpanded = expandedOrders.has(group.orderNumber)
                const totalWithoutVat = group.totalValue / 1.15
                return (
                  <React.Fragment key={group.orderNumber}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50 transition-colors duration-150"
                      onClick={() => toggleOrder(group.orderNumber)}
                    >
                      <TableCell className="p-1 sm:p-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 sm:h-6 sm:w-6"
                          aria-label={isExpanded ? `Collapse order ${group.orderNumber}` : `Expand order ${group.orderNumber}`}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                        {group.orderNumber}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{formatDate(group.date)}</TableCell>
                      <TableCell className="text-center hidden lg:table-cell">
                        <Badge variant="secondary" className="text-xs">{group.itemCount} items</Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium text-xs sm:text-sm ${getValueColor(group.totalQty)}`}>
                        {formatNumber(group.totalQty)}
                      </TableCell>
                      <TableCell className={`text-right text-xs sm:text-sm hidden md:table-cell ${getValueColor(totalWithoutVat)}`}>
                        {formatCurrency(totalWithoutVat)}
                      </TableCell>
                      <TableCell className={`text-right font-bold text-xs sm:text-sm ${getValueColor(group.totalValue)}`}>
                        {formatCurrency(group.totalValue)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="text-xs">{group.status || 'Active'}</Badge>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="animate-in slide-in-from-top-2 duration-200">
                        <TableCell colSpan={8} className="bg-muted/30 p-0">
                          <div className="pl-6 sm:pl-12 pr-2 sm:pr-4 py-2 sm:py-4 overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-[10px] sm:text-xs">Item Name</TableHead>
                                  <TableHead className="text-[10px] sm:text-xs text-right">Qty</TableHead>
                                  <TableHead className="text-[10px] sm:text-xs text-right hidden sm:table-cell">Cost</TableHead>
                                  <TableHead className="text-[10px] sm:text-xs text-right hidden md:table-cell">Cost w/VAT</TableHead>
                                  <TableHead className="text-[10px] sm:text-xs text-right hidden sm:table-cell">Total</TableHead>
                                  <TableHead className="text-[10px] sm:text-xs text-right">Total w/VAT</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.items.map((item, idx) => (
                                  <TableRow key={`${group.orderNumber}-${idx}`}>
                                    <TableCell className="text-[10px] sm:text-xs">
                                      <div className="flex items-center gap-1 sm:gap-2">
                                        <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground hidden sm:inline" />
                                        <span className="truncate max-w-[120px] sm:max-w-none">{item.item_name}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className={`text-[10px] sm:text-xs text-right ${getValueColor(item.qty)}`}>
                                      {formatNumber(item.qty)}
                                    </TableCell>
                                    <TableCell className={`text-[10px] sm:text-xs text-right hidden sm:table-cell ${getValueColor(item.cost)}`}>
                                      {formatCurrency(item.cost)}
                                    </TableCell>
                                    <TableCell className={`text-[10px] sm:text-xs text-right hidden md:table-cell ${getValueColor(item.costwvat)}`}>
                                      {formatCurrency(item.costwvat)}
                                    </TableCell>
                                    <TableCell className={`text-[10px] sm:text-xs text-right hidden sm:table-cell ${getValueColor(item.total)}`}>
                                      {formatCurrency(item.total)}
                                    </TableCell>
                                    <TableCell className={`text-[10px] sm:text-xs text-right font-medium ${getValueColor(item.totalwvat)}`}>
                                      {formatCurrency(item.totalwvat)}
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