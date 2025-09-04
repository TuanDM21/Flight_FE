import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { taskKeysFactory } from '@/api/query-key-factory'
import { useAuth } from '@/context/auth-context'
import { TaskAttachment, TaskFilterTypes, TaskResponse } from '../types'

interface LinkAttachmentsToTaskContext {
  previousTasksList: BaseApiResponse<TaskResponse> | undefined
}

export const useUploadTaskAttachments = (filterType: TaskFilterTypes) => {
  const queryClient = useQueryClient()
  const auth = useAuth()

  return $queryClient.useMutation('post', '/api/tasks/{id}/attachments', {
    onMutate: async (variables) => {
      const taskId = variables.params.path.id
      const attachmentIds = variables.body.attachmentIds || []

      await queryClient.cancelQueries({
        queryKey: taskKeysFactory.listAssignees(filterType),
      })

      const previousTasksList = queryClient.getQueryData<
        BaseApiResponse<TaskResponse>
      >(taskKeysFactory.listAssignees(filterType))

      // Create optimistic attachments
      const optimisticAttachments: TaskAttachment[] = attachmentIds.map(
        (id: number, index: number) => ({
          id,
          filePath: `temp-file-${id}`,
          fileName: `Uploading file ${index + 1}...`,
          fileSize: 0,
          uploadedBy: auth.user!,
          createdAt: new Date().toISOString(),
          sharedCount: 0,
        })
      )

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
                      attachments: [
                        ...(task.attachments || []),
                        ...optimisticAttachments,
                      ],
                    }
                  : task
              ),
            },
          }
        }
      )

      return {
        previousTasksList,
        taskId: Number(taskId),
      }
    },
    onError: (_error: unknown, _variables: unknown, context: unknown) => {
      const typedContext = context as LinkAttachmentsToTaskContext

      if (!typedContext) return

      const { previousTasksList } = typedContext

      // Rollback tasks list
      if (previousTasksList) {
        queryClient.setQueryData(
          taskKeysFactory.listAssignees(filterType),
          previousTasksList
        )
      }
    },
    onSettled: async (_data: unknown, _error: unknown, variables) => {
      const taskId = variables?.params?.path?.id
      if (!taskId) return

      // Invalidate both queries to ensure fresh data
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: taskKeysFactory.listAssignees(filterType),
        }),
      ])
    },
  })
}
