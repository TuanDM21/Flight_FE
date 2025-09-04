'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from './calendar'

interface DateRangePickerProps {
  dateRange?: DateRange
  onSelect?: (range: DateRange | undefined) => void
  placeholder?: string
  formatPattern?: string
  className?: string
  variant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
}

export function DateRangePicker({
  dateRange,
  onSelect,
  placeholder = 'Pick a date range',
  formatPattern = 'PPP',
  className,
  variant = 'outline',
  size = 'default',
  disabled = false,
}: DateRangePickerProps) {
  const [internalRange, setInternalRange] = React.useState<DateRange>()
  const [open, setOpen] = React.useState(false)

  const selectedRange = dateRange ?? internalRange
  const handleSelect = onSelect ?? setInternalRange

  const formatRange = (range: DateRange | undefined): string => {
    if (!range?.from && !range?.to) return placeholder
    if (range?.from && range?.to) {
      return `${format(range.from, formatPattern)} - ${format(range.to, formatPattern)}`
    }
    return format(range?.from ?? range?.to!, formatPattern)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled}
          className={cn(
            'justify-start text-left font-normal',
            !selectedRange?.from &&
              !selectedRange?.to &&
              'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {formatRange(selectedRange)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='range'
          selected={selectedRange}
          onSelect={handleSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
