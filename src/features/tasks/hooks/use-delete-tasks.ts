import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { taskKeysFactory } from '@/api/query-key-factory'
import { Task, TaskFilterTypes } from '@/features/tasks/types'

interface OptimisticBulkDeleteContext {
  taskIds: number[]
  previousTasksList?: BaseApiResponse<Task[]>
  previousTaskDetails?: Map<number, BaseApiResponse<Task>>
}

export const useDeleteTasks = (filterType: TaskFilterTypes) => {
  const queryClient = useQueryClient()

  return $queryClient.useMutation('delete', '/api/tasks/bulk-delete', {
    meta: {
      invalidatesQuery: [
        taskKeysFactory.listAssignees(filterType),
        taskKeysFactory.detail,
      ],
    },
    onMutate: async (variables): Promise<OptimisticBulkDeleteContext> => {
      const taskIds = variables?.body?.taskIds || []
      if (taskIds.length === 0) {
        return { taskIds: [] }
      }

      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: taskKeysFactory.listAssignees(filterType),
      })

      // Cancel queries for all task details
      for (const taskId of taskIds) {
        await queryClient.cancelQueries({
          queryKey: taskKeysFactory.detail(taskId),
        })
      }

      // Snapshot the previous values
      const previousTasksList = queryClient.getQueryData<
        BaseApiResponse<Task[]>
      >(taskKeysFactory.listAssignees(filterType))

      // Store previous task details
      const previousTaskDetails = new Map<number, BaseApiResponse<Task>>()
      for (const taskId of taskIds) {
        const taskDetail = queryClient.getQueryData<BaseApiResponse<Task>>(
          taskKeysFactory.detail(taskId)
        )
        if (taskDetail) {
          previousTaskDetails.set(taskId, taskDetail)
        }
      }

      // Optimistically update by removing the tasks with the given IDs
      queryClient.setQueryData(
        taskKeysFactory.listAssignees(filterType),
        (old: BaseApiResponse<Task[]> | undefined) => {
          if (!old?.data) return old

          return {
            ...old,
            data: old.data.filter((task) => !taskIds.includes(task.id!)),
          }
        }
      )

      // Remove all task details from cache
      for (const taskId of taskIds) {
        queryClient.removeQueries({
          queryKey: taskKeysFactory.detail(taskId),
        })
      }

      // Return the previous values so we can revert if something goes wrong
      return {
        taskIds,
        previousTasksList,
        previousTaskDetails,
      }
    },
    onError: (_error, _variables, context) => {
      const typedContext = context as OptimisticBulkDeleteContext | undefined
      if (!typedContext) return

      if (typedContext.previousTasksList) {
        queryClient.setQueryData(
          taskKeysFactory.listAssignees(filterType),
          typedContext.previousTasksList
        )
      }

      // Restore task details
      if (typedContext.previousTaskDetails) {
        for (const [taskId, taskDetail] of typedContext.previousTaskDetails) {
          queryClient.setQueryData(taskKeysFactory.detail(taskId), taskDetail)
        }
      }
    },
  })
}
