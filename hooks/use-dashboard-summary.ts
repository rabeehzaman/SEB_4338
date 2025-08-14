'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useTransferOrders } from './use-transfer-orders'
import { useDueFromSEB } from './use-due-from-seb'
import { useSEBTransfers } from './use-seb-transfers'

export interface DashboardSummary {
  transferOrdersTotal: number
  dueFromSEBTotal: number
  fundTransfersTotal: number
  totalReceivables: number
  netBalance: number
}

export function useDashboardSummary() {
  const { data: transferOrders } = useTransferOrders()
  const { data: dueFromSEB } = useDueFromSEB()
  const { data: fundTransfers } = useSEBTransfers()

  return useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary', transferOrders, dueFromSEB, fundTransfers],
    queryFn: async () => {
      // Calculate Transfer Orders Total - using totalwvat field
      const transferOrdersTotal = transferOrders?.reduce((sum, order) => {
        const total = parseFloat(order.totalwvat?.toString() || '0')
        return sum + Math.abs(total) // Use absolute value to get positive total
      }, 0) || 0

      // Calculate Due from SEB Total
      const dueFromSEBTotal = dueFromSEB?.reduce((sum, item) => {
        const amount = parseFloat(item.Amount.replace(/[^\d.-]/g, ''))
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0) || 0

      // Calculate Fund Transfers Total
      const fundTransfersTotal = fundTransfers?.reduce((sum, item) => {
        const amount = parseFloat(item.Amount.replace(/[^\d.-]/g, ''))
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0) || 0

      // Calculate totals
      const totalReceivables = transferOrdersTotal + dueFromSEBTotal
      const netBalance = totalReceivables - fundTransfersTotal

      return {
        transferOrdersTotal,
        dueFromSEBTotal,
        fundTransfersTotal,
        totalReceivables,
        netBalance
      }
    },
    enabled: true,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })
}