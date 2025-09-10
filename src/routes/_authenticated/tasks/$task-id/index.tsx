import { createFileRoute } from '@tanstack/react-router'
import PageDetailSkeleton from '@/components/page-detail-skeleton'
import TaskDetailPage from '@/features/task-detail'
import { getTaskDetailQueryOptions } from '@/features/task-detail/hooks/use-task-detail'

export const Route = createFileRoute('/_authenticated/tasks/$task-id/')({
  component: TaskDetailPage,
  pendingComponent: PageDetailSkeleton,
  loader: ({ context: { queryClient }, params: { 'task-id': taskId } }) => {
    queryClient.ensureQueryData(getTaskDetailQueryOptions(Number(taskId)))
    return {
      crumb: 'Công việc chi tiết' + ` #${taskId}`,
    }
  },
})

export { Route as TaskDetailRoute }
