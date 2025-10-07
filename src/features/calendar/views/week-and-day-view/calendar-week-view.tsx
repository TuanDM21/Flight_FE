import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns'
import { getVietnameseDayName } from '@/config/date'
import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  fadeIn,
  staggerContainer,
  transition,
} from '@/features/calendar/animations'
import { useCalendar } from '@/features/calendar/contexts/calendar-context'
import { AddEditEventDialog } from '@/features/calendar/dialogs/add-edit-event-dialog'
import { DroppableArea } from '@/features/calendar/dnd/droppable-area'
import { groupEvents } from '@/features/calendar/helpers'
import type { IEvent } from '@/features/calendar/interfaces'
import { CalendarTimeline } from '@/features/calendar/views/week-and-day-view/calendar-time-line'
import { RenderGroupedEvents } from '@/features/calendar/views/week-and-day-view/render-grouped-events'
import { WeekViewMultiDayEventsRow } from '@/features/calendar/views/week-and-day-view/week-view-multi-day-events-row'

interface IProps {
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
}

export function CalendarWeekView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate, use24HourFormat } = useCalendar()

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const hours = Array.from({ length: 12 }, (_, i) => i * 2)

  return (
    <motion.div
      initial='initial'
      animate='animate'
      exit='exit'
      variants={fadeIn}
      transition={transition}
    >
      <motion.div
        className='flex flex-col items-center justify-center border-b p-4 text-sm sm:hidden'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <p>Chế độ xem tuần không được khuyến nghị trên thiết bị nhỏ.</p>
        <p>
          Vui lòng chuyển sang thiết bị máy tính hoặc sử dụng chế độ xem ngày.
        </p>
      </motion.div>

      <motion.div className='flex-col sm:flex' variants={staggerContainer}>
        <div>
          <WeekViewMultiDayEventsRow
            selectedDate={selectedDate}
            multiDayEvents={multiDayEvents}
          />

          {/* Week header */}
          <motion.div
            className='relative z-20 flex border-b'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
          >
            {/* Time column header - responsive width */}
            <div className='w-18'></div>
            <div className='grid flex-1 grid-cols-7 border-l'>
              {weekDays.map((day, index) => (
                <motion.span
                  key={index}
                  className='text-t-quaternary py-1 text-center text-xs font-medium sm:py-2'
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, ...transition }}
                >
                  {/* Mobile: Show only day abbreviation and number */}
                  <span className='block sm:hidden'>
                    {getVietnameseDayName(day).charAt(0)}
                    <span className='text-t-secondary block text-xs font-semibold'>
                      {format(day, 'd')}
                    </span>
                  </span>
                  {/* Desktop: Show full format */}
                  <span className='hidden sm:inline'>
                    {getVietnameseDayName(day)}{' '}
                    <span className='text-t-secondary ml-1 font-semibold'>
                      {format(day, 'd')}
                    </span>
                  </span>
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        <ScrollArea className='h-[800px]' type='always'>
          <div className='flex'>
            {/* Hours column */}
            <motion.div className='relative w-18' variants={staggerContainer}>
              {hours.map((hour, index) => (
                <motion.div
                  key={hour}
                  className='relative'
                  style={{ height: '192px' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02, ...transition }}
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
                </motion.div>
              ))}
            </motion.div>

            {/* Week grid */}
            <motion.div
              className='relative flex-1 border-l'
              variants={staggerContainer}
            >
              <div className='grid grid-cols-7 divide-x'>
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = singleDayEvents.filter(
                    (event) =>
                      isSameDay(parseISO(event.startDate), day) ||
                      isSameDay(parseISO(event.endDate), day)
                  )
                  const groupedEvents = groupEvents(dayEvents)

                  return (
                    <motion.div
                      key={dayIndex}
                      className='relative'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: dayIndex * 0.1, ...transition }}
                    >
                      {hours.map((hour, index) => (
                        <motion.div
                          key={hour}
                          className='relative'
                          style={{ height: '192px' }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.01, ...transition }}
                        >
                          {index !== 0 && (
                            <div className='pointer-events-none absolute inset-x-0 top-0 border-b'></div>
                          )}

                          <DroppableArea
                            date={day}
                            hour={hour}
                            minute={0}
                            className='absolute inset-0'
                          >
                            <AddEditEventDialog
                              startDate={day}
                              startTime={{ hour, minute: 0 }}
                            >
                              <div className='hover:bg-secondary absolute inset-0 cursor-pointer transition-colors' />
                            </AddEditEventDialog>
                          </DroppableArea>
                        </motion.div>
                      ))}

                      <RenderGroupedEvents
                        groupedEvents={groupedEvents}
                        day={day}
                      />
                    </motion.div>
                  )
                })}
              </div>

              <CalendarTimeline />
            </motion.div>
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  )
}
