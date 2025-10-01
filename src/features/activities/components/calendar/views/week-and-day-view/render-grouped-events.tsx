import { areIntervalsOverlapping, parseISO } from 'date-fns'
import { getEventBlockStyle } from '@/features/activities/components/calendar/helpers'
import type { IEvent } from '@/features/activities/components/calendar/interfaces'
import { EventBlock } from '@/features/activities/components/calendar/views/week-and-day-view/event-block'

interface RenderGroupedEventsProps {
  groupedEvents: IEvent[][]
  day: Date
}

export function RenderGroupedEvents({
  groupedEvents,
  day,
}: RenderGroupedEventsProps) {
  return groupedEvents.map((group, groupIndex) =>
    group.map((event) => {
      let style = getEventBlockStyle(
        event,
        day,
        groupIndex,
        groupedEvents.length
      )
      const hasOverlap = groupedEvents.some(
        (otherGroup, otherIndex) =>
          otherIndex !== groupIndex &&
          otherGroup.some((otherEvent) =>
            areIntervalsOverlapping(
              {
                start: parseISO(event.startTime),
                end: parseISO(event.endTime),
              },
              {
                start: parseISO(otherEvent.startTime),
                end: parseISO(otherEvent.endTime),
              }
            )
          )
      )

      if (!hasOverlap) style = { ...style, width: '100%', left: '0%' }

      return (
        <div key={event.id} className='absolute p-1' style={style}>
          <EventBlock event={event} />
        </div>
      )
    })
  )
}
