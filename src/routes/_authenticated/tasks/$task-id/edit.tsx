import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getTaskDetailQueryOptions } from '@/features/task-detail/hooks/use-task-detail'
import EditTaskPage from '@/features/tasks/edit'

export const Route = createFileRoute('/_authenticated/tasks/$task-id/edit')({
  loader: async ({
    context: {
      queryClient,
      auth: { user },
    },
    params: { 'task-id': taskId },
  }) => {
    const { data: taskDetails } = await queryClient.ensureQueryData(
      getTaskDetailQueryOptions(Number(taskId))
    )
    const isTaskOwner = user?.id === taskDetails?.createdByUser?.id
    if (!isTaskOwner) {
      throw redirect({
        to: '/404',
        search: {
          redirect: location.href,
        },
      })
    }
    return {
      crumb: 'Chỉnh sửa công việc' + ` #${taskId}`,
    }
  },
  validateSearch: (search) =>
    z
      .object({
        type: z.enum(['created', 'assigned', 'received']).optional(),
      })
      .parse(search),
  component: EditTaskPage,
})

export { Route as EditTaskRoute }
