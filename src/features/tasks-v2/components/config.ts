import { Task } from '../types'

export const statusConfig = {
  COMPLETE: {
    label: 'COMPLETE',
    color: 'bg-emerald-500 hover:bg-emerald-600',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: '✓',
  },
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    color: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: '◐',
  },
  TO_DO: {
    label: 'TO DO',
    color: 'bg-slate-500 hover:bg-slate-600',
    textColor: 'text-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-950/30',
    borderColor: 'border-slate-200 dark:border-slate-800',
    icon: '○',
  },
  OPEN: {
    label: 'OPEN',
    color: 'bg-purple-500 hover:bg-purple-600',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: '●',
  },
} as const

export const priorityConfig = {
  URGENT: {
    label: 'Urgent',
    color:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
  HIGH: {
    label: 'High',
    color:
      'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
    dotColor: 'bg-orange-500',
  },
  NORMAL: {
    label: 'Normal',
    color:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
    dotColor: 'bg-blue-500',
  },
  MEDIUM: {
    label: 'Medium',
    color:
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
    dotColor: 'bg-amber-500',
  },
  LOW: {
    label: 'Low',
    color:
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
    dotColor: 'bg-green-500',
  },
} satisfies Record<
  Task['priority'],
  { label: string; color: string; dotColor: string }
>

export const taskStatusConfig = {
  COMPLETE: { icon: '✓', color: 'text-emerald-600', label: 'COMPLETE' },
  IN_PROGRESS: { icon: '◐', color: 'text-blue-600', label: 'IN PROGRESS' },
  TO_DO: { icon: '○', color: 'text-slate-600', label: 'TO DO' },
  OPEN: {
    icon: '●',
    color: 'text-purple-600',
    label: 'OPEN',
  },
} satisfies Record<
  Task['status'],
  { icon: string; color: string; label: string }
>
