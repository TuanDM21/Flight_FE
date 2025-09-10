import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { taskKeysFactory } from '@/api/query-key-factory'
import { TaskAssignment } from '../types'

export function useCreateTaskAssignmentsMutation() {
  const queryClient = useQueryClient()
  return $queryClient.useMutation('post', '/api/assignments', {
    onMutate: async (variables) => {
      // Extract the updated data
      const { assignments, taskId } = variables?.body || {}
      if (!taskId) return {}

      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: taskKeysFactory.assignments(taskId),
      })

      // Get the previous assignments data
      const previousTaskAssignments = queryClient.getQueryData<
        BaseApiResponse<TaskAssignment[]>
      >(taskKeysFactory.assignments(taskId))

      // Optimistically update the assignments list
      queryClient.setQueryData<BaseApiResponse<TaskAssignment[]>>(
        taskKeysFactory.assignments(taskId),
        (old) => {
          if (!old?.data) return old

          return {
            ...old,
            data: [...old.data, ...((assignments as TaskAssignment[]) || [])],
          }
        }
      )

      return {
        previousTaskAssignments,
        taskId,
      }
    },
    onError: (_, __, context: any) => {
      // Rollback to the previous assignments
      const taskId = context?.taskId
      if (!taskId) return
      queryClient.setQueryData(
        taskKeysFactory.assignments(taskId),
        context?.previousTaskAssignments
      )
    },
    onSettled: (_, __, variables) => {
      const taskId = variables?.body?.taskId
      if (!taskId) return
      queryClient.invalidateQueries({
        queryKey: taskKeysFactory.assignments(taskId),
      })
    },
  })
}
