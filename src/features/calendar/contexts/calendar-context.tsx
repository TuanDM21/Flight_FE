'use client'

import type React from 'react'
import { createContext, useContext, useState } from 'react'
import { useLocalStorage } from '@/features/calendar/hooks'
import type { IUser } from '@/features/calendar/interfaces'
import type { TCalendarView, TEventColor } from '@/features/calendar/types'

interface ICalendarContext {
  // Date & View State
  selectedDate: Date
  view: TCalendarView
  setView: (view: TCalendarView) => void
  setSelectedDate: (date: Date | undefined) => void

  // Display Settings
  agendaModeGroupBy: 'date'
  setAgendaModeGroupBy: (groupBy: 'date') => void
  use24HourFormat: boolean
  toggleTimeFormat: () => void
  badgeVariant: 'dot' | 'colored'
  setBadgeVariant: (variant: 'dot' | 'colored') => void

  // Filter State
  selectedUserId: string
  setSelectedUserId: (userId: string) => void
  selectedColors: TEventColor[]
  setSelectedColors: (colors: TEventColor[]) => void

  // Static Data
  users: IUser[]
}

interface CalendarSettings {
  badgeVariant: 'dot' | 'colored'
  view: TCalendarView
  use24HourFormat: boolean
  agendaModeGroupBy: 'date'
}

const DEFAULT_SETTINGS: CalendarSettings = {
  badgeVariant: 'colored',
  view: 'day',
  use24HourFormat: true,
  agendaModeGroupBy: 'date',
}

const CalendarContext = createContext({} as ICalendarContext)

export function CalendarProvider({
  children,
  users,
  badge = 'colored',
  view = 'day',
}: {
  children: React.ReactNode
  users: IUser[]
  view?: TCalendarView
  badge?: 'dot' | 'colored'
}) {
  const [settings, setSettings] = useLocalStorage<CalendarSettings>(
    'calendar-settings',
    {
      ...DEFAULT_SETTINGS,
      badgeVariant: badge,
      view: view,
    }
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
  const [agendaModeGroupBy, setAgendaModeGroupByState] = useState<'date'>(
    settings.agendaModeGroupBy
  )

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedUserId, setSelectedUserId] = useState<string>('all')
  const [selectedColors, setSelectedColors] = useState<TEventColor[]>([])

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

  const setAgendaModeGroupBy = (groupBy: 'date') => {
    setAgendaModeGroupByState(groupBy)
    updateSettings({ agendaModeGroupBy: groupBy })
  }

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
  }

  const value: ICalendarContext = {
    selectedDate,
    setSelectedDate: handleSelectDate,
    selectedUserId,
    setSelectedUserId,
    badgeVariant,
    setBadgeVariant,
    users,
    selectedColors,
    setSelectedColors,
    view: currentView,
    use24HourFormat,
    toggleTimeFormat,
    setView,
    agendaModeGroupBy,
    setAgendaModeGroupBy,
  }

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext)
  if (!context)
    throw new Error('useCalendar must be used within a CalendarProvider.')
  return context
}
