'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { ActivitiesRoute } from '@/routes/_authenticated/activities'
import { vi } from 'date-fns/locale'
import { Calendar, Clock, MapPin, Pin, Text, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { activityDetailQueryOptions } from '@/features/activities/hooks/use-activity-detail'
import { useDeleteActivity } from '@/features/activities/hooks/use-delete-activity'
import { useCalendar } from '@/features/calendar/contexts/calendar-context'
import { AddEditEventDialog } from '@/features/calendar/dialogs/add-edit-event-dialog'
import { formatTime } from '@/features/calendar/helpers'

interface IProps {
  eventId: number
  children: ReactNode
}

export function EventDetailsDialog({ eventId, children }: IProps) {
  const [open, setOpen] = useState(false)
  const { use24HourFormat } = useCalendar()
  const searchParams = ActivitiesRoute.useSearch()
  const deleteActivityMutation = useDeleteActivity(searchParams)

  const {
    data: activityData,
    isLoading,
    error,
  } = useQuery({
    ...activityDetailQueryOptions(eventId),
    enabled: open,
  })
  const event = activityData?.data

  const deleteEvent = (eventId: number) => {
    const deletePromise = deleteActivityMutation.mutateAsync({
      params: {
        path: {
          id: eventId,
        },
      },
    })

    toast.promise(deletePromise, {
      loading: 'Đang xóa sự kiện...',
      success: () => {
        setOpen(false)
        return 'Đã xóa sự kiện thành công.'
      },
      error: (error) => error?.message || 'Lỗi khi xóa sự kiện.',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent aria-description='Chi tiết sự kiện'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {isLoading ? (
              <Skeleton className='h-6 w-48' />
            ) : (
              <>
                {event?.title}
                {event?.pinned && <Pin className='text-primary size-4' />}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className='max-h-[80vh]'>
          {isLoading ? (
            <div className='space-y-4'>
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
            </div>
          ) : error ? (
            <div className='text-destructive text-sm'>
              Không thể tải thông tin sự kiện. Vui lòng thử lại.
            </div>
          ) : event ? (
            <div className='space-y-4'>
              {event.location && (
                <div className='flex items-start gap-2'>
                  <MapPin className='text-muted-foreground mt-1 size-4 shrink-0' />
                  <div>
                    <p className='text-sm font-medium'>Địa điểm</p>
                    <p className='text-muted-foreground text-sm'>
                      {event.location}
                    </p>
                  </div>
                </div>
              )}

              {event.participants && event.participants.length > 0 && (
                <div className='flex items-start gap-2'>
                  <Users className='text-muted-foreground mt-1 size-4 shrink-0' />
                  <div>
                    <p className='text-sm font-medium'>Người tham gia</p>
                    <div className='space-y-1'>
                      {event.participants.map((participant) => (
                        <p
                          key={participant.id}
                          className='text-muted-foreground text-sm'
                        >
                          {participant.participantName}
                          {participant.participantType && (
                            <span className='bg-muted ml-2 rounded px-2 py-0.5 text-xs'>
                              {participant.participantType}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className='flex items-start gap-2'>
                <Calendar className='text-muted-foreground mt-1 size-4 shrink-0' />
                <div>
                  <p className='text-sm font-medium'>Thời gian bắt đầu</p>
                  <p className='text-muted-foreground text-sm'>
                    {format(parseISO(event.startDate), 'EEEE, dd MMMM yyyy', {
                      locale: vi,
                    })}
                    <span className='mx-1'>lúc</span>
                    {formatTime(parseISO(event.startDate), use24HourFormat)}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-2'>
                <Clock className='text-muted-foreground mt-1 size-4 shrink-0' />
                <div>
                  <p className='text-sm font-medium'>Thời gian kết thúc</p>
                  <p className='text-muted-foreground text-sm'>
                    {format(parseISO(event.endDate), 'EEEE, dd MMMM yyyy', {
                      locale: vi,
                    })}
                    <span className='mx-1'>lúc</span>
                    {formatTime(parseISO(event.endDate), use24HourFormat)}
                  </p>
                </div>
              </div>

              {event.description && (
                <div className='flex items-start gap-2'>
                  <Text className='text-muted-foreground mt-1 size-4 shrink-0' />
                  <div>
                    <p className='text-sm font-medium'>Mô tả</p>
                    <p className='text-muted-foreground text-sm'>
                      {event.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </ScrollArea>
        {!isLoading && event && event.id && (
          <div className='flex justify-end gap-2'>
            <AddEditEventDialog event={event as any}>
              <Button variant='outline'>Chỉnh sửa</Button>
            </AddEditEventDialog>
            <Button
              variant='destructive'
              onClick={() => {
                deleteEvent(event.id)
              }}
              disabled={deleteActivityMutation.isPending}
            >
              {deleteActivityMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        )}
        <DialogClose />
      </DialogContent>
    </Dialog>
  )
}
