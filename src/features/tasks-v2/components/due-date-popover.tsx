import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar, CalendarDays, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DueDatePopoverProps {
  taskId: string
  currentDueDate?: string | null
  onDueDateChange?: (dueDate: string | null) => void
}

const quickDates = [
  {
    label: 'Hôm nay',
    getValue: () => new Date(),
  },
  {
    label: 'Ngày mai',
    getValue: () => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date
    },
  },
  {
    label: 'Tuần tới',
    getValue: () => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      return date
    },
  },
  {
    label: 'Tháng tới',
    getValue: () => {
      const date = new Date()
      date.setMonth(date.getMonth() + 1)
      return date
    },
  },
]

export function DueDatePopover({
  taskId: _taskId,
  currentDueDate,
  onDueDateChange,
}: DueDatePopoverProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentDueDate ? new Date(currentDueDate) : undefined
  )

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd')
      onDueDateChange?.(dateString)
      setOpen(false)
    }
  }

  const handleQuickDate = (date: Date) => {
    handleSelectDate(date)
  }

  const handleRemoveDate = () => {
    setSelectedDate(undefined)
    onDueDateChange?.(null)
    setOpen(false)
  }

  const formatDisplayDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
    } catch {
      return dateString
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {currentDueDate ? (
          <div className='bg-muted/50 hover:bg-muted/70 flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 transition-all'>
            <Calendar className='text-muted-foreground h-3 w-3 flex-shrink-0' />
            <span className='text-xs font-medium'>
              {formatDisplayDate(currentDueDate)}
            </span>
          </div>
        ) : (
          <Button
            variant='ghost'
            size='sm'
            className='text-muted-foreground hover:text-foreground flex h-6 flex-shrink-0 items-center justify-start px-2 text-xs'
          >
            <Calendar className='mr-1 h-3 w-3 flex-shrink-0' />
            Set date
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Command>
          <CommandList className='max-h-none'>
            <div className='flex'>
              <div className='flex w-48 flex-col border-r'>
                {currentDueDate && (
                  <>
                    <CommandGroup>
                      <CommandItem
                        onSelect={handleRemoveDate}
                        className='text-destructive focus:text-destructive'
                      >
                        <X className='mr-2 h-4 w-4' />
                        <span>Xóa ngày hạn</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}
                <CommandGroup heading='Chọn nhanh'>
                  {quickDates.map((quick) => (
                    <CommandItem
                      key={quick.label}
                      value={quick.label}
                      onSelect={() => {
                        handleQuickDate(quick.getValue())
                      }}
                      className='cursor-pointer'
                    >
                      <CalendarDays className='text-muted-foreground mr-2 h-4 w-4' />
                      <span>{quick.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
              <CalendarComponent
                mode='single'
                selected={selectedDate}
                onSelect={handleSelectDate}
                initialFocus
                locale={vi}
                className='rounded-md border-0'
              />
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
