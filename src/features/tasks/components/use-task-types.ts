import $queryClient from '@/api'

export const taskTypesQueryOptions = () => {
  return $queryClient.queryOptions('get', '/api/task-types')
}
