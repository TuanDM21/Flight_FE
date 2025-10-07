import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { vietnameseMonthNames, dateFormatPatterns } from '@/config/date'
import { ActivitiesRoute } from '@/routes/_authenticated/activities'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useActivities } from '@/features/activities/hooks/use-activities'
import { buttonHover, transition } from '@/features/calendar/animations'
import { useCalendar } from '@/features/calendar/contexts/calendar-context'
import {
  getEventsCount,
  navigateDate,
  rangeText,
} from '@/features/calendar/helpers'
import type { TCalendarView } from '@/features/calendar/types'

interface IProps {
  view: TCalendarView
}

const MotionButton = motion.create(Button)
const MotionBadge = motion.create(Badge)

export function DateNavigator({ view }: IProps) {
  const { selectedDate, setSelectedDate } = useCalendar()
  const searchParams = ActivitiesRoute.useSearch()

  const [startDateParam, setStartDateParam] = useQueryState(
    'startDate',
    parseAsString.withDefault(
      format(selectedDate, dateFormatPatterns.standardizedDate)
    )
  )

  const [endDateParam, setEndDateParam] = useQueryState(
    'endDate',
    parseAsString.withDefault(
      format(endOfMonth(selectedDate), dateFormatPatterns.standardizedDate)
    )
  )

  const { data: eventsData } = useActivities({
    ...searchParams,
    startDate: startDateParam,
    endDate: endDateParam,
  })

  const month = vietnameseMonthNames[selectedDate.getMonth()]
  const year = selectedDate.getFullYear()

  const eventCount = useMemo(() => {
    const events = eventsData?.data?.activities || []
    return getEventsCount(events as any, selectedDate, view)
  }, [eventsData, selectedDate, view])

  const handlePrevious = () => {
    const newDate = navigateDate(selectedDate, view, 'previous')
    setSelectedDate(newDate)

    // Cập nhật URL params
    const newStartDate = format(
      startOfMonth(newDate),
      dateFormatPatterns.standardizedDate
    )
    const newEndDate = format(
      endOfMonth(newDate),
      dateFormatPatterns.standardizedDate
    )
    void setStartDateParam(newStartDate)
    void setEndDateParam(newEndDate)
  }

  const handleNext = () => {
    const newDate = navigateDate(selectedDate, view, 'next')
    setSelectedDate(newDate)

    // Cập nhật URL params
    const newStartDate = format(
      startOfMonth(newDate),
      dateFormatPatterns.standardizedDate
    )
    const newEndDate = format(
      endOfMonth(newDate),
      dateFormatPatterns.standardizedDate
    )
    void setStartDateParam(newStartDate)
    void setEndDateParam(newEndDate)
  }

  return (
    <div className='space-y-0.5'>
      <div className='flex items-center gap-2'>
        <motion.span
          className='text-lg font-semibold'
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={transition}
        >
          {month} {year}
        </motion.span>
        <AnimatePresence mode='wait'>
          <MotionBadge
            key={eventCount}
            variant='secondary'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={transition}
          >
            {eventCount} sự kiện
          </MotionBadge>
        </AnimatePresence>
      </div>

      <div className='flex items-center gap-2'>
        <MotionButton
          variant='outline'
          size='icon'
          className='h-6 w-6'
          onClick={handlePrevious}
          variants={buttonHover}
          whileHover='hover'
          whileTap='tap'
        >
          <ChevronLeft className='h-4 w-4' />
        </MotionButton>

        <motion.p
          className='text-muted-foreground text-sm'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transition}
        >
          {rangeText(view, selectedDate)}
        </motion.p>

        <MotionButton
          variant='outline'
          size='icon'
          className='h-6 w-6'
          onClick={handleNext}
          variants={buttonHover}
          whileHover='hover'
          whileTap='tap'
        >
          <ChevronRight className='h-4 w-4' />
        </MotionButton>
      </div>
    </div>
  )
}
