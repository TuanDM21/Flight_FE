import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { taskKeysFactory } from '@/api/query-key-factory'
import { TaskAssignment, TaskFilterTypes } from '@/features/tasks/types'

interface OptimisticUpdateTaskAssignmentContext {
  assignmentId: number
  previousTaskAssignments?: BaseApiResponse<TaskAssignment[]>
}

export const useUpdateTaskAssignment = (
  taskId: number,
  filterType: TaskFilterTypes
) => {
  const queryClient = useQueryClient()

  return $queryClient.useMutation('put', '/api/assignments/{id}', {
    onMutate: async (
      variables
    ): Promise<OptimisticUpdateTaskAssignmentContext> => {
      const assignmentId = variables.params.path.id

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: taskKeysFactory.assignments(taskId),
      })
      await queryClient.cancelQueries({
        queryKey: taskKeysFactory.listAssignees(filterType),
      })

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
            data: old.data.map((assignment) => {
              if (assignment.assignmentId === assignmentId) {
                return {
                  ...assignment,
                  ...variables.body,
                  recipientType: variables.body
                    .recipientType as TaskAssignment['recipientType'],
                  updatedAt: new Date().toISOString(),
                }
              }
              return assignment
            }),
          }
        }
      )

      return {
        assignmentId: Number(assignmentId),
        previousTaskAssignments,
      }
    },
    onError: (_error, _variables, context) => {
      const typedContext = context as OptimisticUpdateTaskAssignmentContext

      // Rollback to the previous state
      if (typedContext.previousTaskAssignments) {
        queryClient.setQueryData(
          taskKeysFactory.assignments(taskId),
          typedContext.previousTaskAssignments
        )
      }
    },
    onSettled: (_data, _error, _variables, _context) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: taskKeysFactory.assignments(taskId),
      })
      queryClient.invalidateQueries({
        queryKey: taskKeysFactory.listAssignees(filterType),
      })
    },
  })
}
