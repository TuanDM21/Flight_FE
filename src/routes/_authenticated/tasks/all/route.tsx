import { createFileRoute } from '@tanstack/react-router'
import { AllTasksPage } from '@/features/all-tasks'

export const Route = createFileRoute('/_authenticated/tasks/all')({
  loader: async () => {
    return {
      crumb: 'Công việc chung',
    }
  },
  component: AllTasksPage,
})
