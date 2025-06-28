import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import PageTableSkeleton from '@/components/page-table-skeleton'
import { TasksPage } from '@/features/tasks'
import { tasksQueryOptions } from '@/features/tasks/hooks/use-tasks'

export const Route = createFileRoute('/_authenticated/tasks/')({
  validateSearch: (search) =>
    z
      .object({
        type: z.enum(['created', 'assigned', 'received']).optional(),
      })
      .parse(search),
  loader: async ({ context }) => {
    const { queryClient } = context
    return queryClient.ensureQueryData(tasksQueryOptions('assigned'))
  },
  component: TasksPage,
  pendingComponent: PageTableSkeleton,
})

export { Route as TasksRoute }
