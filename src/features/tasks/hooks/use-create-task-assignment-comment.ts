import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { taskKeysFactory } from '@/api/query-key-factory'
import { useAuth } from '@/context/auth-context'
import { TaskAssignmentComment } from '../types'

export const useCreateTaskAssignmentComment = (assignmentId: number) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return $queryClient.useMutation('post', '/api/assignments/{id}/comment', {
    params: {
      id: assignmentId,
    },
    onMutate: async (data) => {
      if (!user) return

      const previousComments = queryClient.getQueryData<
        TaskAssignmentComment[]
      >(taskKeysFactory.assignmentComments(assignmentId))

      const formValues = data.body

      if (previousComments) {
        queryClient.setQueryData<BaseApiResponse<TaskAssignmentComment[]>>(
          taskKeysFactory.assignmentComments(assignmentId),
          (old) => {
            if (!old?.data) return old
            return {
              ...old,
              data: [
                ...old.data,
                {
                  assignmentId: assignmentId,
                  createdAt: new Date().toISOString(),
                  id: new Date().getTime(),
                  comment: formValues.comment,
                  user: user,
                },
              ],
            }
          }
        )
      }
    },
  })
}
