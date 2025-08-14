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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transfer Orders</CardTitle>
            <CardDescription>
              {orderGroups.length} orders with items | Click order to view details
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              title="Export to CSV"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
            >
              {expandedOrders.size === orderGroups.length ? (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Collapse All</span>
                </>
              ) : (
                <>
                  <ChevronRight className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Expand All</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Sticky Total Row */}
        <div className="sticky top-0 z-10 bg-white border-b-2 border-slate-200">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-600">SUMMARY</span>
                <Badge variant="default">{orderGroups.length} orders</Badge>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs text-slate-500">Total Qty</span>
                  <p className={`font-bold ${getValueColor(orderGroups.reduce((sum, g) => sum + g.totalQty, 0))}`}>
                    {formatNumber(orderGroups.reduce((sum, g) => sum + g.totalQty, 0))}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Total (excl. VAT)</span>
                  <p className={`font-bold ${getValueColor(orderGroups.reduce((sum, g) => sum + (g.totalValue / 1.15), 0))}`}>
                    {formatCurrency(orderGroups.reduce((sum, g) => sum + (g.totalValue / 1.15), 0))}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Total (incl. VAT)</span>
                  <p className={`font-bold text-lg ${getValueColor(orderGroups.reduce((sum, g) => sum + g.totalValue, 0))}`}>
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
                <TableHead className="w-[40px]">
                  <span className="sr-only">Expand/Collapse</span>
                </TableHead>
                <TableHead>Order Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Total w/VAT</TableHead>
                <TableHead>Status</TableHead>
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
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          aria-label={isExpanded ? `Collapse order ${group.orderNumber}` : `Expand order ${group.orderNumber}`}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                        {group.orderNumber}
                      </TableCell>
                      <TableCell>{formatDate(group.date)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{group.itemCount} items</Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getValueColor(group.totalQty)}`}>
                        {formatNumber(group.totalQty)}
                      </TableCell>
                      <TableCell className={`text-right ${getValueColor(totalWithoutVat)}`}>
                        {formatCurrency(totalWithoutVat)}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${getValueColor(group.totalValue)}`}>
                        {formatCurrency(group.totalValue)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{group.status || 'Active'}</Badge>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="animate-in slide-in-from-top-2 duration-200">
                        <TableCell colSpan={8} className="bg-muted/30 p-0">
                          <div className="pl-12 pr-4 py-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">Item Name</TableHead>
                                  <TableHead className="text-xs text-right">Qty</TableHead>
                                  <TableHead className="text-xs text-right">Cost</TableHead>
                                  <TableHead className="text-xs text-right">Cost w/VAT</TableHead>
                                  <TableHead className="text-xs text-right">Total</TableHead>
                                  <TableHead className="text-xs text-right">Total w/VAT</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.items.map((item, idx) => (
                                  <TableRow key={`${group.orderNumber}-${idx}`}>
                                    <TableCell className="text-xs">
                                      <div className="flex items-center gap-2">
                                        <Package className="h-3 w-3 text-muted-foreground" />
                                        {item.item_name}
                                      </div>
                                    </TableCell>
                                    <TableCell className={`text-xs text-right ${getValueColor(item.qty)}`}>
                                      {formatNumber(item.qty)}
                                    </TableCell>
                                    <TableCell className={`text-xs text-right ${getValueColor(item.cost)}`}>
                                      {formatCurrency(item.cost)}
                                    </TableCell>
                                    <TableCell className={`text-xs text-right ${getValueColor(item.costwvat)}`}>
                                      {formatCurrency(item.costwvat)}
                                    </TableCell>
                                    <TableCell className={`text-xs text-right ${getValueColor(item.total)}`}>
                                      {formatCurrency(item.total)}
                                    </TableCell>
                                    <TableCell className={`text-xs text-right font-medium ${getValueColor(item.totalwvat)}`}>
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