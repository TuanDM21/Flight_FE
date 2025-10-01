'use client'

import type React from 'react'
import { createContext, useState, useMemo, useContext } from 'react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/features/activities/components/calendar/hooks'
import type {
  IEvent,
  IUser,
} from '@/features/activities/components/calendar/interfaces'
import type {
  TCalendarView,
  TEventColor,
} from '@/features/activities/components/calendar/types'
import { useActivities } from '@/features/activities/hooks/use-activities'
import { useCreateActivity } from '@/features/activities/hooks/use-create-activity'
import { useDeleteActivity } from '@/features/activities/hooks/use-delete-activity'
import { useUpdateActivity } from '@/features/activities/hooks/use-update-activity'
import { EventFormData } from '../schemas'

interface ICalendarContext {
  selectedDate: Date
  view: TCalendarView
  setView: (view: TCalendarView) => void
  agendaModeGroupBy: 'date' | 'color'
  setAgendaModeGroupBy: (groupBy: 'date' | 'color') => void
  use24HourFormat: boolean
  toggleTimeFormat: () => void
  setSelectedDate: (date: Date | undefined) => void
  selectedUserId: string
  setSelectedUserId: (userId: string) => void
  badgeVariant: 'dot' | 'colored'
  setBadgeVariant: (variant: 'dot' | 'colored') => void
  selectedColors: TEventColor[]
  setSelectedColors: (colors: TEventColor[]) => void
  users: IUser[]
  events: IEvent[]
  filteredEvents: IEvent[]
  addEvent: (event: EventFormData) => Promise<void>
  updateEvent: (eventId: number, event: EventFormData) => Promise<void>
  removeEvent: (eventId: number) => void
  clearFilter: () => void
}

interface CalendarSettings {
  badgeVariant: 'dot' | 'colored'
  view: TCalendarView
  use24HourFormat: boolean
  agendaModeGroupBy: 'date' | 'color'
}

const DEFAULT_SETTINGS: CalendarSettings = {
  badgeVariant: 'colored',
  view: 'day',
  use24HourFormat: true,
  agendaModeGroupBy: 'date',
}

export const CalendarContext = createContext({} as ICalendarContext)

export function CalendarProvider({
  children,
  users,
}: {
  children: React.ReactNode
  users: IUser[]
  view?: TCalendarView
  badge?: 'dot' | 'colored'
}) {
  // Hooks for API operations
  const createActivityMutation = useCreateActivity()
  const updateActivityMutation = useUpdateActivity()
  const deleteActivityMutation = useDeleteActivity()

  const { data: activitiesResponse } = useActivities({ type: 'company' })

  const allEvents = useMemo(() => {
    return (activitiesResponse?.data?.activities ?? []).map((activity) => ({
      ...activity,
      startTime: activity.startTime,
      endTime: activity.endTime,
      color: 'blue' as TEventColor,
    })) as IEvent[]
  }, [activitiesResponse?.data])

  const [settings, setSettings] = useLocalStorage<CalendarSettings>(
    'calendar-settings',
    DEFAULT_SETTINGS
  )

  const [badgeVariant, setBadgeVariantState] = useState<'dot' | 'colored'>(
    settings.badgeVariant
  )
  const [currentView, setCurrentViewState] = useState<TCalendarView>(
    settings.view
  )
  const [use24HourFormat, setUse24HourFormatState] = useState<boolean>(
    settings.use24HourFormat
  )
  const [agendaModeGroupBy, setAgendaModeGroupByState] = useState<
    'date' | 'color'
  >(settings.agendaModeGroupBy)

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedUserId, setSelectedUserId] = useState<string>('all')
  const [selectedColors, setSelectedColors] = useState<TEventColor[]>([])

  // Memoized filtered events
  const filteredEvents = useMemo(() => {
    let filtered = allEvents

    // Filter by colors
    if (selectedColors.length > 0) {
      filtered = filtered.filter((event) => {
        const eventColor = event.color || 'blue'
        return selectedColors.includes(eventColor)
      })
    }

    // Filter by user
    if (selectedUserId !== 'all') {
      filtered = filtered.filter((event) => {
        // Assuming event has user property or userId
        return (
          (event as any).user?.id === selectedUserId ||
          (event as any).userId === selectedUserId
        )
      })
    }

    return filtered
  }, [allEvents, selectedColors, selectedUserId])

  const updateSettings = (newPartialSettings: Partial<CalendarSettings>) => {
    setSettings({
      ...settings,
      ...newPartialSettings,
    })
  }

  const setBadgeVariant = (variant: 'dot' | 'colored') => {
    setBadgeVariantState(variant)
    updateSettings({ badgeVariant: variant })
  }

  const setView = (newView: TCalendarView) => {
    setCurrentViewState(newView)
    updateSettings({ view: newView })
  }

  const toggleTimeFormat = () => {
    const newValue = !use24HourFormat
    setUse24HourFormatState(newValue)
    updateSettings({ use24HourFormat: newValue })
  }

  const setAgendaModeGroupBy = (groupBy: 'date' | 'color') => {
    setAgendaModeGroupByState(groupBy)
    updateSettings({ agendaModeGroupBy: groupBy })
  }

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
  }

  const clearFilter = () => {
    setSelectedColors([])
    setSelectedUserId('all')
  }

  // Event operations using API
  const addEvent = async (eventData: EventFormData): Promise<void> => {
    const createPromise = createActivityMutation.mutateAsync({
      body: {
        name: eventData.name,
        location: eventData.location || '',
        startTime: eventData.startTime.toISOString(),
        endTime: eventData.endTime.toISOString(),
        notes: eventData.notes || '',
        participants: eventData.participants,
      },
    })

    toast.promise(createPromise, {
      loading: 'Creating event...',
      success: 'Event created successfully!',
      error: 'Failed to create event',
    })

    await createPromise
  }

  const updateEvent = async (eventId: number, eventData: EventFormData) => {
    const updatePromise = updateActivityMutation.mutateAsync({
      params: {
        path: {
          id: eventId,
        },
      },
      body: {
        name: eventData.name,
        location: eventData.location || '',
        startTime: eventData.startTime.toISOString(),
        endTime: eventData.endTime.toISOString(),
        notes: eventData.notes || '',
        participants: eventData.participants,
      },
    })

    toast.promise(updatePromise, {
      loading: 'Updating event...',
      success: 'Event updated successfully!',
      error: 'Failed to update event',
    })

    await updatePromise
  }

  const removeEvent = (eventId: number) => {
    const deletePromise = deleteActivityMutation.mutateAsync({
      params: {
        path: {
          id: eventId,
        },
      },
    })

    toast.promise(deletePromise, {
      loading: 'Deleting event...',
      success: 'Event deleted successfully!',
      error: 'Failed to delete event',
    })
  }

  const value = {
    selectedDate,
    setSelectedDate: handleSelectDate,
    selectedUserId,
    setSelectedUserId,
    badgeVariant,
    setBadgeVariant,
    users,
    selectedColors,
    setSelectedColors,
    events: allEvents,
    filteredEvents,
    addEvent,
    updateEvent,
    removeEvent,
    view: currentView,
    use24HourFormat,
    toggleTimeFormat,
    setView,
    agendaModeGroupBy,
    setAgendaModeGroupBy,
    clearFilter,
  }

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context)
    throw new Error('useCalendar must be used within a CalendarProvider.')
  return context
}
