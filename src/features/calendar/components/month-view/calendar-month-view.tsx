import { motion } from 'framer-motion'
import { staggerContainer, transition } from '@/features/calendar/animations'
import { DayCell } from '@/features/calendar/components/month-view/day-cell'
import { useCalendar } from '@/features/calendar/contexts/calendar-context'
import {
  getCalendarCells,
  calculateMonthEventPositions,
} from '@/features/calendar/helpers'
import type { IEvent } from '@/features/calendar/interfaces'

interface IProps {
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarMonthView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate } = useCalendar()

  const allEvents = [...multiDayEvents, ...singleDayEvents]

  const cells = getCalendarCells(selectedDate)

  const eventPositions = calculateMonthEventPositions(
    multiDayEvents,
    singleDayEvents,
    selectedDate
  )

  return (
    <motion.div initial='initial' animate='animate' variants={staggerContainer}>
      <div className='grid grid-cols-7'>
        {WEEK_DAYS.map((day, index) => (
          <motion.div
            key={day}
            className='flex items-center justify-center py-2'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, ...transition }}
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
