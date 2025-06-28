'use client'

import { CalendarBody } from '@/features/calendar/components/calendar-body'
import { EventUpdateHandler } from '@/features/calendar/components/event-update-handler'
import { CalendarHeader } from '@/features/calendar/components/header/calendar-header'
import { CalendarProvider } from '@/features/calendar/contexts/calendar-context'
import { DragDropProvider } from '@/features/calendar/contexts/drag-drop-context'
import { getEvents, getUsers } from '@/features/calendar/requests'

function getCalendarData() {
  return {
    events: getEvents(),
    users: getUsers(),
  }
}

export function Calendar() {
  const { events, users } = getCalendarData()

  return (
    <div className='flex h-full flex-1 flex-col overflow-hidden'>
      <DragDropProvider>
        <CalendarProvider events={events} users={users} view='month'>
          <div className='flex flex-1 flex-col overflow-hidden rounded-xl border'>
            <EventUpdateHandler />
            <CalendarHeader />
            <div className='flex-1 overflow-auto'>
              <CalendarBody />
            </div>
          </div>
        </CalendarProvider>
      </DragDropProvider>
    </div>
  )
}
