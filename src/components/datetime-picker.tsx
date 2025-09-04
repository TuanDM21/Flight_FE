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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface DateTimePickerProps {
  value?: string | Date
  onChange: (date: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày và giờ',
  disabled = false,
  className,
}: DateTimePickerProps) {
  const selectedDate = value ? new Date(value) : undefined

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // If we already have a time selected, preserve it
      if (selectedDate) {
        const newDate = new Date(date)
        newDate.setHours(selectedDate.getHours())
        newDate.setMinutes(selectedDate.getMinutes())
        onChange(newDate.toISOString())
      } else {
        // Default to current time
        const newDate = new Date(date)
        const now = new Date()
        newDate.setHours(now.getHours())
        newDate.setMinutes(now.getMinutes())
        onChange(newDate.toISOString())
      }
    } else {
      onChange(undefined)
    }
  }

  const handleTimeChange = (type: 'hour' | 'minute', timeValue: number) => {
    const baseDate = selectedDate || new Date()
    const newDate = new Date(baseDate)

    if (type === 'hour') {
      newDate.setHours(timeValue)
    } else {
      newDate.setMinutes(timeValue)
    }

    onChange(newDate.toISOString())
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          className={cn(
            'w-full border-gray-300 pl-3 text-left font-normal',
            !value && 'text-gray-500',
            className
          )}
        >
          {value ? (
            format(new Date(value), 'dd/MM/yyyy HH:mm')
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <div className='sm:flex'>
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={disabled}
            className='rounded-md border'
          />
          <div className='flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0'>
            {/* Hour selector */}
            <ScrollArea className='w-64 sm:w-auto'>
              <div className='flex p-2 sm:flex-col'>
                {Array.from({ length: 24 }, (_, i) => i)
                  .reverse()
                  .map((hour) => {
                    const isSelected = selectedDate?.getHours() === hour

                    return (
                      <Button
                        key={hour}
                        size='icon'
                        variant={isSelected ? 'default' : 'ghost'}
                        className='aspect-square shrink-0 sm:w-full'
                        onClick={() => handleTimeChange('hour', hour)}
                      >
                        {hour}
                      </Button>
                    )
                  })}
              </div>
              <ScrollBar orientation='horizontal' className='sm:hidden' />
            </ScrollArea>

            {/* Minute selector */}
            <ScrollArea className='w-64 sm:w-auto'>
              <div className='flex p-2 sm:flex-col'>
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => {
                  const isSelected = selectedDate?.getMinutes() === minute

                  return (
                    <Button
                      key={minute}
                      size='icon'
                      variant={isSelected ? 'default' : 'ghost'}
                      className='aspect-square shrink-0 sm:w-full'
                      onClick={() => handleTimeChange('minute', minute)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </Button>
                  )
                })}
              </div>
              <ScrollBar orientation='horizontal' className='sm:hidden' />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
