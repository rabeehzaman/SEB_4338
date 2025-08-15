import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ProfitAnalysisItem, ProfitAnalysisGroup } from '@/lib/types'

export function groupProfitByInvoice(items: ProfitAnalysisItem[]): ProfitAnalysisGroup[] {
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.inv_no]) {
      acc[item.inv_no] = {
        invoiceNumber: item.inv_no,
        date: item.inv_date,
        customerName: item.customer_name,
        salesPerson: item.sales_person_name,
        itemCount: 0,
        totalQty: 0,
        totalSale: 0,
        totalSaleWithVat: 0,
        totalCost: 0,
        totalProfit: 0,
        avgProfitMargin: 0,
        status: item.invoice_status,
        items: []
      }
    }
    
    const group = acc[item.inv_no]
    group.items.push(item)
    group.itemCount++
    group.totalQty += item.qty
    group.totalSale += item.sale_price
    group.totalSaleWithVat += item.sale_with_vat
    group.totalCost += item.cost
    group.totalProfit += item.profit
    
    return acc
  }, {} as Record<string, ProfitAnalysisGroup>)
  
  // Calculate average profit margin for each group
  Object.values(grouped).forEach(group => {
    if (group.totalSale !== 0) {
      group.avgProfitMargin = (group.totalProfit / Math.abs(group.totalSale)) * 100
    }
  })
  
  // Sort by date (newest first) and then by invoice number
  return Object.values(grouped).sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime()
    if (dateCompare !== 0) return dateCompare
    return b.invoiceNumber.localeCompare(a.invoiceNumber)
  })
}

export function useProfitAnalysis(fromDate?: Date, toDate?: Date) {
  // Convert dates to strings for stable query key
  const fromDateStr = fromDate?.toISOString().split('T')[0] || null
  const toDateStr = toDate?.toISOString().split('T')[0] || null

  return useQuery<ProfitAnalysisItem[]>({
    queryKey: ['profit-analysis', fromDateStr, toDateStr],
    queryFn: async () => {
      let query = supabase
        .from('profit_analysis_seb_vehicle')
        .select('*')
      
      // Apply date filter if dates are provided
      if (fromDateStr && toDateStr) {
        query = query
          .gte('inv_date', fromDateStr)
          .lte('inv_date', toDateStr)
      } else if (fromDateStr) {
        query = query.gte('inv_date', fromDateStr)
      } else if (toDateStr) {
        query = query.lte('inv_date', toDateStr)
      }
      
      const { data, error } = await query
        .order('inv_date', { ascending: false })
        .order('inv_no', { ascending: false })

      if (error) throw error
      return data as ProfitAnalysisItem[]
    },
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchInterval: 60000, // Refetch every minute
  })
}