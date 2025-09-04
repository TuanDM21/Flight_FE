import { useQuery } from '@tanstack/react-query'
import { IconPlus } from '@tabler/icons-react'
import { TasksRoute } from '@/routes/_authenticated/tasks'
import { RefreshCcw } from 'lucide-react'
import { useDialogs } from '@/hooks/use-dialogs'
import { Button } from '@/components/ui/button'
import { tasksQueryOptions } from '../hooks/use-tasks'
import { CreateTaskSheet } from './create-task-sheet'

export function TasksPrimaryButtons() {
  const searchParams = TasksRoute.useSearch()
  const currentType = searchParams.type || 'assigned'

  const { refetch, isFetching } = useQuery({
    ...tasksQueryOptions({
      type: currentType,
    }),
    enabled: false,
  })

  const dialogs = useDialogs()

  const handleOpenCreateTaskSheet = () => {
    dialogs.sheet(CreateTaskSheet, {})
  }

  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => void handleRefresh()}
        disabled={isFetching}
      >
        <span>{isFetching ? 'Đang tải lại...' : 'Tải lại'}</span>
        <RefreshCcw
          className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
        />
      </Button>
      {currentType !== 'received' && (
        <Button className='space-x-1' onClick={handleOpenCreateTaskSheet}>
          <span>Tạo mới</span> <IconPlus size={18} />
        </Button>
      )}
    </div>
  )
}
