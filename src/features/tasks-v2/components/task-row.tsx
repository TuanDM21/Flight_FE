import { DraggableAttributes, useDraggable } from '@dnd-kit/core'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import {
  ChevronDown,
  ChevronRight,
  MessageSquare,
  GripVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Task } from '../types'
import { AssigneePopover } from './assignee-popover'
import { taskStatusConfig } from './config'
import { DueDatePopover } from './due-date-popover'
import { PriorityPopover } from './priority-popover'
import type { TaskRowProps } from './types'

// Constants
const GRID_LAYOUT = 'grid-cols-[32px_1.5fr_1fr_1fr_0.7fr_0.7fr_0.7fr]'
const INDENT_MULTIPLIER = 2

// Types
interface TaskRowExtraProps {
  onTaskClick?: (taskId: string) => void
}

interface DragProps {
  dragAttributes?: DraggableAttributes
  dragListeners?: SyntheticListenerMap
}

type TaskRowBaseProps = TaskRowProps & TaskRowExtraProps
type TaskRowWithDragProps = TaskRowBaseProps & DragProps

// Drag Handle Component
function DragHandle({
  dragAttributes,
  dragListeners,
}: Pick<DragProps, 'dragAttributes' | 'dragListeners'>) {
  return (
    <div className='flex items-center justify-center'>
      <div
        className='cursor-grab transition-opacity group-hover:opacity-60 hover:opacity-100'
        {...dragListeners}
        {...dragAttributes}
      >
        <GripVertical className='text-muted-foreground h-4 w-4' />
      </div>
    </div>
  )
}

// Task Expand/Collapse Button
function TaskToggleButton({
  hasSubtasks,
  expanded,
  onToggle,
}: {
  hasSubtasks: boolean
  expanded?: boolean
  onToggle?: () => void
}) {
  if (!hasSubtasks) return null

  return (
    <Button
      variant='ghost'
      size='sm'
      className='h-5 w-5 flex-shrink-0 p-0 opacity-60 hover:opacity-100'
      onClick={onToggle}
    >
      {expanded ? (
        <ChevronDown className='h-3 w-3' />
      ) : (
        <ChevronRight className='h-3 w-3' />
      )}
    </Button>
  )
}

// Task Status Icon
function TaskStatusIcon({ status }: { status: string }) {
  const statusConfig = taskStatusConfig[status] ?? {}

  return (
    <div
      className={cn(
        'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-current/10 font-semibold',
        statusConfig.color
      )}
    >
      <span className='text-xs'>{statusConfig.icon}</span>
    </div>
  )
}

// Task Title
function TaskTitle({
  task,
  onTaskClick,
}: {
  task: Task
  onTaskClick?: (taskId: string) => void
}) {
  return (
    <span
      className={cn(
        'text-foreground min-w-0 flex-1 cursor-pointer truncate font-medium hover:underline'
      )}
      onClick={() => onTaskClick?.(task.id)}
    >
      {task.title}
    </span>
  )
}

// Task Info Section (with hierarchy support)
function TaskInfo({
  task,
  level,
  expanded,
  onToggle,
  onTaskClick,
}: {
  task: Task
  level: number
  expanded?: boolean
  onToggle?: () => void
  onTaskClick?: (taskId: string) => void
}) {
  const hasSubtasks = task.subtasks && task.subtasks.length > 0

  return (
    <div
      className='flex min-w-0 flex-1 items-center gap-2'
      style={{ paddingLeft: `${level * INDENT_MULTIPLIER}rem` }}
    >
      <TaskToggleButton
        hasSubtasks={hasSubtasks}
        expanded={expanded}
        onToggle={onToggle}
      />
      <TaskStatusIcon status={task.status} />
      <TaskTitle task={task} onTaskClick={onTaskClick} />
    </div>
  )
}

// Assignee Section
function AssigneeSection({ task }: { task: any }) {
  return (
    <div className='flex items-center justify-start'>
      <AssigneePopover
        taskId={task.id}
        currentAssignees={task.assignees || []}
        onAssigneesChange={(assignees) => {
          void assignees
        }}
      />
    </div>
  )
}

// Due Date Section
function DueDateSection({ task }: { task: Task }) {
  return (
    <div className='flex items-center justify-start'>
      <DueDatePopover
        taskId={task.id}
        currentDueDate={task.dueDate}
        onDueDateChange={(dueDate) => {
          // TODO: Implement due date update logic
          void dueDate
        }}
      />
    </div>
  )
}

// Priority Section
function PrioritySection({ task }: { task: Task }) {
  return (
    <div className='flex items-center justify-start'>
      <PriorityPopover
        taskId={task.id}
        currentPriority={task.priority}
        onPriorityChange={(priority) => {
          // TODO: Implement priority update logic
          void priority
        }}
      />
    </div>
  )
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const statusConfig = taskStatusConfig[status] ?? {}

  return (
    <div className='flex items-center'>
      <span
        className={cn(
          'rounded bg-current/10 px-2 py-1 text-xs font-semibold',
          statusConfig.color
        )}
      >
        {statusConfig.label}
      </span>
    </div>
  )
}

// Comments Section
function CommentsSection({ task }: { task: Task }) {
  const hasComments = task.comments > 0

  if (hasComments) {
    return (
      <div className='flex items-center justify-end'>
        <div className='bg-muted/50 flex items-center gap-1 rounded-md px-2 py-1'>
          <MessageSquare className='text-muted-foreground h-3 w-3' />
          <span className='text-xs font-medium'>{task.comments}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='flex items-center justify-end'>
      <Button
        variant='ghost'
        size='sm'
        className='text-muted-foreground hover:text-foreground h-6 w-8 p-0 opacity-0 group-hover:opacity-100'
      >
        <MessageSquare className='h-3 w-3' />
      </Button>
    </div>
  )
}

// Main TaskRow Component
export function TaskRow({
  task,
  level = 0,
  expanded,
  onToggle,
  onTaskClick,
  dragAttributes,
  dragListeners,
}: TaskRowWithDragProps) {
  return (
    <div
      className={cn(
        'border-muted/10 group hover:bg-muted/20 grid items-center gap-2 border-b py-2 text-sm transition-all duration-200',
        GRID_LAYOUT
      )}
    >
      <DragHandle
        dragAttributes={dragAttributes}
        dragListeners={dragListeners}
      />

      <TaskInfo
        task={task}
        level={level}
        expanded={expanded}
        onToggle={onToggle}
        onTaskClick={onTaskClick}
      />

      <AssigneeSection task={task} />
      <DueDateSection task={task} />
      <PrioritySection task={task} />
      <StatusBadge status={task.status} />
      <CommentsSection task={task} />
    </div>
  )
}

// Higher-order component with drag functionality
export function TaskRowWithDrag({
  task,
  level = 0,
  expanded,
  onToggle,
  onTaskClick,
}: TaskRowBaseProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn('transition-all duration-200', isDragging && 'opacity-50')}
    >
      <TaskRow
        task={task}
        level={level}
        expanded={expanded}
        onToggle={onToggle}
        onTaskClick={onTaskClick}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  )
}
