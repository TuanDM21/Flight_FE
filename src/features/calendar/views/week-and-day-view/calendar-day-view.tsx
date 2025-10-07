import { useEffect, useRef } from 'react'
import { format, isWithinInterval } from 'date-fns'
import { dateFormatPatterns, getVietnameseDayName } from '@/config/date'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCalendar } from '@/features/calendar/contexts/calendar-context'
import { AddEditEventDialog } from '@/features/calendar/dialogs/add-edit-event-dialog'
import { DroppableArea } from '@/features/calendar/dnd/droppable-area'
import { groupEvents } from '@/features/calendar/helpers'
import type { IEvent } from '@/features/calendar/interfaces'
import { CalendarTimeline } from '@/features/calendar/views/week-and-day-view/calendar-time-line'
import { DayViewMultiDayEventsRow } from '@/features/calendar/views/week-and-day-view/day-view-multi-day-events-row'
import { RenderGroupedEvents } from '@/features/calendar/views/week-and-day-view/render-grouped-events'

interface IProps {
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
}

export function CalendarDayView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate, setSelectedDate, use24HourFormat } = useCalendar()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const hours = Array.from({ length: 12 }, (_, i) => i * 2)

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      if (!scrollAreaRef.current) return

      const scrollArea = scrollAreaRef.current
      const rect = scrollArea.getBoundingClientRect()
      const scrollSpeed = 15

      const scrollContainer =
        scrollArea.querySelector('[data-radix-scroll-area-viewport]') ||
        scrollArea

      if (e.clientY < rect.top + 60) {
        scrollContainer.scrollTop -= scrollSpeed
      }

      if (e.clientY > rect.bottom - 60) {
        scrollContainer.scrollTop += scrollSpeed
      }
    }

    document.addEventListener('dragover', handleDragOver)
    return () => {
      document.removeEventListener('dragover', handleDragOver)
    }
  }, [])

  const getCurrentEvents = (events: IEvent[]) => {
    const now = new Date()

    return (
      events.filter((event) =>
        isWithinInterval(now, {
          start: event.startDate,
          end: event.endDate,
        })
      ) || []
    )
  }

  const currentEvents = getCurrentEvents(singleDayEvents)

  const dayEvents = singleDayEvents.filter((event) => {
    const eventDate = new Date(event.startDate)
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    )
  })

  const groupedEvents = groupEvents(dayEvents)

  return (
    <div className='flex'>
      <div className='flex flex-1 flex-col'>
        <div>
          <DayViewMultiDayEventsRow
            selectedDate={selectedDate}
            multiDayEvents={multiDayEvents}
          />

          {/* Day header */}
          <div className='relative z-20 flex border-b'>
            <div className='w-18'></div>
            <span className='text-t-quaternary flex-1 border-l py-2 text-center text-xs font-medium'>
              {getVietnameseDayName(selectedDate)},{' '}
              <span className='text-t-secondary font-semibold'>
                {format(selectedDate, dateFormatPatterns.fullDate)}
              </span>
            </span>
          </div>
        </div>

        <ScrollArea className='h-[800px]' type='always' ref={scrollAreaRef}>
          <div className='flex'>
            {/* Hours column */}
            <div className='relative w-18'>
              {hours.map((hour, index) => (
                <div
                  key={hour}
                  className='relative'
                  style={{ height: '192px' }}
                >
                  <div className='absolute -top-3 right-2 flex h-6 items-center'>
                    {index !== 0 && (
                      <span className='text-t-quaternary text-xs'>
                        {format(
                          new Date().setHours(hour, 0, 0, 0),
                          use24HourFormat ? "HH'h'00" : "h'h' a"
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className='relative flex-1 border-l'>
              <div className='relative'>
                {hours.map((hour, index) => (
                  <div
                    key={hour}
                    className='relative'
                    style={{ height: '192px' }}
                  >
                    {index !== 0 && (
                      <div className='pointer-events-none absolute inset-x-0 top-0 border-b'></div>
                    )}

                    <DroppableArea
                      date={selectedDate}
                      hour={hour}
                      minute={0}
                      className='absolute inset-0'
                    >
                      <AddEditEventDialog
                        startDate={selectedDate}
                        startTime={{ hour, minute: 0 }}
                      >
                        <div className='hover:bg-secondary absolute inset-0 cursor-pointer transition-colors' />
                      </AddEditEventDialog>
                    </DroppableArea>
                  </div>
                ))}

                <RenderGroupedEvents
                  groupedEvents={groupedEvents}
                  day={selectedDate}
                />
              </div>

              <CalendarTimeline />
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className='hidden w-72 divide-y border-l md:block'>
        <Calendar
          className='mx-auto w-fit'
          mode='single'
          selected={selectedDate}
          onSelect={(date) => {
            if (date) setSelectedDate(date)
          }}
        />

        <div className='flex-1 space-y-3'>
          {currentEvents.length > 0 ? (
            <div className='flex items-start gap-2 px-4 pt-4'>
              <span className='relative mt-[5px] flex size-2.5'>
                <span className='absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75'></span>
                <span className='relative inline-flex size-2.5 rounded-full bg-green-600'></span>
              </span>

              <p className='text-t-secondary text-sm font-semibold'>
                Đang diễn ra
              </p>
            </div>
          ) : (
            <p className='text-t-tertiary p-4 text-center text-sm italic'>
              Hiện tại chưa có sự kiện nào đang diễn ra
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
