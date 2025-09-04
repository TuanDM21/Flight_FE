import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Mail, Users, Building2, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDialogs } from '@/hooks/use-dialogs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Task, TaskAssignment } from '../types'
import { TaskAssignmentStatusBadge } from './task-assignment-status-badge'
import { TaskAssignmentsDialog } from './task-assignments-dialog'

interface TaskAssignmentsDisplayProps {
  assignments: TaskAssignment[]
  maxVisible?: number
  task: Task
}

const getInitials = (name: string) => {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function TaskAssignmentsDisplay({
  assignments,
  maxVisible = 3,
  task,
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
    })
  }

  if (names.length === 0) {
    return (
      <div className='text-muted-foreground flex items-center gap-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('transition-all duration-300 ease-in-out')}>
              <Button
                size='icon'
                variant='outline'
                className='rounded-full border-2 border-dashed hover:border-solid'
                onClick={handleViewAssignments}
              >
                <UserPlus className='size-4' />
                <span className='sr-only'> Thêm phân công</span>
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent className='px-2 py-1 text-xs'>
            Thêm phân công
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  const visibleNames = names.slice(0, maxVisible)
  const extraCount = names.length - maxVisible

  return (
    <div className='flex items-center -space-x-2'>
      {visibleNames.map((name, index) => {
        const user = users[index]
        const assignment = assignments[index]
        return (
          <HoverCard key={index} openDelay={100} closeDelay={0}>
            <HoverCardTrigger asChild>
              <Avatar
                className={cn(
                  'ring-background cursor-pointer ring-2 transition-all duration-300 ease-in-out hover:shadow-md',
                  names.length > 1 ? 'hover:z-1 hover:-translate-y-1' : ''
                )}
                onClick={handleViewAssignments}
              >
                <AvatarFallback className='text-xs'>
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent className='max-w-72 p-3'>
              <div className='space-y-2'>
                <p className='truncate text-sm'>{name}</p>
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
                  <div className='space-y-1'>
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
            </HoverCardContent>
          </HoverCard>
        )
      })}

      {extraCount > 0 && (
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Avatar className='ring-background cursor-pointer ring-2'>
              <AvatarFallback className='text-xs'>+{extraCount}</AvatarFallback>
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent className='max-w-72 p-2 pr-0'>
            <ScrollArea className='max-h-72 w-full overflow-y-auto'>
              <div className='space-y-3'>
                {names.slice(maxVisible).map((name, index) => {
                  const userIndex = index + maxVisible
                  const user = users[userIndex]
                  const assignment = assignments[userIndex]
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
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  )
}
