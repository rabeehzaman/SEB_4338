import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { TransferOrder, DashboardSummary } from '@/lib/types'

export function useTransferOrders() {
  return useQuery({
    queryKey: ['transfer-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfer_orders_view')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      return data as TransferOrder[]
    },
    refetchInterval: 60000, // Refetch every minute
  })
}

export function useDashboardSummary(orders: TransferOrder[] | undefined) {
  if (!orders) {
    return {
      totalOrders: 0,
      totalValue: 0,
      inboundValue: 0,
      outboundValue: 0,
    }
  }

  const summary: DashboardSummary = {
    totalOrders: orders.length,
    totalValue: orders.reduce((sum, order) => sum + (order.totalwvat || 0), 0),
    inboundValue: orders
      .filter(order => order.totalwvat > 0)
      .reduce((sum, order) => sum + order.totalwvat, 0),
    outboundValue: orders
      .filter(order => order.totalwvat < 0)
      .reduce((sum, order) => sum + order.totalwvat, 0),
  }

  return summary
}