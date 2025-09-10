import {
  TaskAssignmentStatus,
  TaskFilterTypes,
  TaskPriority,
  TaskStatus,
} from './types'

export const TASK_PRIORITIES = [
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT',
] as const satisfies readonly TaskPriority[]

export const TASK_FILTER_TYPES = [
  'created',
  'assigned',
  'received',
] as const satisfies readonly TaskFilterTypes[]

export const TASK_STATUS_FILTER = [
  'IN_PROGRESS',
  'COMPLETED',
  'OVERDUE',
] as const satisfies readonly TaskStatus[]

export const ASSIGNMENT_STATUSES = [
  'WORKING',
  'DONE',
  'CANCELLED',
  'OVERDUE',
] as const satisfies readonly TaskAssignmentStatus[]
