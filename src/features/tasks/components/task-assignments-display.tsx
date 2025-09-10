import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Building2, Mail, Users, UserSearch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDialogs } from '@/hooks/use-dialogs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Task, TaskAssignment, TaskFilterTypes } from '../types'
import { TaskAssignmentStatusBadge } from './task-assignment-status-badge'
import { TaskAssignmentsDialog } from './task-assignments-dialog'

interface TaskAssignmentsDisplayProps {
  assignments: TaskAssignment[]
  maxVisible?: number
  task: Task
  filterType: TaskFilterTypes
  allowCellEditing: boolean
}

export function TaskAssignmentsDisplay({
  assignments,
  task,
  filterType,
  allowCellEditing,
}: TaskAssignmentsDisplayProps) {
  const users = assignments
    ?.map(
      (assignment) =>
        assignment.recipientUser ||
        assignment.recipientTeamLead ||
        assignment.recipientUnitLead
    )
    .filter(Boolean)
  const names = users.map((user) => user?.name || '').filter(Boolean)
  const dialogs = useDialogs()

  const handleViewAssignments = async () => {
    await dialogs.open(TaskAssignmentsDialog, {
      task,
      filterType,
      allowCellEditing,
    })
  }

  return (
    <div className='flex items-center -space-x-2'>
      <Popover>
        <PopoverTrigger asChild>
          <div className='flex items-center gap-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn('transition-all duration-300 ease-in-out')}>
                  <Button
                    size='icon'
                    variant='outline'
                    className='hover:border-primary hover:bg-primary/5 size-8 rounded-full border-2 border-dashed transition-all duration-200 hover:border-solid'
                    onClick={handleViewAssignments}
                  >
                    <UserSearch className='size-4' />
                    <span className='sr-only'> Danh sách phân công</span>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent className='px-2 py-1 text-xs'>
                Danh sách phân công
              </TooltipContent>
            </Tooltip>
            {users.length > 0 && (
              <Avatar className='ring-background hover:ring-primary/20 cursor-pointer ring-2 transition-all duration-200 ease-out hover:shadow-lg'>
                <AvatarFallback className='bg-muted text-xs font-medium'>
                  +{names.length}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </PopoverTrigger>

        {users.length > 0 && (
          <PopoverContent className='w-80 p-2 pr-0'>
            <ScrollArea className='max-h-72 w-full overflow-y-auto'>
              <div className='space-y-3'>
                {names.map((name, index) => {
                  const user = users[index]
                  const assignment = assignments[index]
                  return (
                    <div
                      key={index}
                      className='space-y-1 border-b pb-2 last:border-b-0'
                    >
                      <p className='truncate text-sm font-medium'>{name}</p>
                      {user?.email && (
                        <p className='text-muted-foreground flex min-w-0 items-center gap-1 text-sm'>
                          <Mail className='h-3 w-3 flex-shrink-0' />
                          <span className='truncate'>{user.email}</span>
                        </p>
                      )}
                      {user?.teamName && (
                        <p className='text-muted-foreground flex min-w-0 items-center gap-1 text-sm'>
                          <Users className='h-3 w-3 flex-shrink-0' />
                          <span className='truncate'>{user.teamName}</span>
                        </p>
                      )}
                      {user?.unitName && (
                        <p className='text-muted-foreground flex min-w-0 items-center gap-1 text-sm'>
                          <Building2 className='h-3 w-3 flex-shrink-0' />
                          <span className='truncate'>{user.unitName}</span>
                        </p>
                      )}
                      {assignment && assignment.status && (
                        <div className='space-y-1 pt-1'>
                          <div className='flex items-center gap-2'>
                            <span className='text-muted-foreground text-xs'>
                              Trạng thái:
                            </span>
                            <TaskAssignmentStatusBadge
                              status={assignment.status}
                              size='sm'
                            />
                          </div>
                          {assignment.dueAt && (
                            <div className='flex items-center gap-2'>
                              <span className='text-muted-foreground text-xs'>
                                Hạn:
                              </span>
                              <span className='text-xs'>
                                {format(
                                  new Date(assignment.dueAt),
                                  'dd/MM/yyyy HH:mm',
                                  { locale: vi }
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </PopoverContent>
        )}
      </Popover>
    </div>
  )
}
