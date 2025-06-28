import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { IconPlus } from '@tabler/icons-react'
import { TasksRoute } from '@/routes/_authenticated/tasks'
import { RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { tasksQueryOptions } from '../hooks/use-tasks'

export function TasksPrimaryButtons() {
  const navigate = useNavigate()

  const searchParams = TasksRoute.useSearch()
  const currentType = searchParams.type || 'assigned'

  const { refetch, isFetching } = useSuspenseQuery(
    tasksQueryOptions(currentType)
  )

  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => {
          handleRefresh()
        }}
        disabled={isFetching}
      >
        <span>{isFetching ? 'Đang tải lại...' : 'Tải lại'}</span>
        <RefreshCcw
          className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
        />
      </Button>
      <Button
        className='space-x-1'
        onClick={() => {
          void navigate({ to: '/tasks/create' })
        }}
      >
        <span>Tạo mới</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
