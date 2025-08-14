import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface SEBExpense {
  id: number
  expense_date: string | null
  original_date: string
  account_name: string | null
  description: string | null
  reference_number: string | null
  reference_no: string | null
  full_description: string
  amount: number
  original_amount: string
  entity_type: string
  entity_id: string
  created_at: string
  branch_name: string
  year: number | null
  month: number | null
  year_month: string | null
}

export interface ExpenseSummary {
  totalExpenses: number
  expenseCount: number
  monthlyExpenses: { [key: string]: number }
  accountBreakdown: { [key: string]: { count: number; total: number } }
  dailyAverage: number
  largestExpense: number
  currentMonthTotal: number
  previousMonthTotal: number
  monthlyChange: number
}

async function fetchSEBExpenses(): Promise<{
  expenses: SEBExpense[]
  summary: ExpenseSummary
}> {
  const { data, error } = await supabase
    .from('seb_vehicle_expenses')
    .select('*')
    .order('expense_date', { ascending: false })
    .order('amount', { ascending: false })

  if (error) {
    console.error('Error fetching SEB expenses:', error)
    throw new Error(`Failed to fetch SEB expenses: ${error.message}`)
  }

  const expenses = (data || []).map(item => ({
    ...item,
    amount: parseFloat(item.amount || '0')
  }))

  // Calculate summary statistics
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const expenseCount = expenses.length
  
  // Group by month
  const monthlyExpenses: { [key: string]: number } = {}
  expenses.forEach(exp => {
    if (exp.year_month) {
      monthlyExpenses[exp.year_month] = (monthlyExpenses[exp.year_month] || 0) + exp.amount
    }
  })

  // Group by account
  const accountBreakdown: { [key: string]: { count: number; total: number } } = {}
  expenses.forEach(exp => {
    const account = exp.account_name || 'Uncategorized'
    if (!accountBreakdown[account]) {
      accountBreakdown[account] = { count: 0, total: 0 }
    }
    accountBreakdown[account].count++
    accountBreakdown[account].total += exp.amount
  })

  // Calculate current and previous month totals
  const currentDate = new Date()
  const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  const previousDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
  const previousYearMonth = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`

  const currentMonthTotal = monthlyExpenses[currentYearMonth] || 0
  const previousMonthTotal = monthlyExpenses[previousYearMonth] || 0
  const monthlyChange = previousMonthTotal > 0 
    ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 
    : 0

  // Calculate daily average based on days with expenses
  const uniqueDays = new Set(expenses.filter(e => e.expense_date).map(e => e.expense_date))
  const dailyAverage = uniqueDays.size > 0 ? totalExpenses / uniqueDays.size : 0

  const largestExpense = Math.max(...expenses.map(e => e.amount), 0)

  const summary: ExpenseSummary = {
    totalExpenses,
    expenseCount,
    monthlyExpenses,
    accountBreakdown,
    dailyAverage,
    largestExpense,
    currentMonthTotal,
    previousMonthTotal,
    monthlyChange
  }

  return { expenses, summary }
}

export function useSEBExpenses() {
  return useQuery({
    queryKey: ['seb-expenses'],
    queryFn: fetchSEBExpenses,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}