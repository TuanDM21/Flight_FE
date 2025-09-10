import { useQuery } from '@tanstack/react-query'
import { IconPlus } from '@tabler/icons-react'
import { RefreshCcw } from 'lucide-react'
import { useDialogs } from '@/hooks/use-dialogs'
import { Button } from '@/components/ui/button'
import { tasksQueryOptions } from '../hooks/use-tasks'
import { TaskFilterTypes } from '../types'
import { CreateTaskSheet } from './create-task-sheet'

interface TasksPrimaryButtonsProps {
  filterType: TaskFilterTypes
}

export function TasksPrimaryButtons({ filterType }: TasksPrimaryButtonsProps) {
  const { refetch, isFetching } = useQuery({
    ...tasksQueryOptions({
      type: filterType,
    }),
    enabled: false,
  })

  const dialogs = useDialogs()

  const handleOpenCreateTaskSheet = () => {
    dialogs.sheet(CreateTaskSheet, {
      filterType,
    })
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
      {filterType !== 'received' && (
        <Button className='space-x-1' onClick={handleOpenCreateTaskSheet}>
          <span>Tạo mới</span> <IconPlus size={18} />
        </Button>
      )}
    </div>
  )
}
