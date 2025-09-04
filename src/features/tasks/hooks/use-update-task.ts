import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { taskKeysFactory } from '@/api/query-key-factory'
import { TaskFilterTypes, TaskResponse } from '@/features/tasks/types'

interface OptimisticUpdateContext {
  taskId: number
  previousTasksList?: BaseApiResponse<TaskResponse>
}

export const useUpdateTask = (filterType: TaskFilterTypes) => {
  const queryClient = useQueryClient()

  return $queryClient.useMutation('put', '/api/tasks/{id}', {
    onMutate: async (variables) => {
      // Get the task ID from the variables
      const taskId = variables.params.path.id

      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: taskKeysFactory.listAssignees(filterType),
      })

      // Snapshot the previous values
      const previousTasksList = queryClient.getQueryData<
        BaseApiResponse<TaskResponse>
      >(taskKeysFactory.listAssignees(filterType))

      // Extract the updated data
      const { content, instructions, notes, title, priority } =
        variables?.body || {}

      // Optimistically update the task detail
      queryClient.setQueryData<BaseApiResponse<TaskResponse>>(
        taskKeysFactory.detail(Number(taskId)),
        (old) => {
          if (!old?.data) return old

          return {
            ...old,
            data: {
              ...old.data,
              ...(priority !== undefined && { priority }),
              ...(content !== undefined && { content }),
              ...(instructions !== undefined && { instructions }),
              ...(notes !== undefined && { notes }),
              ...(title !== undefined && { title }),
              updatedAt: new Date().toISOString(),
            },
          }
        }
      )

      // Optimistically update the tasks list
      queryClient.setQueryData<BaseApiResponse<TaskResponse>>(
        taskKeysFactory.listAssignees(filterType),
        (oldResponse) => {
          if (!oldResponse?.data) return oldResponse

          return {
            ...oldResponse,
            data: {
              ...oldResponse.data,
              tasks: (oldResponse.data?.tasks || []).map((oldData) => {
                if (oldData.id === Number(taskId)) {
                  return {
                    ...oldData,
                    ...(priority !== undefined && { priority }),
                    ...(content !== undefined && { content }),
                    ...(instructions !== undefined && { instructions }),
                    ...(notes !== undefined && { notes }),
                    ...(title !== undefined && { title }),
                    updatedAt: new Date().toISOString(),
                  }
                }
                return oldData
              }),
            },
          }
        }
      )

      return {
        taskId: Number(taskId),
        previousTasksList,
      }
    },
    onError: (_error, _variables, context) => {
      const typedContext = context as OptimisticUpdateContext | undefined
      if (!typedContext) return

      if (typedContext.previousTasksList) {
        queryClient.setQueryData(
          taskKeysFactory.listAssignees(filterType),
          typedContext.previousTasksList
        )
      }
    },
    onSettled: async (_data, _error, _variables, _context) => {
      // Always refetch after error or success
      await queryClient.invalidateQueries({
        queryKey: taskKeysFactory.listAssignees(filterType),
      })
    },
  })
}
