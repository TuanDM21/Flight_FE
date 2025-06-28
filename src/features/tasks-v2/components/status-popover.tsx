import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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
import type { Task } from './types'

interface StatusPopoverProps {
  taskId: number
  currentStatus: Task['status']
  onStatusChange?: (status: Task['status']) => void
}

const statusConfig = {
  COMPLETED: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: '✓',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800',
    icon: '●',
  },
  OPEN: {
    label: 'Open',
    color: 'bg-gray-100 text-gray-800',
    icon: '○',
  },
}

type Status = Task['status']

const statuses: Status[] = ['OPEN', 'IN_PROGRESS', 'COMPLETED']

export function StatusPopover({
  taskId: _taskId,
  currentStatus,
  onStatusChange,
}: StatusPopoverProps) {
  const [open, setOpen] = useState(false)

  const handleSelectStatus = (status: Status) => {
    onStatusChange?.(status)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge
          variant='secondary'
          className={`flex-shrink-0 cursor-pointer border text-xs font-semibold transition-all hover:opacity-80 ${statusConfig[currentStatus].color}`}
        >
          <div className='flex items-center gap-1'>
            <span>{statusConfig[currentStatus].icon}</span>
            <span>{statusConfig[currentStatus].label}</span>
          </div>
        </Badge>
      </PopoverTrigger>
      <PopoverContent className='w-48 p-0' align='start'>
        <Command>
          <CommandList>
            <CommandEmpty>Không tìm thấy trạng thái nào.</CommandEmpty>
            <CommandGroup heading='Chọn trạng thái'>
              {statuses.map((status) => {
                const isSelected = currentStatus === status
                const config = statusConfig[status]
                return (
                  <CommandItem
                    key={status}
                    value={status}
                    onSelect={() => {
                      handleSelectStatus(status)
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <div className='flex h-4 w-4 items-center justify-center'>
                        <span className='text-sm'>{config.icon}</span>
                      </div>
                      <span className='text-sm'>{config.label}</span>
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
