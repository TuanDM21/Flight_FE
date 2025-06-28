import { useEffect, useState } from 'react'
import { Check, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  useAssignableUsers,
  type AssignableUser,
} from '../hooks/use-assignable-users'

interface AssigneePopoverProps {
  taskId: string
  currentAssignees?: string[]
  onAssigneesChange?: (assignees: string[]) => void
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function AssigneePopover({
  taskId: _taskId,
  currentAssignees = [],
  onAssigneesChange,
}: AssigneePopoverProps) {
  const [open, setOpen] = useState(false)
  const [selectedAssignees, setSelectedAssignees] =
    useState<string[]>(currentAssignees)
  const { data: users = [], isLoading } = useAssignableUsers()

  // Reset selected assignees when popover opens or currentAssignees changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setSelectedAssignees([...currentAssignees])
    }
  }

  // Sync selectedAssignees with currentAssignees when currentAssignees changes
  useEffect(() => {
    setSelectedAssignees([...currentAssignees])
  }, [currentAssignees])

  const handleToggleUser = (user: AssignableUser) => {
    const isCurrentlySelected = selectedAssignees.includes(user.name)
    setSelectedAssignees((prev) =>
      isCurrentlySelected
        ? prev.filter((name) => name !== user.name)
        : [...prev, user.name]
    )
  }

  const handleApplyChanges = () => {
    onAssigneesChange?.(selectedAssignees)
    setOpen(false)
  }

  const hasChanges =
    JSON.stringify(selectedAssignees.sort()) !==
    JSON.stringify(currentAssignees.sort())

  const hasAssignees = currentAssignees.length > 0

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {hasAssignees ? (
          <Button
            variant='ghost'
            size='sm'
            className='hover:bg-muted flex h-auto items-center gap-2 px-2 py-1'
          >
            {currentAssignees.length === 1 ? (
              <>
                <Avatar className='h-6 w-6 flex-shrink-0 border'>
                  <AvatarFallback className='text-xs font-semibold'>
                    {getInitials(currentAssignees[0])}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <>
                <div className='flex flex-shrink-0 -space-x-1'>
                  {currentAssignees.slice(0, 2).map((assignee) => (
                    <Avatar
                      key={assignee}
                      className='border-background h-6 w-6 border-2'
                    >
                      <AvatarFallback className='text-xs font-semibold'>
                        {getInitials(assignee)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {currentAssignees.length > 2 && (
                    <div className='bg-muted border-background flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-semibold'>
                      +{currentAssignees.length - 2}
                    </div>
                  )}
                </div>
                <Badge variant='secondary' className='flex-shrink-0 text-xs'>
                  {currentAssignees.length} người
                </Badge>
              </>
            )}
          </Button>
        ) : (
          <Button
            variant='ghost'
            size='sm'
            className='text-muted-foreground hover:text-foreground h-6 justify-start px-2 text-xs'
          >
            <User className='mr-1 h-3 w-3' />
            Assign
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='start'>
        <Command>
          <CommandInput placeholder='Tìm người thực hiện...' />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Đang tải...' : 'Không tìm thấy người dùng nào.'}
            </CommandEmpty>
            <CommandGroup heading='Chọn người thực hiện'>
              {users.map((user: AssignableUser) => {
                const isSelected = selectedAssignees.includes(user.name)
                return (
                  <CommandItem
                    key={user.id}
                    value={user.name}
                    onSelect={() => {
                      handleToggleUser(user)
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-6 w-6 border'>
                        <AvatarFallback className='text-xs'>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <span className='text-sm'>{user.name}</span>
                        {user.email && (
                          <span className='text-muted-foreground text-xs'>
                            {user.email}
                          </span>
                        )}
                      </div>
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
          {hasChanges && (
            <>
              <CommandSeparator />
              <div className='p-2'>
                <Button
                  onClick={handleApplyChanges}
                  className='w-full'
                  size='sm'
                >
                  Áp dụng thay đổi
                </Button>
              </div>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
