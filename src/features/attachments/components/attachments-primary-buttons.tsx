import { useSuspenseQuery } from '@tanstack/react-query'
import { RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { myAttachmentsQueryOptions } from '../hooks/use-my-attachments'
import { AddFilesAction } from './add-files-action'

export function AttachmentsPrimaryButtons() {
  const { refetch, isFetching } = useSuspenseQuery(myAttachmentsQueryOptions())

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
        <span>{isFetching ? 'Đang làm mới...' : 'Làm mới'}</span>
        <RefreshCcw
          className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
        />
      </Button>
      <AddFilesAction />
    </div>
  )
}
