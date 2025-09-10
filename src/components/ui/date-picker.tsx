import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
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

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  formatPattern = 'PPP',
  className,
  variant = 'outline',
  size = 'default',
  disabled = false,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date>()
  const [open, setOpen] = React.useState(false)

  const selectedDate = value ?? internalDate
  const handleSelect = onChange ?? setInternalDate

  const handleDateSelect = (newDate: Date | undefined) => {
    handleSelect(newDate)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled}
          onClick={() => setOpen(false)}
          className={cn(
            'justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {selectedDate ? (
            format(selectedDate, formatPattern)
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={handleDateSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
