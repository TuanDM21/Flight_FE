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

export function useUpdateTaskContent(filterType: TaskFilterTypes = 'assigned') {
  const queryClient = useQueryClient()

  return $queryClient.useMutation('put', '/api/tasks/{id}', {
    onMutate: async (variables): Promise<OptimisticUpdateContext> => {
      const taskId = variables?.params?.path?.id
      const content = variables?.body?.content

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
        (old: BaseApiResponse<Task> | undefined) => {
          if (!old?.data) return old

          return {
            ...old,
            data: {
              ...old.data,
              content,
              updatedAt: new Date().toISOString(),
            },
          }
        }
      )

      // Optimistically update the tasks list
      queryClient.setQueryData(
        taskKeysFactory.listAssignees(filterType),
        (old: BaseApiResponse<Task[]> | undefined) => {
          if (!old?.data) return old

          return {
            ...old,
            data: old.data.map((task: Task) =>
              task.id === Number(taskId)
                ? {
                    ...task,
                    content,
                    updatedAt: new Date().toISOString(),
                  }
                : task
            ),
          }
        }
      )

      return {
        taskId: Number(taskId),
        previousTaskDetail,
        previousTasksList,
      }
    },
    onSuccess: () => {
      toast.success('Cập nhật nội dung công việc thành công')
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

      if (typedContext.previousTaskDetail) {
        queryClient.setQueryData(
          taskKeysFactory.detail(typedContext.taskId),
          typedContext.previousTaskDetail
        )
      }

      toast.error('Có lỗi xảy ra khi cập nhật nội dung công việc')
    },
    onSettled: (_data, _error, _variables, context) => {
      const typedContext = context as OptimisticUpdateContext | undefined
      if (!typedContext) return

      // Invalidate and refetch to ensure consistency
      void queryClient.invalidateQueries({
        queryKey: taskKeysFactory.detail(typedContext.taskId),
      })
      void queryClient.invalidateQueries({
        queryKey: taskKeysFactory.listAssignees(filterType),
      })
    },
  })
}
