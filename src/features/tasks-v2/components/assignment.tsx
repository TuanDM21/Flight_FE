import { Clock, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Assignment as AssignmentType } from './types'

interface AssignmentProps {
  assignment: AssignmentType
}

const ASSIGNMENT_STATUS_COLORS = {
  WORKING: 'bg-blue-100 text-blue-800 border-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 border-green-300',
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
} as const

export function Assignment({ assignment }: AssignmentProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className='flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3'>
      <div className='flex items-center gap-3'>
        {/* Assignee Avatar */}
        <Avatar className='h-8 w-8'>
          <AvatarImage src='' alt={assignment.recipientUser.name} />
          <AvatarFallback className='text-xs'>
            {getInitials(assignment.recipientUser.name)}
          </AvatarFallback>
        </Avatar>

        {/* Assignee Info */}
        <div className='flex flex-col'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-gray-900'>
              {assignment.recipientUser.name}
            </span>
            <Badge
              variant='outline'
              className={`text-xs ${ASSIGNMENT_STATUS_COLORS[assignment.status as keyof typeof ASSIGNMENT_STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`}
            >
              {assignment.status}
            </Badge>
          </div>

          <div className='flex items-center gap-1 text-xs text-gray-500'>
            <User className='h-3 w-3' />
            <span>{assignment.recipientUser.roleName}</span>
            {assignment.recipientUser.teamName && (
              <>
                <span>•</span>
                <span>{assignment.recipientUser.teamName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Details */}
      <div className='text-right'>
        <div className='flex items-center gap-1 text-xs text-gray-500'>
          <Clock className='h-3 w-3' />
          <span>Assigned: {formatDate(assignment.assignedAt)}</span>
        </div>

        {assignment.dueAt && (
          <div className='text-xs text-red-600'>
            Due: {formatDate(assignment.dueAt)}
          </div>
        )}

        {assignment.completedAt && (
          <div className='text-xs text-green-600'>
            Completed: {formatDate(assignment.completedAt)}
          </div>
        )}
      </div>
    </div>
  )
}
