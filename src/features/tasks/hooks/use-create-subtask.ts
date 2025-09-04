import $queryClient from '@/api'

export const useCreateSubtask = () => {
  return $queryClient.useMutation('post', '/api/tasks/{parentId}/subtasks')
}
