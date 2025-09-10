import { format } from 'date-fns'
import { dateFormatPatterns } from '@/config/date'
import {
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TaskAssignmentStatusBadge } from '@/features/tasks/components/task-assignment-status-badge'
import { TaskAssignment } from '@/features/tasks/types'

interface TaskAssignmentsCardProps {
  assignments: TaskAssignment[]
  isTaskOwner: boolean
}

interface TaskAssignmentItemProps {
  assignment: TaskAssignment
  index: number

  isTaskOwner: boolean
}

function TaskAssignmentItem({ assignment, index }: TaskAssignmentItemProps) {
  const recipientName =
    assignment.recipientUser?.name ??
    assignment.recipientTeamName ??
    assignment.recipientUnitName ??
    'Người dùng không xác định'

  return (
    <div
      key={assignment.assignmentId || index}
      className='hover:bg-muted/50 rounded-lg border p-3 transition-colors sm:p-4'
    >
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex min-w-0 flex-1 items-start space-x-3'>
          <Avatar className='h-8 w-8 shrink-0 sm:h-10 sm:w-10'>
            <AvatarFallback className='text-xs sm:text-sm'>
              {recipientName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
              <p className='truncate text-sm font-medium'>{recipientName}</p>
              {assignment.status && (
                <TaskAssignmentStatusBadge status={assignment.status} />
              )}
            </div>
            <div className='text-muted-foreground mt-2 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2'>
              {assignment.recipientUser?.email && (
                <div className='flex items-center space-x-2'>
                  <Mail className='h-3 w-3 shrink-0' />
                  <span className='truncate'>
                    {assignment.recipientUser.email}
                  </span>
                </div>
              )}
            </div>
            <div className='text-muted-foreground mt-2 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2'>
              {assignment.recipientUser?.email && (
                <div className='flex items-center space-x-2'>
                  <Mail className='h-3 w-3 shrink-0' />
                  <span className='truncate'>
                    {assignment.recipientUser.email}
                  </span>
                </div>
              )}
              {assignment.recipientUser?.teamName && (
                <div className='flex items-center space-x-2'>
                  <Building className='h-3 w-3 shrink-0' />
                  <span className='truncate'>
                    {assignment.recipientUser.teamName}
                  </span>
                </div>
              )}
              {assignment.assignedAt && (
                <div className='flex items-center space-x-2'>
                  <Clock className='h-3 w-3 shrink-0' />
                  <span className='truncate'>
                    <span className='hidden sm:inline'>Phân công vào </span>
                    <span className='sm:hidden'>Phân công: </span>
                    {format(
                      new Date(assignment.assignedAt),
                      dateFormatPatterns.fullDateTime
                    )}
                  </span>
                </div>
              )}
              {assignment.dueAt && (
                <div className='flex items-center space-x-2'>
                  <Calendar className='h-3 w-3 shrink-0' />
                  <span className='truncate'>
                    <span className='hidden sm:inline'>Hạn chót </span>
                    <span className='sm:hidden'>Hạn: </span>
                    {format(
                      new Date(assignment.dueAt),
                      dateFormatPatterns.fullDateTime
                    )}
                  </span>
                </div>
              )}
              {assignment.completedAt && (
                <div className='flex items-center space-x-2 sm:col-span-2'>
                  <CheckCircle className='h-3 w-3 shrink-0' />
                  <span className='truncate'>
                    <span className='hidden sm:inline'>Hoàn thành vào </span>
                    <span className='sm:hidden'>Hoàn thành: </span>
                    {format(
                      new Date(assignment.completedAt),
                      dateFormatPatterns.fullDateTime
                    )}
                  </span>
                </div>
              )}
            </div>
            {assignment.note && (
              <div className='bg-muted/50 mt-3 rounded-md p-2.5'>
                <p className='text-xs leading-relaxed break-words'>
                  {assignment.note}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TaskAssignmentsCard({
  assignments,
  isTaskOwner,
}: TaskAssignmentsCardProps) {
  if (!assignments || assignments.length === 0) {
    return (
      <Card>
        <CardContent className='text-muted-foreground py-8 text-center'>
          Không tìm thấy phân công nào.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center space-x-2 text-lg'>
          <Users className='h-5 w-5 shrink-0' />
          <span className='truncate'>Phân công ({assignments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='px-3 sm:px-6'>
        <ScrollArea className='max-h-96'>
          <div className='grid grid-cols-1 gap-3 pr-4 sm:gap-4 lg:grid-cols-2'>
            {assignments.map((assignment, index) => (
              <TaskAssignmentItem
                key={assignment.assignmentId || index}
                assignment={assignment}
                index={index}
                isTaskOwner={isTaskOwner}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
