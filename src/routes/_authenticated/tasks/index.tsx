import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import PageTableSkeleton from '@/components/page-table-skeleton'
import { TasksPage } from '@/features/tasks'
import {
  TASK_FILTER_TYPES,
  TASK_PRIORITIES,
  TASK_STATUS_FILTER,
} from '@/features/tasks/constants'
import { tasksQueryOptions } from '@/features/tasks/hooks/use-tasks'
import { TasksQueryParams } from '@/features/tasks/types'

export const Route = createFileRoute('/_authenticated/tasks/')({
  validateSearch: (search) => {
    return z
      .object({
        type: z.enum(TASK_FILTER_TYPES).catch('assigned'),
        page: z.number().nonnegative().optional(),
        size: z.number().min(1).max(500).optional(),
        keyword: z.any().optional(),
        priorities: z
          .string()
          .transform((val) => {
            if (!val) return undefined
            const values = val.split(',')
            const allValid = values.every((v) =>
              TASK_PRIORITIES.includes(v as any)
            )
            return allValid && values.length > 0 ? values : undefined
          })
          .catch(undefined),
        status: z.enum(TASK_STATUS_FILTER).optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
      })
      .parse(search)
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(
      tasksQueryOptions(deps as TasksQueryParams)
    )
  },

  component: TasksPage,
  errorComponent: () => <div>Error loading tasks</div>,
  pendingComponent: PageTableSkeleton,
})

export { Route as TasksRoute }
