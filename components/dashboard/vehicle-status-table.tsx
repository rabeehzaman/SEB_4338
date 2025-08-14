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
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { useSEBTransfers } from '@/hooks/use-seb-transfers'
import { Badge } from '@/components/ui/badge'

interface VehicleStatusTableProps {
  // Add props as needed when connecting to real data
}

export function VehicleStatusTable({}: VehicleStatusTableProps) {
  const { data: transfers, isLoading, error } = useSEBTransfers()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SEB Fund Transfers</CardTitle>
          <CardDescription>
            Transfers from SEB accounts to CASH COUNTER and RAJHI BANK
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SEB Fund Transfers</CardTitle>
          <CardDescription>
            Transfers from SEB accounts to CASH COUNTER and RAJHI BANK
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load transfer data</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalAmount = transfers?.reduce((sum, item) => {
    const amount = parseFloat(item.Amount.replace(/[^\d.-]/g, ''))
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0) || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEB Fund Transfers</CardTitle>
        <CardDescription>
          Transfers from SEB accounts to CASH COUNTER and RAJHI BANK
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Trans #</TableHead>
                <TableHead>From Account</TableHead>
                <TableHead>To Account</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers && transfers.length > 0 ? (
                <>
                  <TableRow className="bg-slate-100 font-bold">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default">{transfers?.length || 0} transfers</Badge>
                    </TableCell>
                    <TableCell colSpan={3}></TableCell>
                    <TableCell className="text-right text-green-600">
                      SAR {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                  {transfers.map((transfer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {transfer['Transaction Date']}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transfer['Transaction Number']}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{transfer['From Account']}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{transfer['To Account']}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {transfer.Reference || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {transfer.Amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No transfer records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}