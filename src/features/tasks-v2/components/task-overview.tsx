import { Circle, Users, CheckCircle2, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { taskStatusConfig } from './config'
import { PriorityPopover } from './priority-popover'
import type { Task } from './types'

interface TaskOverviewProps {
  task: Task
  onTaskUpdate: (updates: Partial<Task>) => void
}

export function TaskOverview({ task, onTaskUpdate }: TaskOverviewProps) {
  return (
    <div className='space-y-6 p-6'>
      {/* Task Title */}
      <div>
        <h1 className='mb-4 text-2xl font-semibold'>{task.title}</h1>
      </div>

      {/* Properties Grid */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Left Column */}
        <div className='space-y-4'>
          {/* Status */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Circle className='h-4 w-4' />
              <span className='font-medium'>Status</span>
            </div>
            <Select
              value={task.status}
              onValueChange={(value) => {
                onTaskUpdate({ status: value as Task['status'] })
              }}
            >
              <SelectTrigger className='w-auto border-none p-0'>
                <Badge variant='secondary'>
                  {taskStatusConfig[task.status]?.label || 'Unknown'}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='OPEN'>
                  <div className='flex items-center gap-2'>
                    <Circle className='h-3 w-3' />
                    {taskStatusConfig.OPEN.label}
                  </div>
                </SelectItem>
                <SelectItem value='IN_PROGRESS'>
                  <div className='flex items-center gap-2'>
                    <RotateCcw className='h-3 w-3' />
                    {taskStatusConfig.IN_PROGRESS.label}
                  </div>
                </SelectItem>
                <SelectItem value='COMPLETED'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 className='h-3 w-3' />
                    Completed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Dates</span>
            </div>
            <div className='text-muted-foreground text-sm'>
              {task.startDate && task.dueDate ? (
                <>
                  {new Date(task.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  →{' '}
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </>
              ) : task.dueDate ? (
                `Due ${new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}`
              ) : (
                'No dates set'
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className='space-y-4'>
          {/* Assignees */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4' />
              <span className='font-medium'>Assignees</span>
            </div>
            <div className='flex items-center gap-1'>
              {task.assignments && task.assignments.length > 0 ? (
                task.assignments.slice(0, 3).map((assignment) => (
                  <div
                    key={assignment.assignmentId}
                    className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white'
                  >
                    {assignment.recipientUser?.name.charAt(0)}
                  </div>
                ))
              ) : (
                <span className='text-muted-foreground text-sm'>Empty</span>
              )}
            </div>
          </div>

          {/* Priority */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Priority</span>
            </div>
            <PriorityPopover
              taskId={task.id}
              currentPriority={task.priority}
              onPriorityChange={(priority) => {
                onTaskUpdate({ priority: priority as Task['priority'] })
              }}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className='mb-2 block text-sm font-medium'>Description</label>
        <Textarea
          placeholder='Describe what this task is about...'
          value={task.content || ''}
          onChange={(e) => {
            onTaskUpdate({ content: e.target.value })
          }}
          className='min-h-[100px] resize-none'
          rows={4}
        />
      </div>
    </div>
  )
}
