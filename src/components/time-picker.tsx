'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ClockIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TimePickerProps {
  value?: Date
  onChange?: (time: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'HH:mm',
  className,
}: TimePickerProps) {
  const [time, setTime] = React.useState<Date | undefined>(value)
  const [isOpen, setIsOpen] = React.useState(false)

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    const currentTime = time || new Date()
    // Set to today's date but only care about time
    const newTime = new Date()
    newTime.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0)

    if (type === 'hour') {
      newTime.setHours(Number.parseInt(value))
    } else if (type === 'minute') {
      newTime.setMinutes(Number.parseInt(value))
    }
    setTime(newTime)
    onChange?.(newTime)
  }

  React.useEffect(() => {
    setTime(value)
  }, [value])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal',
            !time && 'text-muted-foreground',
            className
          )}
        >
          <ClockIcon className='mr-2 h-4 w-4' />
          {time ? format(time, 'HH:mm') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <div className='flex flex-col divide-y sm:flex-row sm:divide-x sm:divide-y-0'>
          <ScrollArea className='h-[300px] w-20'>
            <div className='flex flex-col p-2'>
              {hours.map((hour) => (
                <Button
                  key={hour}
                  size='sm'
                  variant={
                    time && time.getHours() === hour ? 'default' : 'ghost'
                  }
                  className='mb-1 h-8 w-full justify-center text-sm'
                  onClick={() => {
                    handleTimeChange('hour', hour.toString())
                  }}
                >
                  {hour.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
          </ScrollArea>
          <ScrollArea className='h-[300px] w-20'>
            <div className='flex flex-col p-2'>
              {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                <Button
                  key={minute}
                  size='sm'
                  variant={
                    time && time.getMinutes() === minute ? 'default' : 'ghost'
                  }
                  className='mb-1 h-8 w-full justify-center text-sm'
                  onClick={() => {
                    handleTimeChange('minute', minute.toString())
                  }}
                >
                  {minute.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
