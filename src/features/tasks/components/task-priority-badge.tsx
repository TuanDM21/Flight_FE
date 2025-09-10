import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { TaskPriority } from '../types'
import { priorityIcons, priorityLabels, priorityStyles } from '../utils'

interface TaskPriorityBadgeProps {
  priority: TaskPriority
  showIcon?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function TaskPriorityBadge({
  priority,
  showIcon = true,
  className,
  size = 'md',
}: TaskPriorityBadgeProps) {
  const label = priorityLabels[priority]
  const style = priorityStyles[priority]
  const Icon = priorityIcons[priority]

  return (
    <Badge
      className={cn(
        'border',
        style,
        size === 'sm' && 'h-5 px-1.5 py-0.5',
        size === 'md' && 'h-6 px-2 py-0.5',
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')}
        />
      )}
      <span className='truncate'>{label}</span>
    </Badge>
  )
}

export default TaskPriorityBadge
