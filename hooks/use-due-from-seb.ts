'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { DueFromSEB } from '@/lib/types'

export function useDueFromSEB() {
  return useQuery<DueFromSEB[]>({
    queryKey: ['due-from-seb'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Due from SEB')
        .select('*')
        .order('Date', { ascending: false })

      if (error) {
        console.error('Error fetching due from SEB:', error)
        throw error
      }

      return data || []
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })
}