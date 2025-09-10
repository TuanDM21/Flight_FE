import { createFileRoute } from '@tanstack/react-router'
import PageTableSkeleton from '@/components/page-table-skeleton'
import { AllTasksPage } from '@/features/all-tasks'
import { searchAllTaskParamsSchema } from '@/features/all-tasks/schema'

export const Route = createFileRoute('/_authenticated/tasks/all/')({
  validateSearch: (search) => {
    return searchAllTaskParamsSchema.parse(search)
  },
  component: AllTasksPage,
  errorComponent: () => <div>Error loading tasks</div>,
  pendingComponent: PageTableSkeleton,
})

export { Route as AllTasksRoute }
