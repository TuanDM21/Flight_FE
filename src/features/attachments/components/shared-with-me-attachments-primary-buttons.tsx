import { useSuspenseQuery } from '@tanstack/react-query'
import { RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sharedWithMeAttachmentsQueryOptions } from '../hooks/use-shared-with-me-attachments'

export function SharedWithMeAttachmentsPrimaryButtons() {
  const { refetch, isFetching } = useSuspenseQuery(
    sharedWithMeAttachmentsQueryOptions()
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
        <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
        <RefreshCcw
          className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
        />
      </Button>
    </div>
  )
}
