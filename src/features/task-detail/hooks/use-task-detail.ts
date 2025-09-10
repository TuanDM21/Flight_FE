import $queryClient from '@/api'

export const getTaskDetailQueryOptions = (taskId: number) =>
  $queryClient.queryOptions('get', '/api/tasks/{id}', {
    params: {
      path: {
        id: taskId,
      },
    },
  })
