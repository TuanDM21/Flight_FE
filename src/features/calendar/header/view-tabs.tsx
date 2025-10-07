import { memo } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { dateFormatPatterns } from '@/config/date'
import { CalendarRange, List, Columns, Grid3X3 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { parseAsString, useQueryState } from 'nuqs'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCalendar } from '../contexts/calendar-context'
import { TCalendarView } from '../types'

const tabs = [
  {
    name: 'Lịch trình',
    value: 'agenda',
    icon: () => <CalendarRange className='h-4 w-4' />,
  },
  {
    name: 'Ngày',
    value: 'day',
    icon: () => <List className='h-4 w-4' />,
  },
  {
    name: 'Tuần',
    value: 'week',
    icon: () => <Columns className='h-4 w-4' />,
  },
  {
    name: 'Tháng',
    value: 'month',
    icon: () => <Grid3X3 className='h-4 w-4' />,
  },
]

function Views() {
  const { view, setView, selectedDate } = useCalendar()

  const [, setStartDateParam] = useQueryState(
    'startDate',
    parseAsString.withDefault('')
  )

  const [, setEndDateParam] = useQueryState(
    'endDate',
    parseAsString.withDefault('')
  )

  const handleViewChange = (newView: TCalendarView) => {
    setView(newView)

    if (newView === 'agenda') {
      // Lấy ngày đầu tháng và ngày cuối tháng của selectedDate
      const startDate = format(
        startOfMonth(selectedDate),
        dateFormatPatterns.standardizedDate
      )
      const endDate = format(
        endOfMonth(selectedDate),
        dateFormatPatterns.standardizedDate
      )
      void setStartDateParam(startDate)
      void setEndDateParam(endDate)
    } else {
      void setStartDateParam(null)
      void setEndDateParam(null)
    }
  }

  return (
    <Tabs
      value={view}
      onValueChange={(value) => {
        handleViewChange(value as TCalendarView)
      }}
      className='w-full gap-4 sm:w-auto'
    >
      <TabsList className='h-auto w-full gap-2 rounded-xl p-1'>
        {tabs.map(({ icon: Icon, name, value }) => {
          const isActive = view === value

          return (
            <motion.div
              key={value}
              layout
              className={cn(
                'flex h-8 items-center justify-center overflow-hidden rounded-md',
                isActive ? 'flex-1' : 'flex-none'
              )}
              onClick={() => {
                handleViewChange(value as TCalendarView)
              }}
              initial={false}
              animate={{
                width: isActive ? 120 : 32,
              }}
              transition={{
                type: 'tween',
                stiffness: 400,
                damping: 25,
              }}
            >
              <TabsTrigger value={value} asChild>
                <motion.div
                  className='flex h-8 w-full cursor-pointer items-center justify-center'
                  animate={{ filter: 'blur(0px)' }}
                  exit={{ filter: 'blur(2px)' }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Icon />
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.span
                        className='font-medium'
                        initial={{ opacity: 0, scaleX: 0.8 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        style={{ originX: 0 }}
                      >
                        {name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </TabsTrigger>
            </motion.div>
          )
        })}
      </TabsList>
    </Tabs>
  )
}

export default memo(Views)
