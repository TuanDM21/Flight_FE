'use client'

import { isSameDay, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { fadeIn, transition } from '@/features/calendar/animations'
import { AgendaEvents } from '@/features/calendar/components/agenda-view/agenda-events'
import { CalendarMonthView } from '@/features/calendar/components/month-view/calendar-month-view'
import { CalendarDayView } from '@/features/calendar/components/week-and-day-view/calendar-day-view'
import { CalendarWeekView } from '@/features/calendar/components/week-and-day-view/calendar-week-view'
import { CalendarYearView } from '@/features/calendar/components/year-view/calendar-year-view'
import { useCalendar } from '@/features/calendar/contexts/calendar-context'
import { useFilteredEvents } from '@/features/calendar/hooks'

export function CalendarBody() {
  const { view } = useCalendar()

  const singleDayEvents = useFilteredEvents().filter((event) => {
    const startDate = parseISO(event.startDate)
    const endDate = parseISO(event.endDate)
    return isSameDay(startDate, endDate)
  })

  const multiDayEvents = useFilteredEvents().filter((event) => {
    const startDate = parseISO(event.startDate)
    const endDate = parseISO(event.endDate)
    return !isSameDay(startDate, endDate)
  })

  return (
    <div className='relative h-full w-full overflow-scroll'>
      <motion.div
        key={view}
        initial='initial'
        animate='animate'
        exit='exit'
        variants={fadeIn}
        transition={transition}
      >
        {view === 'month' && (
          <CalendarMonthView
            singleDayEvents={singleDayEvents}
            multiDayEvents={multiDayEvents}
          />
        )}
        {view === 'week' && (
          <CalendarWeekView
            singleDayEvents={singleDayEvents}
            multiDayEvents={multiDayEvents}
          />
        )}
        {view === 'day' && (
          <CalendarDayView
            singleDayEvents={singleDayEvents}
            multiDayEvents={multiDayEvents}
          />
        )}
        {view === 'year' && (
          <CalendarYearView
            singleDayEvents={singleDayEvents}
            multiDayEvents={multiDayEvents}
          />
        )}
        {view === 'agenda' && (
          <motion.div
            key='agenda'
            initial='initial'
            animate='animate'
            exit='exit'
            variants={fadeIn}
            transition={transition}
          >
            <AgendaEvents />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
