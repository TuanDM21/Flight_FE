import { createFileRoute } from '@tanstack/react-router'
import PageTableSkeleton from '@/components/page-table-skeleton'
import { TasksV2Page } from '@/features/tasks-v2'

export const Route = createFileRoute('/_authenticated/tasks-v2/')({
  // loader: async ({ context }) => {
  //   const { queryClient } = context
  //   return queryClient.ensureQueryData(tasksQueryOptions('assigned'))
  // },
  // validateSearch: (search) =>
  //   z
  //     .object({
  //       type: z.enum(['created', 'assigned', 'received']).optional(),
  //     })
  //     .parse(search),
  component: TasksV2Page,
  pendingComponent: PageTableSkeleton,
})

export { Route as TasksV2Route }
