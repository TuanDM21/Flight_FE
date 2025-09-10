import { useQuery } from '@tanstack/react-query'
import $queryClient from '@/api'

export const subtasksQueryOptions = (parentTaskId: number) =>
  $queryClient.queryOptions('get', '/api/tasks/{id}/subtree', {
    params: {
      path: {
        id: parentTaskId,
      },
    },
  })

export const useSubTasks = (parentTaskId: number) =>
  useQuery({
    ...subtasksQueryOptions(parentTaskId),
    enabled: false,
  })
