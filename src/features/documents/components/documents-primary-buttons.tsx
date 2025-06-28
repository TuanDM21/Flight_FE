import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { IconPlus } from '@tabler/icons-react'
import { RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDocumentListQueryOptions } from '../hooks/use-documents'

export function DocumentsPrimaryButtons() {
  const navigate = useNavigate()
  const { refetch, isFetching } = useSuspenseQuery(
    getDocumentListQueryOptions()
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
          void navigate({ to: '/documents/create' })
        }}
      >
        <span>Tạo mới</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
