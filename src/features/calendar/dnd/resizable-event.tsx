'use client'

import type React from 'react'
import { useCallback, useMemo, useState } from 'react'
import {
  addMinutes,
  differenceInMinutes,
  format,
  isAfter,
  isBefore,
  parseISO,
} from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { ActivitiesRoute } from '@/routes/_authenticated/activities'
import { motion } from 'framer-motion'
import { Resizable, type ResizeCallback } from 're-resizable'
import { activityKeysFactory } from '@/api/query-key-factory'
import { cn } from '@/lib/utils'
import { useUpdateActivity } from '@/features/activities/hooks/use-update-activity'
import { useCalendar } from '@/features/calendar/contexts/calendar-context'
import type { IEvent } from '@/features/calendar/interfaces'

interface ResizableEventBlockProps {
  event: IEvent
  children: React.ReactNode
  className?: string
}

const PIXELS_PER_HOUR = 96
const MINUTES_PER_PIXEL = 60 / PIXELS_PER_HOUR
const MIN_DURATION = 15 // in minutes

export function ResizableEvent({
  event,
  children,
  className,
}: ResizableEventBlockProps) {
  const { use24HourFormat } = useCalendar()
  const searchParams = ActivitiesRoute.useSearch()
  const updateActivityMutation = useUpdateActivity(searchParams)
  const queryClient = useQueryClient()
  const [isResizing, setIsResizing] = useState(false)
  const [resizePreview, setResizePreview] = useState<{
    start: string
    end: string
  } | null>(null)
  const [pendingUpdate, setPendingUpdate] = useState<{
    startDate: string
    endDate: string
  } | null>(null)

  const start = useMemo(() => parseISO(event.startDate), [event.startDate])
  const end = useMemo(() => parseISO(event.endDate), [event.endDate])
  const durationInMinutes = useMemo(
    () => differenceInMinutes(end, start),
    [start, end]
  )

  const resizeBoundaries = useMemo(() => {
    const dayStart = new Date(start)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(start)
    dayEnd.setHours(23, 59, 59, 999)

    return { dayStart, dayEnd }
  }, [start])

  const handleResizeStart = useCallback(() => {
    setIsResizing(true)
  }, [])

  const handleResize: ResizeCallback = useCallback(
    (_, direction, ref) => {
      const newHeight = Number.parseInt(ref.style.height, 10)
      const newDuration = Math.max(
        MIN_DURATION,
        Math.round((newHeight + 8) * MINUTES_PER_PIXEL)
      )
      const delta = newDuration - durationInMinutes

      let newStart = start
      let newEnd = end

      if (direction.includes('top')) {
        newStart = addMinutes(start, -delta)
      } else if (direction.includes('bottom')) {
        newEnd = addMinutes(end, delta)
      }

      if (isBefore(newStart, resizeBoundaries.dayStart)) {
        newStart = resizeBoundaries.dayStart
      }
      if (isAfter(newEnd, resizeBoundaries.dayEnd)) {
        newEnd = resizeBoundaries.dayEnd
      }

      // Cập nhật preview
      setResizePreview({
        start: format(newStart, use24HourFormat ? 'HH:mm' : 'h:mm a'),
        end: format(newEnd, use24HourFormat ? 'HH:mm' : 'h:mm a'),
      })

      const updatedEvent = {
        ...event,
        startDate: format(newStart, "yyyy-MM-dd'T'HH:mm:ss"),
        endDate: format(newEnd, "yyyy-MM-dd'T'HH:mm:ss"),
      }

      queryClient.setQueryData(
        activityKeysFactory.lists(searchParams),
        (oldData: any) => {
          if (!oldData?.data?.activities) return oldData

          return {
            ...oldData,
            data: {
              ...oldData.data,
              activities: oldData.data.activities.map((activity: any) =>
                activity.id === event.id ? updatedEvent : activity
              ),
            },
          }
        }
      )

      setPendingUpdate({
        startDate: format(newStart, "yyyy-MM-dd'T'HH:mm:ss"),
        endDate: format(newEnd, "yyyy-MM-dd'T'HH:mm:ss"),
      })
    },
    [
      start,
      end,
      durationInMinutes,
      resizeBoundaries,
      use24HourFormat,
      event,
      queryClient,
      searchParams,
    ]
  )

  const handleResizeStop = useCallback(() => {
    setIsResizing(false)
    setResizePreview(null)

    if (pendingUpdate) {
      const participantsRequest = event.participants.reduce<
        Array<{
          participantType: 'USER' | 'TEAM' | 'UNIT'
          participantIds: number[]
        }>
      >((acc, p) => {
        if (!p.participantType || !p.participantId) return acc

        const existing = acc.find(
          (item) => item.participantType === p.participantType
        )
        if (existing) {
          existing.participantIds.push(p.participantId)
        } else {
          acc.push({
            participantType: p.participantType,
            participantIds: [p.participantId],
          })
        }
        return acc
      }, [])

      updateActivityMutation.mutate({
        params: { path: { id: event.id } },
        body: {
          title: event.title,
          location: event.location,
          description: event.description,
          participants: participantsRequest,
          pinned: event.pinned,
          startDate: pendingUpdate.startDate,
          endDate: pendingUpdate.endDate,
        },
      })
      setPendingUpdate(null)
    }
  }, [pendingUpdate, updateActivityMutation, event])

  const resizeConfig = useMemo(
    () => ({
      minHeight: 15,
      maxHeight: 1440,
      enable: {
        top: true,
        bottom: true,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      },
      handleStyles: {
        top: {
          cursor: 'ns-resize',
          height: '8px',
          top: '-4px',
          backgroundColor: 'transparent',
        },
        bottom: {
          cursor: 'ns-resize',
          height: '8px',
          bottom: '-4px',
          backgroundColor: 'transparent',
        },
      },
      handleClasses: {
        top: 'transition-colors rounded-sm',
        bottom: 'transition-colors rounded-sm',
      },
      onResizeStart: handleResizeStart,
      onResize: handleResize,
      onResizeStop: handleResizeStop,
      className: cn(
        'transition-all duration-200',
        isResizing && 'z-50 shadow-lg'
      ),
    }),
    [handleResizeStart, handleResize, handleResizeStop, isResizing]
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn('group relative', className)}
    >
      <Resizable {...resizeConfig}>{children}</Resizable>

      {isResizing && resizePreview && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className='absolute -top-8 left-1/2 z-50 -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg'
        >
          {resizePreview.start} - {resizePreview.end}
        </motion.div>
      )}
    </motion.div>
  )
}
