import { Activity } from '../activities/types'

export interface IUser {
  id: string
  name: string
  picturePath: string | null
}

export interface IEvent extends Activity {}

export interface ICalendarCell {
  day: number
  currentMonth: boolean
  date: Date
}
