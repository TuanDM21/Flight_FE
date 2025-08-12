import { useState } from 'react'
import { Check, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { priorityConfig } from './config'
import type { Task } from './types'

interface PriorityPopoverProps {
  taskId: number
  currentPriority?: Task['priority'] | null
  onPriorityChange?: (priority: Task['priority'] | null) => void
}

type Priority = Task['priority']

const priorities: Priority[] = ['URGENT', 'HIGH', 'NORMAL', 'MEDIUM', 'LOW']

export function PriorityPopover({
  taskId: _taskId,
  currentPriority,
  onPriorityChange,
}: PriorityPopoverProps) {
  const [open, setOpen] = useState(false)

  const handleSelectPriority = (priority: Priority) => {
    onPriorityChange?.(priority)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {currentPriority ? (
          <Badge
            variant='secondary'
            className='cursor-pointer border text-xs font-semibold transition-all hover:opacity-80'
          >
            <div className='flex items-center rounded-full'>
              {priorityConfig[currentPriority].label}
            </div>
          </Badge>
        ) : (
          <Button
            variant='ghost'
            size='sm'
            className='text-muted-foreground hover:text-foreground flex h-6 items-center justify-start px-2 text-xs'
          >
            <Flag className='mr-1 h-3 w-3 flex-shrink-0' />
            Priority
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className='w-48 p-0' align='start'>
        <Command>
          <CommandList>
            <CommandEmpty>Không tìm thấy độ ưu tiên nào.</CommandEmpty>
            <CommandGroup heading='Chọn độ ưu tiên'>
              {priorities.map((priority) => {
                const isSelected = currentPriority === priority
                return (
                  <CommandItem
                    key={priority}
                    value={priority}
                    onSelect={() => {
                      handleSelectPriority(priority)
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <div className={`h-3 w-3 rounded-full`}></div>
                      <span className='text-sm'>
                        {priorityConfig[priority].label}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
