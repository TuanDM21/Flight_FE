import { Suspense } from 'react'
import { CalendarBody } from '../calendar/calendar-body'
import { CalendarProvider } from '../calendar/contexts/calendar-context'
import { DndProvider } from '../calendar/contexts/dnd-context'
import { CalendarHeader } from '../calendar/header/calendar-header'
import { IUser } from '../calendar/interfaces'
import { CalendarSkeleton } from '../calendar/skeletons/calendar-skeleton'

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
