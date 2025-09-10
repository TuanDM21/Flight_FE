import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { taskKeysFactory } from '@/api/query-key-factory'
import { Task, TaskFilterTypes, TaskResponse } from '../types'

interface OptimisticCreateTaskContext {
  previousTasks?: BaseApiResponse<TaskResponse>
}

export const useCreateTask = (filterType: TaskFilterTypes) => {
  const queryClient = useQueryClient()
  return $queryClient.useMutation('post', '/api/tasks', {
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to prevent them overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: taskKeysFactory.listAssignees(filterType),
      })
      // Snapshot the current value
      const previousTasks = queryClient.getQueryData<
        BaseApiResponse<TaskResponse[]>
      >(taskKeysFactory.listAssignees(filterType))
      const { content, instructions, notes, assignments, title } =
        variables?.body || {}
      if (
        (assignments?.length !== 0 && filterType === 'created') ||
        (assignments?.length === 0 && filterType !== 'created')
      )
        return {
          previousTasks,
        }

      // Optimistically update the list by adding the new task
      queryClient.setQueryData<BaseApiResponse<TaskResponse>>(
        taskKeysFactory.listAssignees(filterType),
        (old) => {
          if (!old?.data) return old
          const newTaskData: Task = {
            id: Date.now(),
            title,
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
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({
        queryKey: taskKeysFactory.listAssignees(filterType),
      })
    },
  })
}
