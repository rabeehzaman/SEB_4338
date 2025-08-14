import { useEffect, useState } from 'react'
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
  const [data, setData] = useState<ProfitAnalysisItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchProfitAnalysis() {
      try {
        setIsLoading(true)
        let query = supabase
          .from('profit_analysis_seb_vehicle')
          .select('*')
        
        // Apply date filter if dates are provided
        if (fromDate && toDate) {
          const startDate = fromDate.toISOString().split('T')[0]
          const endDate = toDate.toISOString().split('T')[0]
          query = query
            .gte('inv_date', startDate)
            .lte('inv_date', endDate)
        } else if (fromDate) {
          const startDate = fromDate.toISOString().split('T')[0]
          query = query.gte('inv_date', startDate)
        } else if (toDate) {
          const endDate = toDate.toISOString().split('T')[0]
          query = query.lte('inv_date', endDate)
        }
        
        const { data, error } = await query
          .order('inv_date', { ascending: false })
          .order('inv_no', { ascending: false })

        if (error) throw error
        setData(data as ProfitAnalysisItem[])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch profit analysis'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfitAnalysis()
  }, [fromDate?.getTime(), toDate?.getTime()])

  return { data, isLoading, error }
}