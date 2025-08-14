'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardSummary } from '@/hooks/use-dashboard-summary'
import { 
  ChevronUp, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Calculator,
  X,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function FloatingSummary() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const { data: summary, isLoading } = useDashboardSummary()
  const widgetRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const formatCurrency = (amount: number) => {
    return `SAR ${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  }

  // Handle click outside to minimize
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't minimize if clicking the minimize button itself
      if (buttonRef.current?.contains(event.target as Node)) {
        return
      }
      
      // If widget is visible and click is outside, minimize it
      if (!isMinimized && widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsMinimized(true)
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside)
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMinimized])

  // Show floating button when minimized
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          ref={buttonRef}
          onClick={() => setIsMinimized(false)}
          className="h-14 w-14 rounded-full shadow-2xl bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:scale-110"
          size="icon"
          aria-label="Show financial summary"
          title="Show financial summary"
        >
          <div className="flex flex-col items-center">
            <Calculator className="h-5 w-5" />
            <Eye className="h-3 w-3 mt-0.5" />
          </div>
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div ref={widgetRef} className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-300">
        <Card className="w-80 shadow-2xl border-slate-200 bg-white/95 backdrop-blur">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 animate-in slide-in-from-right duration-300 sm:w-80">
      <Card className="w-full sm:w-80 shadow-2xl border-slate-200 bg-white/95 backdrop-blur transition-all duration-300">
        <CardContent className="p-0">
          {/* Header - Always Visible */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-2 cursor-pointer flex-1"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Calculator className="h-5 w-5 text-slate-600" />
                <span className="font-semibold text-slate-700">Financial Summary</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-1"
                  onClick={() => setIsMinimized(true)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Net Balance - Always Visible */}
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Net Balance</span>
                <div className="flex items-center gap-1 text-red-600">
                  {(summary?.netBalance ?? 0) >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-bold text-lg">
                    {formatCurrency(summary?.netBalance ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="border-t border-slate-100 p-4 space-y-3 animate-in slide-in-from-top-2">
              {/* Total Receivables */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-slate-700">Total Receivables</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(summary?.totalReceivables ?? 0)}
                  </span>
                </div>
                <div className="ml-6 space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Transfer Orders</span>
                    <span>{formatCurrency(summary?.transferOrdersTotal ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Due from SEB</span>
                    <span>{formatCurrency(summary?.dueFromSEBTotal ?? 0)}</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100"></div>

              {/* Total Transfers */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-slate-700">Fund Transfers Out</span>
                </div>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(summary?.fundTransfersTotal ?? 0)}
                </span>
              </div>

              {/* Calculation Formula */}
              <div className="bg-slate-50 rounded-lg p-3 mt-3">
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Receivables</span>
                    <span className="text-green-600">+{formatCurrency(summary?.totalReceivables ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfers Out</span>
                    <span className="text-orange-600">-{formatCurrency(summary?.fundTransfersTotal ?? 0)}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1 flex justify-between font-semibold">
                    <span>Net Balance</span>
                    <span className="text-red-600">
                      {formatCurrency(summary?.netBalance ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}