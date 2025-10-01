'use client'

import type { ReactNode } from 'react'
import { format, parseISO, differenceInMinutes } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Clock,
  Edit,
  FileText,
  MapPin,
  Pin,
  Trash2,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useCalendar } from '@/features/activities/components/calendar/contexts/calendar-context'
import { AddEditEventDialog } from '@/features/activities/components/calendar/dialogs/add-edit-event-dialog'
import { formatTime } from '@/features/activities/components/calendar/helpers'
import type { IEvent } from '@/features/activities/components/calendar/interfaces'

interface IProps {
  event: IEvent
  children: ReactNode
}

export function EventDetailsDialog({ event, children }: IProps) {
  const startTime = parseISO(event.startTime)
  const endTime = parseISO(event.endTime)
  const { use24HourFormat, removeEvent } = useCalendar()

  const deleteEvent = (eventId: number) => {
    removeEvent(eventId)
  }

  // Calculate duration
  const durationMinutes = differenceInMinutes(endTime, startTime)
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  const durationText =
    hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` : `${minutes}m`

  // Participant type mapping for Vietnamese
  const participantTypeLabels = {
    USER: 'Cá nhân',
    TEAM: 'Đội',
    UNIT: 'Tổ',
  } as const

  const participantTypeStyles = {
    USER: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    TEAM: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
    UNIT: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  } as const

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='flex h-[90vh] max-h-screen w-full !max-w-3xl flex-col pr-1'>
        <DialogHeader className='space-y-3 pb-6'>
          <div className='flex items-start justify-between'>
            <div className='flex-1 space-y-2'>
              <DialogTitle className='text-xl leading-tight font-semibold'>
                {event.name}
              </DialogTitle>
              <div className='flex items-center gap-2'>
                {event.pinned && (
                  <Badge variant='secondary' className='gap-1'>
                    <Pin className='size-3' />
                    Ghim
                  </Badge>
                )}
                <Badge variant='outline' className='gap-1'>
                  <Clock className='size-3' />
                  {durationText}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className='flex-1 overflow-y-auto pr-4'>
          <div className='space-y-6'>
            {/* Location */}
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-start gap-3'>
                  <MapPin className='text-muted-foreground mt-0.5 size-5 shrink-0' />
                  <div className='space-y-1'>
                    <p className='text-foreground text-sm font-medium'>
                      Địa điểm
                    </p>
                    <p className='text-muted-foreground'>{event.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardContent className='space-y-4 p-4'>
                <div className='flex items-center gap-2'>
                  <CalendarIcon className='text-muted-foreground size-5' />
                  <p className='text-foreground text-sm font-medium'>
                    Thời gian
                  </p>
                </div>

                <div className='ml-7 grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-1'>
                    <p className='text-foreground text-sm font-medium'>
                      Bắt đầu
                    </p>
                    <p className='text-muted-foreground'>
                      {format(startTime, 'EEEE, dd MMMM yyyy', { locale: vi })}
                    </p>
                    <p className='text-primary font-mono text-sm'>
                      {formatTime(startTime, use24HourFormat)}
                    </p>
                  </div>

                  <div className='space-y-1'>
                    <p className='text-foreground text-sm font-medium'>
                      Kết thúc
                    </p>
                    <p className='text-muted-foreground'>
                      {format(endTime, 'EEEE, dd MMMM yyyy', { locale: vi })}
                    </p>
                    <p className='text-primary font-mono text-sm'>
                      {formatTime(endTime, use24HourFormat)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            {event.participants && event.participants.length > 0 && (
              <Card>
                <CardContent className='p-4'>
                  <div className='mb-4 flex items-center gap-2'>
                    <Users className='text-muted-foreground size-5' />
                    <p className='text-foreground text-sm font-medium'>
                      Người tham gia ({event.participants.length})
                    </p>
                  </div>

                  <div className='ml-7 space-y-3'>
                    {event.participants.map((participant, index) => (
                      <div
                        key={`${participant.participantType}-${participant.participantId}-${index}`}
                        className='bg-muted/30 flex items-center justify-between rounded-lg border p-3'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='flex flex-col'>
                            <p className='font-medium'>
                              {participant.participantName}
                            </p>
                            <p className='text-muted-foreground text-sm'>
                              ID: {participant.participantId}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`${participantTypeStyles[participant.participantType as keyof typeof participantTypeStyles]} border`}
                        >
                          {
                            participantTypeLabels[
                              participant.participantType as keyof typeof participantTypeLabels
                            ]
                          }
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {event.notes && (
              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-start gap-3'>
                    <FileText className='text-muted-foreground mt-0.5 size-5 shrink-0' />
                    <div className='flex-1 space-y-2'>
                      <p className='text-foreground text-sm font-medium'>
                        Ghi chú
                      </p>
                      <div className='prose prose-sm text-muted-foreground max-w-none'>
                        <p className='leading-relaxed whitespace-pre-wrap'>
                          {event.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <Separator className='my-4' />

        <div className='flex justify-end gap-3 pr-4'>
          <AddEditEventDialog event={event}>
            <Button variant='outline' className='gap-2'>
              <Edit className='size-4' />
              Chỉnh sửa
            </Button>
          </AddEditEventDialog>
          <Button
            variant='destructive'
            className='gap-2'
            onClick={() => {
              deleteEvent(event.id)
            }}
          >
            <Trash2 className='size-4' />
            Xóa
          </Button>
        </div>
        <DialogClose />
      </DialogContent>
    </Dialog>
  )
}
