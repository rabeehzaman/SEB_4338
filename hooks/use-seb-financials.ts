import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface FinancialSummary {
  month: string
  month_date: string
  invoice_count: number
  total_sales: number
  total_sales_with_vat: number
  cost_of_goods_sold: number
  gross_profit: number
  avg_profit_margin: number
  expense_count: number
  operating_expenses: number
  net_profit: number
  net_profit_margin: number
  gross_profit_margin: number
  expense_ratio: number
}

export interface FinancialMetrics {
  totalRevenue: number
  totalCOGS: number
  totalGrossProfit: number
  totalExpenses: number
  totalNetProfit: number
  avgGrossMargin: number
  avgNetMargin: number
  bestMonth: string | null
  worstMonth: string | null
  currentMonth: FinancialSummary | null
  previousMonth: FinancialSummary | null
  yearToDate: {
    revenue: number
    cogs: number
    grossProfit: number
    expenses: number
    netProfit: number
  }
}

async function fetchFinancialSummary(): Promise<{
  monthlyData: FinancialSummary[]
  metrics: FinancialMetrics
}> {
  const { data, error } = await supabase
    .from('seb_vehicle_financial_summary')
    .select('*')
    .order('month', { ascending: false })

  if (error) {
    console.error('Error fetching financial summary:', error)
    throw new Error(`Failed to fetch financial summary: ${error.message}`)
  }

  const monthlyData: FinancialSummary[] = (data || []).map(item => ({
    month: item.month,
    month_date: item.month_date,
    invoice_count: item.invoice_count,
    total_sales: parseFloat(item.total_sales || '0'),
    total_sales_with_vat: parseFloat(item.total_sales_with_vat || '0'),
    cost_of_goods_sold: parseFloat(item.cost_of_goods_sold || '0'),
    gross_profit: parseFloat(item.gross_profit || '0'),
    avg_profit_margin: parseFloat(item.avg_profit_margin || '0'),
    expense_count: item.expense_count,
    operating_expenses: parseFloat(item.operating_expenses || '0'),
    net_profit: parseFloat(item.net_profit || '0'),
    net_profit_margin: parseFloat(item.net_profit_margin || '0'),
    gross_profit_margin: parseFloat(item.gross_profit_margin || '0'),
    expense_ratio: parseFloat(item.expense_ratio || '0')
  }))

  // Calculate overall metrics
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.total_sales, 0)
  const totalCOGS = monthlyData.reduce((sum, m) => sum + m.cost_of_goods_sold, 0)
  const totalGrossProfit = monthlyData.reduce((sum, m) => sum + m.gross_profit, 0)
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.operating_expenses, 0)
  const totalNetProfit = monthlyData.reduce((sum, m) => sum + m.net_profit, 0)
  
  const avgGrossMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0
  const avgNetMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0

  // Find best and worst months by net profit
  const sortedByProfit = [...monthlyData].sort((a, b) => b.net_profit - a.net_profit)
  const bestMonth = sortedByProfit[0]?.month || null
  const worstMonth = sortedByProfit[sortedByProfit.length - 1]?.month || null

  // Current and previous month
  const currentDate = new Date()
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  const previousDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
  const previousMonthStr = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`

  const currentMonth = monthlyData.find(m => m.month === currentMonthStr) || null
  const previousMonth = monthlyData.find(m => m.month === previousMonthStr) || null

  // Year to date calculations
  const currentYear = currentDate.getFullYear()
  const ytdData = monthlyData.filter(m => m.month.startsWith(currentYear.toString()))
  
  const yearToDate = {
    revenue: ytdData.reduce((sum, m) => sum + m.total_sales, 0),
    cogs: ytdData.reduce((sum, m) => sum + m.cost_of_goods_sold, 0),
    grossProfit: ytdData.reduce((sum, m) => sum + m.gross_profit, 0),
    expenses: ytdData.reduce((sum, m) => sum + m.operating_expenses, 0),
    netProfit: ytdData.reduce((sum, m) => sum + m.net_profit, 0)
  }

  const metrics: FinancialMetrics = {
    totalRevenue,
    totalCOGS,
    totalGrossProfit,
    totalExpenses,
    totalNetProfit,
    avgGrossMargin,
    avgNetMargin,
    bestMonth,
    worstMonth,
    currentMonth,
    previousMonth,
    yearToDate
  }

  return { monthlyData, metrics }
}

export function useSEBFinancials() {
  return useQuery({
    queryKey: ['seb-financials'],
    queryFn: fetchFinancialSummary,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}