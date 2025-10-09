import type { ReactNode } from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/responsive-modal'
import { useCalendar } from '@/features/calendar/contexts/calendar-context'
import { EventDetailsDialog } from '@/features/calendar/dialogs/event-details-dialog'
import { formatTime } from '@/features/calendar/helpers'
import type { IEvent } from '@/features/calendar/interfaces'
import { EventBullet } from '@/features/calendar/views/month-view/event-bullet'

interface EventListDialogProps {
  date: Date
  events: IEvent[]
  maxVisibleEvents?: number
  children?: ReactNode
}

export function EventListDialog({
  date,
  events,
  maxVisibleEvents = 3,
  children,
}: EventListDialogProps) {
  const cellEvents = events
  const hiddenEventsCount = Math.max(cellEvents.length - maxVisibleEvents, 0)
  const { use24HourFormat } = useCalendar()

  const defaultTrigger = (
    <span className='cursor-pointer'>
      <span className='sm:hidden'>+{hiddenEventsCount}</span>
      <span className='my-1 hidden rounded-xl border px-2 py-0.5 sm:inline'>
        {hiddenEventsCount}
        <span className='mx-1'>more...</span>
      </span>
    </span>
  )

  return (
    <Modal>
      <ModalTrigger asChild>{children || defaultTrigger}</ModalTrigger>
      <ModalContent className='sm:max-w-[425px]'>
        <ModalHeader>
          <ModalTitle className='my-2'>
            <div className='flex items-center gap-2'>
              <EventBullet color='blue' className='' />
              <p className='text-sm font-medium'>
                Events on {format(date, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </ModalTitle>
        </ModalHeader>
        <div className='max-h-[60vh] space-y-2 overflow-y-auto'>
          {cellEvents.length > 0 ? (
            cellEvents.map((event) => (
              <EventDetailsDialog eventId={event.id} key={event.id}>
                <div
                  className={cn(
                    'hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border p-2'
                  )}
                >
                  <EventBullet color='blue' />
                  <div className='flex w-full items-center justify-between'>
                    <p className='text-sm font-medium'>{event.title}</p>
                    <p className='text-xs'>
                      {formatTime(event.startDate, use24HourFormat)}
                    </p>
                  </div>
                </div>
              </EventDetailsDialog>
            ))
          ) : (
            <p className='text-muted-foreground text-sm'>
              No events for this date.
            </p>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}
