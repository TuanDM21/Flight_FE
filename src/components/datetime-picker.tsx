'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'

interface DateTimePickerProps {
  value?: string | Date
  onChange: (date: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  startHour?: number
  endHour?: number
  interval?: number
  modal?: boolean
}

// Helper function to generate time slots
const generateTimeSlotsArray = (
  startHour: number,
  endHour: number,
  interval: number
): string[] => {
  const slots: string[] = []
  const startMinutes = startHour * 60
  const endMinutes = endHour * 60 + interval // Include the last slot

  for (let minutes = startMinutes; minutes <= endMinutes; minutes += interval) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours < 24) {
      slots.push(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
      )
    }
  }

  return slots
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày và giờ',
  disabled = false,
  className,
  startHour = 0,
  endHour = 24,
  interval = 30,
  modal = true,
}: DateTimePickerProps) {
  const today = new Date()

  // Parse initial value
  const initialDateTime = useMemo(() => {
    return value ? new Date(value) : undefined
  }, [value])

  // State management
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDateTime || today
  )
  const [selectedTime, setSelectedTime] = useState<string | null>(
    initialDateTime ? format(initialDateTime, 'HH:mm') : null
  )
  const [isOpen, setIsOpen] = useState(false)

  // Generate time slots
  const availableTimeSlots = useMemo(() => {
    return generateTimeSlotsArray(startHour, endHour, interval)
  }, [startHour, endHour, interval])

  // Update internal state when value prop changes
  useEffect(() => {
    if (value) {
      const newDateTime = new Date(value)
      setSelectedDate(newDateTime)
      setSelectedTime(format(newDateTime, 'HH:mm'))
    } else {
      setSelectedTime(null)
    }
  }, [value])

  // Handlers
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(undefined)
      return
    }

    setSelectedDate(date)

    if (selectedTime) {
      // If time is already selected, combine and close
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const newDateTime = new Date(date)
      newDateTime.setHours(hours, minutes, 0, 0)
      onChange(newDateTime.toISOString())
      setIsOpen(false)
    } else {
      // Clear value if no time selected
      onChange(undefined)
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)

    const [hours, minutes] = time.split(':').map(Number)
    const newDateTime = new Date(selectedDate)
    newDateTime.setHours(hours, minutes, 0, 0)

    onChange(newDateTime.toISOString())
    setIsOpen(false)
  }

  const displayValue = value
    ? format(new Date(value), 'dd/MM/yyyy HH:mm')
    : null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={modal}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !displayValue && 'text-muted-foreground',
            className
          )}
        >
          {displayValue || placeholder}
          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-auto p-0' align='start'>
        <div className='rounded-md border'>
          <div className='flex max-sm:flex-col'>
            {/* Calendar Section */}
            <Calendar
              mode='single'
              selected={selectedDate}
              onSelect={handleDateSelect}
              className='p-2 sm:pe-5'
              disabled={[{ before: today }, disabled]}
            />

            {/* Time Slots Section */}
            <div className='relative w-full max-sm:h-48 sm:w-40'>
              <div className='absolute inset-0 py-4 max-sm:border-t'>
                <ScrollArea className='h-full sm:border-s'>
                  <div className='space-y-3'>
                    <div className='flex h-5 shrink-0 items-center px-5'>
                      <p className='text-sm font-medium'>
                        {format(selectedDate, 'EEEE, d')}
                      </p>
                    </div>

                    <div className='grid gap-1.5 px-5 max-sm:grid-cols-2'>
                      {availableTimeSlots.map((timeSlot) => (
                        <Button
                          key={timeSlot}
                          variant={
                            selectedTime === timeSlot ? 'default' : 'outline'
                          }
                          size='sm'
                          className='w-full'
                          disabled={disabled}
                          onClick={() => handleTimeSelect(timeSlot)}
                        >
                          {timeSlot}
                        </Button>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
