'use client'

import { isSameDay, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import {
  fadeIn,
  transition,
} from '@/features/activities/components/calendar/animations'
import { useCalendar } from '@/features/activities/components/calendar/contexts/calendar-context'
import { AgendaEvents } from '@/features/activities/components/calendar/views/agenda-view/agenda-events'
import { CalendarMonthView } from '@/features/activities/components/calendar/views/month-view/calendar-month-view'
import { CalendarDayView } from '@/features/activities/components/calendar/views/week-and-day-view/calendar-day-view'
import { CalendarWeekView } from '@/features/activities/components/calendar/views/week-and-day-view/calendar-week-view'
import { CalendarYearView } from '@/features/activities/components/calendar/views/year-view/calendar-year-view'

export function CalendarBody() {
  const { view, events } = useCalendar()

  const singleDayEvents = events.filter((event) => {
    const startDate = parseISO(event.startTime)
    const endDate = parseISO(event.endTime)
    return isSameDay(startDate, endDate)
  })

  const multiDayEvents = events.filter((event) => {
    const startDate = parseISO(event.startTime)
    const endDate = parseISO(event.endTime)
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
