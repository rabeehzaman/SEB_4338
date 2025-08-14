'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface SEBTransfer {
  'Transaction Date': string
  'Transaction Number': string
  'From Account': string
  'To Account': string
  'Amount': string
  'Reference': string | null
  'Description': string
}

export function useSEBTransfers() {
  return useQuery<SEBTransfer[]>({
    queryKey: ['seb-transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('SEB_Transfer_Funds')
        .select('*')
        .order('Transaction Date', { ascending: false })

      if (error) {
        console.error('Error fetching SEB transfers:', error)
        throw error
      }

      return data || []
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })
}