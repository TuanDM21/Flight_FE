import { Link } from '@tanstack/react-router'
import { TasksRoute } from '@/routes/_authenticated/tasks'
import { ChevronRight, PackagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDialogs } from '@/hooks/use-dialogs'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CreateSubTaskSheet } from './create-sub-task-sheet'

interface TaskHierarchyCellProps {
  taskId: number
  level: number
  isLastChild: boolean
  className?: string
  hasSubtask: boolean
  onToggleSubtasks?: (taskId: number) => void
}

export function TaskHierarchyCell({
  taskId,
  level,
  isLastChild,
  className,
  onToggleSubtasks,
  hasSubtask,
}: TaskHierarchyCellProps) {
  const searchParams = TasksRoute.useSearch()
  const filterType = searchParams.type
  const dialogs = useDialogs()

  const handleViewSubtask = async () => {
    if (onToggleSubtasks) {
      onToggleSubtasks(taskId)
    }
  }

  const handleOpenSubtaskSheet = () => {
    dialogs.sheet(CreateSubTaskSheet, {
      parentTaskId: taskId,
    })
  }

  return (
    <div className={cn('relative flex items-start', className)}>
      {level > 0 && (
        <>
          {/* Vertical line từ parent xuống */}
          <div
            className='absolute w-px bg-blue-300'
            style={{
              left: `${(level - 1) * 12 + 4}px`,
              top: '-24px',
              height: isLastChild ? 'calc(50% + 12px)' : '100%',
            }}
          />

          {/* Horizontal line kết nối đến item */}
          <div
            className='absolute top-1/2 h-4 w-4 -translate-y-4'
            style={{
              left: `${(level - 1) * 12 + 4}px`,
            }}
          >
            <div className='h-full w-full rounded-bl border-b border-l border-blue-300' />
          </div>
        </>
      )}

      <div
        className='relative flex items-center gap-1'
        style={{ marginLeft: level > 0 ? `${level * 14 + 8}px` : undefined }}
      >
        <Button
          variant='link'
          size='sm'
          className={cn('h-auto p-0', level > 0 && 'text-muted-foreground')}
        >
          <Link to='/tasks/$task-id' params={{ 'task-id': String(taskId) }}>
            #{taskId ?? 'N/A'}
          </Link>
        </Button>
        {filterType === 'assigned' && hasSubtask && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='size-8 rounded-full p-0'
                onClick={handleViewSubtask}
              >
                <ChevronRight />
                <span className='sr-only'>Hiện thị công việc con</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className='px-2 py-1 text-xs'>
              Hiện thị công việc con
            </TooltipContent>
          </Tooltip>
        )}
        {filterType === 'received' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='size-8 rounded-full p-0'
                onClick={handleOpenSubtaskSheet}
              >
                <PackagePlus />
                <span className='sr-only'>Thêm công việc con</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className='px-2 py-1 text-xs'>
              Thêm công việc con
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
