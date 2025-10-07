'use client'

import { useMemo } from 'react'
import { isSameDay, parseISO } from 'date-fns'
import { ActivitiesRoute } from '@/routes/_authenticated/activities'
import { motion } from 'framer-motion'
import { fadeIn, transition } from '@/features/calendar/animations'
import { AgendaEvents } from '@/features/calendar/views/agenda-view/agenda-events'
import { CalendarMonthView } from '@/features/calendar/views/month-view/calendar-month-view'
import { CalendarDayView } from '@/features/calendar/views/week-and-day-view/calendar-day-view'
import { CalendarWeekView } from '@/features/calendar/views/week-and-day-view/calendar-week-view'
import { useActivities } from '../activities/hooks/use-activities'
import { useCalendar } from './contexts/calendar-context'

export function CalendarBody() {
  const { view } = useCalendar()
  const searchParams = ActivitiesRoute.useSearch()

  const { data: eventsData, error } = useActivities(searchParams)

  const allEvents = useMemo(
    () => eventsData?.data?.activities ?? [],
    [eventsData?.data?.activities]
  )

  const singleDayEvents = useMemo(
    () =>
      allEvents.filter((event) => {
        const startDate = parseISO(event.startDate)
        const endDate = parseISO(event.endDate)
        return isSameDay(startDate, endDate)
      }),
    [allEvents]
  )

  const multiDayEvents = useMemo(
    () =>
      allEvents.filter((event) => {
        const startDate = parseISO(event.startDate)
        const endDate = parseISO(event.endDate)
        return !isSameDay(startDate, endDate)
      }),
    [allEvents]
  )

  if (error) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-destructive'>
          Failed to load events. Please try again.
        </div>
      </div>
    )
  }

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
