'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useDueFromSEB } from '@/hooks/use-due-from-seb'
import { AlertCircle } from 'lucide-react'

export function DueFromSEBTable() {
  const { data: dueItems, isLoading, error } = useDueFromSEB()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Due from SEB</CardTitle>
          <CardDescription>Loading payment records...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error Loading Data</h3>
          </div>
          <p className="mt-2 text-sm text-red-600">
            Failed to load due from SEB records
          </p>
        </CardContent>
      </Card>
    )
  }

  // Parse amount to get numeric value for formatting
  const parseAmount = (amountStr: string) => {
    // Remove "SAR " prefix and commas, then parse
    const cleanAmount = amountStr.replace('SAR ', '').replace(/,/g, '')
    return parseFloat(cleanAmount) || 0
  }

  // Calculate total
  const totalAmount = dueItems?.reduce((sum, item) => sum + parseAmount(item.Amount), 0) || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Due from SEB</CardTitle>
            <CardDescription>
              Outstanding payments and expenses due from SEB
            </CardDescription>
          </div>
          <Badge variant="default" className="text-lg px-3 py-1">
            Total: {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Total Row */}
              <TableRow className="bg-slate-100 font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-center">
                  <Badge variant="default">{dueItems?.length || 0} items</Badge>
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>

              {/* Data Rows */}
              {dueItems?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.Date}</TableCell>
                  <TableCell>{item.Description}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {parseAmount(item.Amount).toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
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