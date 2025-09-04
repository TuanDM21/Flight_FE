import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { toast } from 'sonner'
import { taskKeysFactory } from '@/api/query-key-factory'
import { Task, TaskFilterTypes } from '@/features/tasks/types'

interface OptimisticUpdateContext {
  taskId: number
  previousTaskDetail?: BaseApiResponse<Task>
  previousTasksList?: BaseApiResponse<Task[]>
}

export function useUpdateTaskPriority(
  filterType: TaskFilterTypes = 'assigned'
) {
  const queryClient = useQueryClient()

  return $queryClient.useMutation('put', '/api/tasks/{id}', {
    onMutate: async (variables): Promise<OptimisticUpdateContext> => {
      const taskId = variables?.params?.path?.id
      const priority = variables?.body?.priority

      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: taskKeysFactory.detail(Number(taskId)),
      })
      await queryClient.cancelQueries({
        queryKey: taskKeysFactory.listAssignees(filterType),
      })

      // Snapshot the previous values
      const previousTaskDetail = queryClient.getQueryData<
        BaseApiResponse<Task>
      >(taskKeysFactory.detail(Number(taskId)))
      const previousTasksList = queryClient.getQueryData<
        BaseApiResponse<Task[]>
      >(taskKeysFactory.listAssignees(filterType))

      // Optimistically update the task detail
      queryClient.setQueryData(
        taskKeysFactory.detail(Number(taskId)),
        (old?: BaseApiResponse<Task>) => {
          if (old?.data) {
            return {
              ...old,
              data: {
                ...old.data,
                priority,
              },
            }
          }
          return old
        }
      )

      // Optimistically update the tasks list
      queryClient.setQueryData(
        taskKeysFactory.listAssignees(filterType),
        (old?: BaseApiResponse<Task[]>) => {
          if (old?.data) {
            return {
              ...old,
              data: old.data.map((task) =>
                task.id === taskId ? { ...task, priority } : task
              ),
            }
          }
          return old
        }
      )

      return { taskId: Number(taskId), previousTaskDetail, previousTasksList }
    },
    onError: (_error, _variables, context) => {
      const typedContext = context as OptimisticUpdateContext | undefined
      if (!typedContext) return

      // Rollback optimistic updates
      if (typedContext.previousTaskDetail) {
        queryClient.setQueryData(
          taskKeysFactory.detail(typedContext.taskId),
          typedContext.previousTaskDetail
        )
      }
      if (typedContext.previousTasksList) {
        queryClient.setQueryData(
          taskKeysFactory.listAssignees(filterType),
          typedContext.previousTasksList
        )
      }

      toast.error('Có lỗi xảy ra khi cập nhật độ ưu tiên')
    },
    onSuccess: () => {
      toast.success('Cập nhật độ ưu tiên thành công')
    },
    onSettled: (_data, _error, variables) => {
      const taskId = variables?.params?.path?.id
      // Always refetch after error or success to ensure consistency
      void queryClient.invalidateQueries({
        queryKey: taskKeysFactory.detail(Number(taskId)),
      })
      void queryClient.invalidateQueries({
        queryKey: taskKeysFactory.listAssignees(filterType),
      })
    },
  })
}
