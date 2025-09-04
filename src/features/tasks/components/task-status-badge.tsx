import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { TaskStatus } from '@/features/tasks/types'
import {
  taskStatusIcons,
  taskStatusFilterLabels,
  taskStatusStyles,
} from '@/features/tasks/utils/tasks'

interface TaskStatusBadgeProps {
  status: TaskStatus
  showIcon?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function TaskStatusBadge({
  status,
  showIcon = true,
  className,
  size = 'md',
}: TaskStatusBadgeProps) {
  const label = taskStatusFilterLabels[status]
  const Icon = taskStatusIcons[status]
  const statusStyle = taskStatusStyles[status]

  return (
    <Badge
      className={cn(
        'border',
        statusStyle,
        size === 'sm' && 'h-5 px-1.5 py-0.5',
        size === 'md' && 'h-6 px-2 py-0.5',
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn('shrink-0', size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3')}
        />
      )}
      <span className='truncate'>{label}</span>
    </Badge>
  )
}
