import { format } from 'date-fns'
import { TransferOrder, OrderGroup } from './types'

export const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
  return `SAR ${formatted}`
}

export const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy')
  } catch {
    return dateString
  }
}

export const getValueColor = (value: number): string => {
  if (value > 0) return 'text-green-600 dark:text-green-400'
  if (value < 0) return 'text-red-600 dark:text-red-400'
  return 'text-gray-600 dark:text-gray-400'
}

export const groupOrdersByOrderNumber = (orders: TransferOrder[]): OrderGroup[] => {
  const grouped = orders.reduce((acc, item) => {
    if (!acc[item.order_number]) {
      acc[item.order_number] = {
        orderNumber: item.order_number,
        date: item.date,
        source: item.source_warehouse,
        destination: item.destination_warehouse,
        status: item.status,
        itemCount: 0,
        totalValue: 0,
        totalQty: 0,
        items: []
      }
    }
    
    acc[item.order_number].items.push(item)
    acc[item.order_number].itemCount += 1
    acc[item.order_number].totalValue += item.totalwvat || 0
    acc[item.order_number].totalQty += item.qty || 0
    
    return acc
  }, {} as Record<string, OrderGroup>)

  return Object.values(grouped).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}