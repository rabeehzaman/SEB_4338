'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DateRangeFilterProps {
  onDateRangeChange: (from: Date | undefined, to: Date | undefined) => void
}

type PresetOption = {
  label: string
  getValue: () => { from: Date; to: Date }
}

export function DateRangeFilter({ onDateRangeChange }: DateRangeFilterProps) {
  const [date, setDate] = useState<DateRange | undefined>()
  const [selectedPreset, setSelectedPreset] = useState<string>('This Month')

  const presetOptions: PresetOption[] = [
    {
      label: 'Today',
      getValue: () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return { from: today, to: today }
      }
    },
    {
      label: 'Yesterday',
      getValue: () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(0, 0, 0, 0)
        return { from: yesterday, to: yesterday }
      }
    },
    {
      label: 'This Week',
      getValue: () => {
        const now = new Date()
        const dayOfWeek = now.getDay()
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        const monday = new Date(now.setDate(diff))
        monday.setHours(0, 0, 0, 0)
        const sunday = new Date(monday)
        sunday.setDate(sunday.getDate() + 6)
        return { from: monday, to: sunday }
      }
    },
    {
      label: 'Previous Week',
      getValue: () => {
        const now = new Date()
        const dayOfWeek = now.getDay()
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) - 7
        const monday = new Date(now.setDate(diff))
        monday.setHours(0, 0, 0, 0)
        const sunday = new Date(monday)
        sunday.setDate(sunday.getDate() + 6)
        return { from: monday, to: sunday }
      }
    },
    {
      label: 'This Month',
      getValue: () => {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return { from: firstDay, to: lastDay }
      }
    },
    {
      label: 'Previous Month',
      getValue: () => {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
        return { from: firstDay, to: lastDay }
      }
    },
    {
      label: 'Last 30 Days',
      getValue: () => {
        const to = new Date()
        const from = new Date()
        from.setDate(from.getDate() - 30)
        from.setHours(0, 0, 0, 0)
        return { from, to }
      }
    },
    {
      label: 'Last 90 Days',
      getValue: () => {
        const to = new Date()
        const from = new Date()
        from.setDate(from.getDate() - 90)
        from.setHours(0, 0, 0, 0)
        return { from, to }
      }
    },
    {
      label: 'This Quarter',
      getValue: () => {
        const now = new Date()
        const quarter = Math.floor(now.getMonth() / 3)
        const firstDay = new Date(now.getFullYear(), quarter * 3, 1)
        const lastDay = new Date(now.getFullYear(), quarter * 3 + 3, 0)
        return { from: firstDay, to: lastDay }
      }
    },
    {
      label: 'Previous Quarter',
      getValue: () => {
        const now = new Date()
        const quarter = Math.floor(now.getMonth() / 3)
        const firstDay = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
        const lastDay = new Date(now.getFullYear(), (quarter - 1) * 3 + 3, 0)
        return { from: firstDay, to: lastDay }
      }
    },
    {
      label: 'This Year',
      getValue: () => {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), 0, 1)
        const lastDay = new Date(now.getFullYear(), 11, 31)
        return { from: firstDay, to: lastDay }
      }
    },
    {
      label: 'Previous Year',
      getValue: () => {
        const now = new Date()
        const firstDay = new Date(now.getFullYear() - 1, 0, 1)
        const lastDay = new Date(now.getFullYear() - 1, 11, 31)
        return { from: firstDay, to: lastDay }
      }
    },
  ]

  // Initialize with "This Month" on mount
  useEffect(() => {
    const thisMonth = presetOptions.find(p => p.label === 'This Month')
    if (thisMonth) {
      const range = thisMonth.getValue()
      setDate(range)
      onDateRangeChange(range.from, range.to)
    }
  }, [onDateRangeChange])

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value)
    const preset = presetOptions.find(p => p.label === value)
    if (preset) {
      const range = preset.getValue()
      setDate(range)
      onDateRangeChange(range.from, range.to)
    } else if (value === 'custom') {
      // Keep the current custom range
    }
  }

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
    setSelectedPreset('custom')
    onDateRangeChange(newDate?.from, newDate?.to)
  }

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <span className="text-xs sm:text-sm text-muted-foreground">Date Range:</span>
      </div>

      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-full sm:w-[180px] h-8 sm:h-10 text-xs sm:text-sm">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Today">Today</SelectItem>
          <SelectItem value="Yesterday">Yesterday</SelectItem>
          <SelectItem value="This Week">This Week</SelectItem>
          <SelectItem value="Previous Week">Previous Week</SelectItem>
          <SelectItem value="This Month">This Month</SelectItem>
          <SelectItem value="Previous Month">Previous Month</SelectItem>
          <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
          <SelectItem value="Last 90 Days">Last 90 Days</SelectItem>
          <SelectItem value="This Quarter">This Quarter</SelectItem>
          <SelectItem value="Previous Quarter">Previous Quarter</SelectItem>
          <SelectItem value="This Year">This Year</SelectItem>
          <SelectItem value="Previous Year">Previous Year</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full sm:w-auto justify-start text-left font-normal h-8 sm:h-10 text-xs sm:text-sm',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  <span className="hidden sm:inline">
                    {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                  </span>
                  <span className="sm:hidden">
                    {format(date.from, 'MMM dd')} - {format(date.to, 'MMM dd')}
                  </span>
                </>
              ) : (
                <span className="hidden sm:inline">{format(date.from, 'LLL dd, y')}</span>
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50 bg-white" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={window.innerWidth < 640 ? 1 : 2}
            className="text-xs sm:text-sm"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}