'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  slideFromLeft,
  slideFromRight,
  transition,
} from '@/features/activities/components/calendar/animations'
import { useCalendar } from '@/features/activities/components/calendar/contexts/calendar-context'
import { AddEditEventDialog } from '@/features/activities/components/calendar/dialogs/add-edit-event-dialog'
import { DateNavigator } from '@/features/activities/components/calendar/header/date-navigator'
import { TodayButton } from '@/features/activities/components/calendar/header/today-button'
import Views from './view-tabs'

export function CalendarHeader() {
  const { view, events } = useCalendar()

  return (
    <div className='flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between'>
      <motion.div
        className='flex items-center gap-3'
        variants={slideFromLeft}
        initial='initial'
        animate='animate'
        transition={transition}
      >
        <TodayButton />
        <DateNavigator view={view} events={events} />
      </motion.div>

      <motion.div
        className='flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-1.5'
        variants={slideFromRight}
        initial='initial'
        animate='animate'
        transition={transition}
      >
        <div className='options flex flex-wrap items-center gap-4 md:gap-2'>
          {/* <FilterEvents /> */}
          <Views />
        </div>

        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-1.5'>
          {/* <UserSelect /> */}

          <AddEditEventDialog>
            <Button>
              <Plus className='h-4 w-4' />
              Add Event
            </Button>
          </AddEditEventDialog>
        </div>
      </motion.div>
    </div>
  )
}
