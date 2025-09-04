'use client'

import * as React from 'react'
import { format, parse } from 'date-fns'
import type { Column } from '@tanstack/react-table'
import { dateFormatPatterns } from '@/config/date'
import { CalendarIcon, XCircle } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

type DateSelection = Date[] | DateRange

function getIsDateRange(value: DateSelection): value is DateRange {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function parseAsDate(
  value: string | number | undefined,
  dateFormat: string
): Date | undefined {
  if (!value) return undefined

  try {
    if (typeof value === 'number') {
      // If it's a timestamp
      return new Date(value)
    }

    // If it's a string and we have a format, use date-fns parse
    if (typeof value === 'string' && dateFormat) {
      const parsed = parse(value, dateFormat, new Date())
      return isNaN(parsed.getTime()) ? undefined : parsed
    }

    // Fallback to standard Date parsing
    if (typeof value === 'string') {
      const date = new Date(value)
      return isNaN(date.getTime()) ? undefined : date
    }

    return undefined
  } catch {
    return undefined
  }
}
function parseColumnFilterValue(value: unknown) {
  if (value === null || value === undefined) {
    return []
  }

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'number' || typeof item === 'string') {
        return item
      }
      return
    })
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [value]
  }

  return []
}

interface DataTableDateFilterProps<TData> {
  column: Column<TData>
  title?: string
  multiple?: boolean
}

export function DataTableDateFilter<TData>({
  column,
  title,
  multiple,
}: DataTableDateFilterProps<TData>) {
  const columnFilterValue = column.getFilterValue()
  const { format: formatPattern = dateFormatPatterns.fullDate } =
    column.columnDef.meta || {}
  const urlFormat = (column.columnDef.meta as any)?.urlFormat || 'dd/MM/yyyy'

  const selectedDates = React.useMemo<DateSelection>(() => {
    if (!columnFilterValue) {
      return multiple ? { from: undefined, to: undefined } : []
    }

    if (multiple) {
      const timestamps = parseColumnFilterValue(columnFilterValue)
      return {
        from: parseAsDate(timestamps[0], urlFormat),
        to: parseAsDate(timestamps[1], urlFormat),
      }
    }

    const timestamps = parseColumnFilterValue(columnFilterValue)
    const date = parseAsDate(timestamps[0], urlFormat)
    return date ? [date] : []
  }, [columnFilterValue, multiple])

  const onSelect = React.useCallback(
    (date: Date | DateRange | undefined) => {
      if (!date) {
        column.setFilterValue(undefined)
        return
      }

      if (multiple && !('getTime' in date)) {
        const from = date.from ? format(date.from, urlFormat) : undefined
        const to = date.to ? format(date.to, urlFormat) : undefined
        column.setFilterValue(from || to ? [from, to] : undefined)
      } else if (!multiple && 'getTime' in date) {
        column.setFilterValue(format(date, urlFormat))
      }
    },
    [column, multiple, urlFormat]
  )

  const onReset = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      column.setFilterValue(undefined)
    },
    [column]
  )

  const hasValue = React.useMemo(() => {
    if (multiple) {
      if (!getIsDateRange(selectedDates)) return false
      return selectedDates.from || selectedDates.to
    }
    if (!Array.isArray(selectedDates)) return false
    return selectedDates.length > 0
  }, [multiple, selectedDates])

  const formatDateRange = React.useCallback(
    (range: DateRange) => {
      if (!range.from && !range.to) return ''
      if (range.from && range.to) {
        return `${format(range.from, formatPattern)} - ${format(range.to, formatPattern)}`
      }
      return format(range.from ?? range.to!, formatPattern)
    },
    [formatPattern]
  )

  const label = React.useMemo(() => {
    if (multiple) {
      if (!getIsDateRange(selectedDates)) return null

      const hasSelectedDates = selectedDates.from || selectedDates.to
      const dateText = hasSelectedDates
        ? formatDateRange(selectedDates)
        : 'Select date range'

      return (
        <span className='flex items-center gap-2'>
          <span>{title}</span>
          {hasSelectedDates && (
            <>
              <Separator
                orientation='vertical'
                className='mx-0.5 data-[orientation=vertical]:h-4'
              />
              <span>{dateText}</span>
            </>
          )}
        </span>
      )
    }

    if (getIsDateRange(selectedDates)) return null

    const hasSelectedDate = selectedDates.length > 0
    const dateText = hasSelectedDate
      ? format(selectedDates[0], formatPattern)
      : 'Select date'

    return (
      <span className='flex items-center gap-2'>
        <span>{title}</span>
        {hasSelectedDate && (
          <>
            <Separator
              orientation='vertical'
              className='mx-0.5 data-[orientation=vertical]:h-4'
            />
            <span>{dateText}</span>
          </>
        )}
      </span>
    )
  }, [selectedDates, multiple, formatDateRange, title])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='border-dashed'>
          {hasValue ? (
            <div
              role='button'
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              onClick={onReset}
              className='focus-visible:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:outline-none'
            >
              <XCircle />
            </div>
          ) : (
            <CalendarIcon />
          )}
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        {multiple ? (
          <Calendar
            initialFocus
            mode='range'
            selected={
              getIsDateRange(selectedDates)
                ? selectedDates
                : { from: undefined, to: undefined }
            }
            onSelect={onSelect}
          />
        ) : (
          <Calendar
            initialFocus
            mode='single'
            selected={
              getIsDateRange(selectedDates) ? undefined : selectedDates[0]
            }
            onSelect={onSelect}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
