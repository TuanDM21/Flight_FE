import { Suspense } from 'react'
import { CalendarSkeleton } from '@/features/activities/components/calendar/skeletons/calendar-skeleton'
import { CalendarBody } from './components/calendar/calendar-body'
import { CalendarProvider } from './components/calendar/contexts/calendar-context'
import { DndProvider } from './components/calendar/contexts/dnd-context'
import { CalendarHeader } from './components/calendar/header/calendar-header'
import { IUser } from './components/calendar/interfaces'

export function ActivitiesPage() {
  const users: IUser[] = []

  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarProvider users={users} view='month'>
        <DndProvider showConfirmation={false}>
          <div className='w-full rounded-xl border'>
            <CalendarHeader />
            <CalendarBody />
          </div>
        </DndProvider>
      </CalendarProvider>
    </Suspense>
  )
}
