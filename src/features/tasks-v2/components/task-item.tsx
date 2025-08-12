import { ChevronDown, ChevronRight, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Assignment } from './assignment'
import { taskStatusConfig } from './config'
import { Subtask } from './subtask'
import type { Task } from './types'

interface TaskItemProps {
  task: Task
  level?: number
  expanded?: boolean
  onToggle?: () => void
  onTaskClick?: (taskId: number) => void
  showSubtasks?: boolean
}

const PRIORITY_COLORS = {
  URGENT: 'bg-red-500 text-white',
  HIGH: 'bg-orange-500 text-white',
  NORMAL: 'bg-blue-500 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  LOW: 'bg-gray-500 text-white',
} as const

const STATUS_COLORS = {
  OPEN: 'bg-gray-100 text-gray-800 border-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
  COMPLETE: 'bg-green-100 text-green-800 border-green-300',
  TO_DO: 'bg-purple-100 text-purple-800 border-purple-300',
} as const

export function TaskItem({
  task,
  level = 0,
  expanded = false,
  onToggle,
  onTaskClick,
  showSubtasks = true,
}: TaskItemProps) {
  const hasSubtasks = task.subtasks && task.subtasks.length > 0
  const indentLevel = level * 1.5

  return (
    <div className='space-y-2'>
      {/* Main Task Row */}
      <div
        className={cn(
          'rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md',
          'space-y-3 p-4'
        )}
        style={{ marginLeft: `${indentLevel}rem` }}
      >
        {/* Header Row */}
        <div className='flex items-center justify-between'>
          <div className='flex min-w-0 flex-1 items-center gap-3'>
            {/* Expand/Collapse Button */}
            {hasSubtasks && showSubtasks && (
              <Button
                variant='ghost'
                size='sm'
                className='h-6 w-6 flex-shrink-0 p-0'
                onClick={onToggle}
              >
                {expanded ? (
                  <ChevronDown className='h-4 w-4' />
                ) : (
                  <ChevronRight className='h-4 w-4' />
                )}
              </Button>
            )}

            {/* Task Title */}
            <h3
              className='flex-1 cursor-pointer truncate font-semibold text-gray-900 hover:text-blue-600'
              onClick={() => onTaskClick?.(task.id)}
            >
              {task.title}
            </h3>

            {/* Quick Actions */}
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 flex-shrink-0 p-0'
              onClick={() => onTaskClick?.(task.id)}
            >
              <Eye className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Status and Priority Row */}
        <div className='flex flex-wrap items-center gap-2'>
          <Badge
            variant='outline'
            className={cn('text-xs', STATUS_COLORS[task.status])}
          >
            {taskStatusConfig[task.status]?.label || task.status}
          </Badge>

          <Badge className={cn('text-xs', PRIORITY_COLORS[task.priority])}>
            {task.priority}
          </Badge>

          {hasSubtasks && (
            <Badge variant='secondary' className='text-xs'>
              {task.subtasks.length} subtask
              {task.subtasks.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Content Preview */}
        {task.content && (
          <p className='line-clamp-2 text-sm text-gray-600'>{task.content}</p>
        )}

        {/* Assignments Section */}
        {task.assignments && task.assignments.length > 0 && (
          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-gray-700'>Assignments:</h4>
            <div className='space-y-1'>
              {task.assignments.map((assignment) => (
                <Assignment
                  key={assignment.assignmentId}
                  assignment={assignment}
                />
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className='flex items-center justify-between text-xs text-gray-500'>
          <span>Created by: {task.createdByUser.name}</span>
          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Subtasks Section */}
      {hasSubtasks && expanded && showSubtasks && (
        <div className='space-y-2'>
          {task.subtasks.map((subtask) => (
            <Subtask
              key={subtask.id}
              task={subtask}
              level={level + 1}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
