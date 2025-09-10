import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { taskKeysFactory } from '@/api/query-key-factory'
import { TaskResponse } from '@/features/tasks/types'
import { TaskFilterTypes } from '../types'

interface OptimisticUpdateContext {
  taskId: number
  previousTasksList?: BaseApiResponse<TaskResponse>
}

export const useDeleteTaskAttachment = (filterType: TaskFilterTypes) => {
  const queryClient = useQueryClient()
  return $queryClient.useMutation('delete', '/api/tasks/{id}/attachments', {
    meta: {
      invalidatesQuery: taskKeysFactory.listAssignees(filterType),
    },
    onMutate: async (variables): Promise<OptimisticUpdateContext> => {
      const taskId = variables?.params?.path?.id
      const attachmentIds = variables?.body?.attachmentIds

      await queryClient.cancelQueries({
        queryKey: taskKeysFactory.listAssignees(filterType),
      })

      // Snapshot previous values
      const previousTasksList = queryClient.getQueryData<
        BaseApiResponse<TaskResponse>
      >(taskKeysFactory.listAssignees(filterType))

      // Optimistically update the tasks list
      queryClient.setQueryData<BaseApiResponse<TaskResponse>>(
        taskKeysFactory.listAssignees(filterType),
        (old) => {
          if (!old?.data) return old
          return {
            ...old,
            data: {
              ...old.data,
              tasks: old.data?.tasks?.map((task) =>
                task.id === Number(taskId)
                  ? {
                      ...task,
                      attachments: task.attachments?.filter(
                        (att) =>
                          att.id !== undefined &&
                          !attachmentIds.includes(att.id)
                      ),
                    }
                  : task
              ),
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
      // Rollback optimistic updates
      if (typedContext.previousTasksList) {
        queryClient.setQueryData(
          taskKeysFactory.listAssignees(filterType),
          typedContext.previousTasksList
        )
      }
    },
  })
}
