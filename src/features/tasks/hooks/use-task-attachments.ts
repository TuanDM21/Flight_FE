import $queryClient from '@/api'

export const getTaskAttachmentsQueryOptions = (taskId: number) =>
  $queryClient.queryOptions('get', `/api/tasks/{id}/attachments`, {
    params: {
      path: {
        id: taskId,
      },
    },
  })

export const useTaskAttachments = (taskId: number) =>
  $queryClient.useQuery('get', `/api/tasks/{id}/attachments`, {
    params: {
      path: {
        id: taskId,
      },
    },
  })
