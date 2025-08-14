export interface TransferOrder {
  date: string
  order_number: string
  item_name: string
  qty: number
  cost: number
  costwvat: number
  total: number
  totalwvat: number
  source_warehouse: string
  destination_warehouse: string
  status: string
}

export interface OrderGroup {
  orderNumber: string
  date: string
  itemCount: number
  totalValue: number
  totalQty: number
  source: string
  destination: string
  status: string
  items: TransferOrder[]
}

export interface DashboardSummary {
  totalOrders: number
  totalValue: number
  inboundValue: number
  outboundValue: number
}

export interface DueFromSEB {
  Date: string
  Description: string
  Amount: string
}

export interface ProfitAnalysisItem {
  inv_no: string
  inv_date: string
  item: string
  qty: number
  sale_price: number
  sale_with_vat: number
  cost: number
  profit: number
  profit_percentage: number
  customer_name: string
  branch_name: string
  unit_price: number
  unit_cost: number
  unit_profit: number
  sales_person_name: string
  invoice_status: string
}

export interface ProfitAnalysisGroup {
  invoiceNumber: string
  date: string
  customerName: string
  salesPerson: string
  itemCount: number
  totalQty: number
  totalSale: number
  totalSaleWithVat: number
  totalCost: number
  totalProfit: number
  avgProfitMargin: number
  status: string
  items: ProfitAnalysisItem[]
}