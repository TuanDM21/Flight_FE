import { useMemo } from 'react'
import { vietnameseDayNames } from '@/config/date'
import { motion } from 'framer-motion'
import { staggerContainer } from '@/features/calendar/animations'
import { useCalendar } from '@/features/calendar/contexts/calendar-context'
import {
  calculateMonthEventPositions,
  getCalendarCells,
} from '@/features/calendar/helpers'
import type { IEvent } from '@/features/calendar/interfaces'
import { DayCell } from '@/features/calendar/views/month-view/day-cell'

interface IProps {
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
}

export function CalendarMonthView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate } = useCalendar()

  const allEvents = [...multiDayEvents, ...singleDayEvents]

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate])

  const eventPositions = useMemo(
    () =>
      calculateMonthEventPositions(
        multiDayEvents,
        singleDayEvents,
        selectedDate
      ),
    [multiDayEvents, singleDayEvents, selectedDate]
  )

  return (
    <motion.div initial='initial' animate='animate' variants={staggerContainer}>
      <div className='grid grid-cols-7'>
        {vietnameseDayNames.map((day, index) => (
          <motion.div
            key={day}
            className={`flex items-center justify-center border-l py-2 ${index === 0 ? 'border-l-0' : ''}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className='text-t-quaternary text-xs font-medium'>{day}</span>
          </motion.div>
        ))}
      </div>

      <div className='grid grid-cols-7 overflow-hidden'>
        {cells.map((cell, index) => (
          <DayCell
            key={index}
            cell={cell}
            events={allEvents}
            eventPositions={eventPositions}
          />
        ))}
      </div>
    </motion.div>
  )
}
