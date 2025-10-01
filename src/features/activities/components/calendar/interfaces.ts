import type { TEventColor } from '@/features/activities/components/calendar/types'
import { Activity } from '../../types'

export interface IUser {
  id: string
  name: string
  picturePath: string | null
}

export interface IEvent extends Activity {
  startTime: string
  endTime: string
  color?: TEventColor
}

export interface ICalendarCell {
  day: number
  currentMonth: boolean
  date: Date
}
