import $queryClient from '@/api'

export const tasksQueryOptions = () =>
  $queryClient.queryOptions('get', '/api/tasks')

export const useTasks = () => tasksQueryOptions()
