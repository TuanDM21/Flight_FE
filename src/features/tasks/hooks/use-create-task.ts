import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { taskKeysFactory } from '@/api/query-key-factory'
import { Task, TaskResponse } from '../types'

interface OptimisticCreateTaskContext {
  previousTasks?: BaseApiResponse<TaskResponse>
}

export const useCreateTask = (filterType = 'assigned') => {
  const queryClient = useQueryClient()
  return $queryClient.useMutation('post', '/api/tasks', {
    meta: {
      invalidatesQuery: [taskKeysFactory.listAssignees(filterType)],
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to prevent them overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: taskKeysFactory.listAssignees(filterType),
      })
      // Snapshot the current value
      const previousTasks = queryClient.getQueryData<
        BaseApiResponse<TaskResponse[]>
      >(taskKeysFactory.listAssignees(filterType))
      // Optimistically update the list by adding the new task
      queryClient.setQueryData<BaseApiResponse<TaskResponse>>(
        taskKeysFactory.listAssignees(filterType),
        (old) => {
          if (!old?.data) return old
          const { content, instructions, notes, assignments } =
            variables?.body || {}
          const newTaskData: Task = {
            id: Date.now(),
            content,
            instructions,
            notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'OPEN',
            assignments: assignments ?? [],
          }
          return {
            ...old,
            data: {
              ...old.data,
              tasks: [newTaskData, ...(old.data.tasks || [])],
            },
          }
        }
      )
      return { previousTasks }
    },
    onError: (_, __, context) => {
      const optimisticContext = context as OptimisticCreateTaskContext
      // Restore the previous state if available
      if (optimisticContext?.previousTasks) {
        queryClient.setQueryData(
          taskKeysFactory.listAssignees(filterType),
          optimisticContext.previousTasks
        )
      }
    },
  })
}
