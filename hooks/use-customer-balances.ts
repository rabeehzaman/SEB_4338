import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface CustomerBalance {
  customer_id: string
  customer_name: string
  display_name: string | null
  company_name: string | null
  total_balance: number
  current_0_30: number
  past_due_31_60: number
  past_due_61_90: number
  past_due_91_180: number
  past_due_over_180: number
  total_invoices: number
  last_invoice_date: string | null
  customer_status: string
}

async function fetchCustomerBalances(): Promise<CustomerBalance[]> {
  const { data, error } = await supabase
    .from('customer_balance_aging')
    .select(`
      customer_id,
      customer_name,
      display_name,
      company_name,
      total_balance,
      current_0_30,
      past_due_31_60,
      past_due_61_90,
      past_due_91_180,
      past_due_over_180,
      total_invoices,
      last_invoice_date,
      customer_status
    `)
    .eq('customer_owner', '9465000006136989')
    .order('total_balance', { ascending: false })

  if (error) {
    console.error('Error fetching customer balances:', error)
    throw new Error(`Failed to fetch customer balances: ${error.message}`)
  }

  return (data || []).map(item => ({
    customer_id: item.customer_id,
    customer_name: item.customer_name,
    display_name: item.display_name,
    company_name: item.company_name,
    total_balance: parseFloat(item.total_balance || '0'),
    current_0_30: parseFloat(item.current_0_30 || '0'),
    past_due_31_60: parseFloat(item.past_due_31_60 || '0'),
    past_due_61_90: parseFloat(item.past_due_61_90 || '0'),
    past_due_91_180: parseFloat(item.past_due_91_180 || '0'),
    past_due_over_180: parseFloat(item.past_due_over_180 || '0'),
    total_invoices: item.total_invoices,
    last_invoice_date: item.last_invoice_date,
    customer_status: item.customer_status
  }))
}

export function useCustomerBalances() {
  return useQuery({
    queryKey: ['customer-balances'],
    queryFn: fetchCustomerBalances,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}