import React from 'react'
import { DropdownMenuRadioGroup } from '@radix-ui/react-dropdown-menu'
import { Option } from '@/types/data-table'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TaskPriority } from '@/features/tasks/types'
import { priorityStyles } from '@/features/tasks/utils/tasks'

interface InlineEditableDropdownProps {
  value: string | null
  onSave: (newValue: string) => void
  cellId?: string
  options: Option[]
  children: React.ReactNode
}

export function InlineEditableDropdown({
  value,
  onSave,
  options,
  children,
}: InlineEditableDropdownProps) {
  const handleSave = (newValue: string) => {
    if (newValue !== value) {
      onSave(newValue)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={value || undefined}
          onValueChange={handleSave}
          className='flex flex-col gap-2'
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className={cn('cursor-pointer')}
            >
              <div className='flex items-center gap-2'>
                {option.icon && (
                  <option.icon className={cn('h-3 w-3 bg-transparent')} />
                )}
                <span>{option.label}</span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
