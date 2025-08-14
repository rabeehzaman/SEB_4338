import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface VendorBalance {
  vendor_id: string
  vendor_name: string
  company_name: string | null
  vendor_status: string
  vendor_currency: string
  total_outstanding: number
  current_0_30: number
  past_due_31_60: number
  past_due_61_90: number
  past_due_91_120: number
  past_due_over_120: number
  outstanding_bills_count: number
  avg_days_outstanding: number | null
  oldest_due_date: string | null
  last_bill_date: string | null
  currency: string
  risk_category: string
}

async function fetchVendorBalances(): Promise<VendorBalance[]> {
  const { data, error } = await supabase
    .from('seb_vendor_balance_aging')
    .select('*')
    .order('total_outstanding', { ascending: false })

  if (error) {
    console.error('Error fetching vendor balances:', error)
    throw new Error(`Failed to fetch vendor balances: ${error.message}`)
  }

  return (data || []).map(item => ({
    vendor_id: item.vendor_id,
    vendor_name: item.vendor_name,
    company_name: item.company_name,
    vendor_status: item.vendor_status,
    vendor_currency: item.vendor_currency,
    total_outstanding: parseFloat(item.total_outstanding || '0'),
    current_0_30: parseFloat(item.current_0_30 || '0'),
    past_due_31_60: parseFloat(item.past_due_31_60 || '0'),
    past_due_61_90: parseFloat(item.past_due_61_90 || '0'),
    past_due_91_120: parseFloat(item.past_due_91_120 || '0'),
    past_due_over_120: parseFloat(item.past_due_over_120 || '0'),
    outstanding_bills_count: item.outstanding_bills_count || 0,
    avg_days_outstanding: item.avg_days_outstanding,
    oldest_due_date: item.oldest_due_date,
    last_bill_date: item.last_bill_date,
    currency: item.currency,
    risk_category: item.risk_category
  }))
}

export function useVendorBalances() {
  return useQuery({
    queryKey: ['vendor-balances'],
    queryFn: fetchVendorBalances,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}