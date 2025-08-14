'use client'

import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DateFilterProps {
  selectedMonth: string
  selectedYear: string
  onMonthChange: (month: string) => void
  onYearChange: (year: string) => void
}

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

export function DateFilter({ selectedMonth, selectedYear, onMonthChange, onYearChange }: DateFilterProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i).map(y => y.toString())

  const handleThisMonth = () => {
    const now = new Date()
    onMonthChange(String(now.getMonth() + 1).padStart(2, '0'))
    onYearChange(now.getFullYear().toString())
  }

  const currentMonth = new Date().getMonth() + 1
  const isCurrentMonth = selectedMonth === String(currentMonth).padStart(2, '0') && 
                        selectedYear === currentYear.toString()

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Filter by:</span>
      </div>
      
      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        variant={isCurrentMonth ? "default" : "outline"} 
        size="sm"
        onClick={handleThisMonth}
      >
        This Month
      </Button>
    </div>
  )
}