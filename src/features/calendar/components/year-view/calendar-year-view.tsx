import { getYear, isSameDay, isSameMonth } from 'date-fns'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { staggerContainer, transition } from '@/features/calendar/animations'
import { EventListDialog } from '@/features/calendar/components/dialogs/events-list-dialog'
import { EventBullet } from '@/features/calendar/components/month-view/event-bullet'
import { useCalendar } from '@/features/calendar/contexts/calendar-context'
import { getCalendarCells } from '@/features/calendar/helpers'
import { IEvent } from '@/features/calendar/interfaces'

interface IProps {
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function CalendarYearView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate, setSelectedDate } = useCalendar()
  const currentYear = getYear(selectedDate)
  const allEvents = [...multiDayEvents, ...singleDayEvents]

  return (
    <div className='flex h-full flex-col overflow-hidden sm:min-h-[80vh] sm:p-5'>
      <motion.div
        className='text-t-quaternary flex flex-col items-center justify-center py-4 text-sm sm:hidden'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <p>Yearly view is not available on smaller devices.</p>
        <p>Please switch to daily or monthly view.</p>
      </motion.div>
      <motion.div
        initial='initial'
        animate='animate'
        variants={staggerContainer}
        className='hidden flex-grow auto-rows-fr grid-cols-3 gap-4 overflow-hidden sm:grid lg:grid-cols-4'
      >
        {MONTHS.map((month, monthIndex) => {
          const monthDate = new Date(currentYear, monthIndex, 1)
          const cells = getCalendarCells(monthDate)

          return (
            <motion.div
              key={month}
              className='flex h-full flex-col overflow-hidden rounded-md border'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: monthIndex * 0.05, ...transition }}
            >
              <div
                className='bg-primary/5 hover:bg-primary/10 cursor-pointer px-1 py-1 text-center text-xs font-medium transition-colors sm:text-sm'
                onClick={() => {
                  setSelectedDate(new Date(currentYear, monthIndex, 1))
                }}
              >
                {month}
              </div>

              <div className='grid grid-cols-7 py-1 text-center text-xs'>
                {WEEKDAYS.map((day) => (
                  <div key={day} className='text-muted-foreground'>
                    {day}
                  </div>
                ))}
              </div>

              <div className='grid flex-grow grid-cols-7 gap-0 p-0.5'>
                {cells.map((cell) => {
                  const isCurrentMonth = isSameMonth(cell.date, monthDate)
                  const isToday = isSameDay(cell.date, new Date())
                  const dayEvents = allEvents.filter((event) =>
                    isSameDay(new Date(event.startDate), cell.date)
                  )
                  const hasEvents = dayEvents.length > 0

                  return (
                    <div
                      key={cell.date.toISOString()}
                      className={cn(
                        'relative flex flex-col items-center justify-center text-xs',
                        !isCurrentMonth && 'text-muted-foreground/50',
                        isToday && 'font-bold',
                        !hasEvents && 'cursor-default'
                      )}
                    >
                      {hasEvents ? (
                        <EventListDialog date={cell.date} events={dayEvents}>
                          <div className='flex h-full w-full cursor-pointer flex-col items-center justify-center'>
                            <span
                              className={cn(
                                'flex size-4 items-center justify-center sm:size-5',
                                isToday &&
                                  'bg-primary text-primary-foreground rounded-full'
                              )}
                            >
                              {cell.day}
                            </span>
                            <div className='flex items-center justify-center gap-0.5'>
                              {dayEvents.length <= 2 ? (
                                dayEvents
                                  .slice(0, 2)
                                  .map((event) => (
                                    <EventBullet
                                      key={event.id}
                                      color={event.color}
                                      className='size-1'
                                    />
                                  ))
                              ) : (
                                <>
                                  <EventBullet
                                    color={dayEvents[0].color}
                                    className='size-1'
                                  />
                                  <span className='text-muted-foreground text-[.7rem]'>
                                    +{dayEvents.length - 1}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </EventListDialog>
                      ) : (
                        <div className='flex h-full w-full flex-col items-center justify-center'>
                          <span
                            className={cn(
                              'flex size-4 items-center justify-center sm:size-5',
                              isToday &&
                                'bg-primary text-primary-foreground rounded-full'
                            )}
                          >
                            {cell.day}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
