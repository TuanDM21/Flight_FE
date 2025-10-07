import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { dateFormatPatterns } from '@/config/date'
import { ActivitiesRoute } from '@/routes/_authenticated/activities'
import { parseAsString, useQueryState } from 'nuqs'
import { cn } from '@/lib/utils'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useActivities } from '@/features/activities/hooks/use-activities'
import { useCalendar } from '@/features/calendar/contexts/calendar-context'
import { EventDetailsDialog } from '@/features/calendar/dialogs/event-details-dialog'
import {
  getBgColor,
  getColorClass,
  getFirstLetters,
} from '@/features/calendar/helpers'
import { EventBullet } from '@/features/calendar/views/month-view/event-bullet'
import { IEvent } from '../../interfaces'

export const AgendaEvents: FC = () => {
  const { badgeVariant, selectedDate } = useCalendar()
  const searchParams = ActivitiesRoute.useSearch()

  const [queryFilter, setQueryFilter] = useQueryState(
    'keyword',
    parseAsString.withDefault('')
  )

  const [startDateParam, setStartDateParam] = useQueryState(
    'startDate',
    parseAsString.withDefault(
      format(startOfMonth(selectedDate), dateFormatPatterns.standardizedDate)
    )
  )

  const [endDateParam, setEndDateParam] = useQueryState(
    'endDate',
    parseAsString.withDefault(
      format(endOfMonth(selectedDate), dateFormatPatterns.standardizedDate)
    )
  )

  const [inputValue, setInputValue] = useState(queryFilter)

  const debouncedSetFilter = useDebouncedCallback(setQueryFilter, 300)

  const handleSearchChange = (value: string) => {
    setInputValue(value)
    debouncedSetFilter(value)
  }

  // Đồng bộ selectedDate với URL parameters khi component mount
  useEffect(() => {
    const currentStartDate = format(
      startOfMonth(selectedDate),
      dateFormatPatterns.standardizedDate
    )
    const currentEndDate = format(
      endOfMonth(selectedDate),
      dateFormatPatterns.standardizedDate
    )

    if (startDateParam !== currentStartDate) {
      void setStartDateParam(currentStartDate)
    }
    if (endDateParam !== currentEndDate) {
      void setEndDateParam(currentEndDate)
    }
  }, [
    selectedDate,
    startDateParam,
    endDateParam,
    setStartDateParam,
    setEndDateParam,
  ])

  const searchParamsWithQuery = {
    ...searchParams,
    keyword: queryFilter || undefined,
    startDate: startDateParam,
    endDate: endDateParam,
  }

  const { data: eventsResponse } = useActivities(searchParamsWithQuery)
  const events = (eventsResponse?.data?.activities ?? []) as IEvent[]

  return (
    <div className='h-[80vh] py-4'>
      <div className='mx-4 mb-4'>
        <Input
          placeholder='Nhập để tìm kiếm...'
          value={inputValue}
          onChange={(e) => {
            handleSearchChange(e.target.value)
          }}
        />
      </div>
      <ScrollArea className='max-h-max border-t px-3'>
        {events.length === 0 ? (
          <div className='text-muted-foreground flex h-32 items-center justify-center'>
            Không tìm thấy kết quả.
          </div>
        ) : (
          <div className='space-y-2 py-2'>
            {events.map((event) => (
              <div
                key={event.id}
                className={cn(
                  'mb-2 rounded-md border p-4 transition-all hover:cursor-pointer',
                  {
                    [getColorClass('blue')]: badgeVariant === 'colored',
                    'hover:bg-zinc-200 dark:hover:bg-gray-900':
                      badgeVariant === 'dot',
                    'hover:opacity-60': badgeVariant === 'colored',
                  }
                )}
              >
                <EventDetailsDialog event={event}>
                  <div className='flex w-full items-center justify-between gap-4'>
                    <div className='flex items-center gap-2'>
                      {badgeVariant === 'dot' ? (
                        <EventBullet color='blue' />
                      ) : (
                        <Avatar>
                          <AvatarImage src='' alt='@shadcn' />
                          <AvatarFallback className={getBgColor('blue')}>
                            {getFirstLetters(event.title)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className='flex flex-col'>
                        <p
                          className={cn({
                            'font-medium': badgeVariant === 'dot',
                            'text-foreground': badgeVariant === 'dot',
                          })}
                        >
                          {event.title}
                        </p>
                        <p className='text-muted-foreground line-clamp-1 text-sm text-ellipsis'>
                          {event.description}
                        </p>
                      </div>
                    </div>
                    <div className='flex flex-col items-end gap-1'>
                      <p className='text-sm'>
                        {format(event.startDate, dateFormatPatterns.fullDate)}
                      </p>
                      <div className='flex items-center gap-1'>
                        <p className='text-sm'>
                          {format(
                            event.startDate,
                            dateFormatPatterns.time24Hour
                          )}
                        </p>
                        <span className='text-muted-foreground'>-</span>
                        <p className='text-sm'>
                          {format(event.endDate, dateFormatPatterns.time24Hour)}
                        </p>
                      </div>
                    </div>
                  </div>
                </EventDetailsDialog>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
