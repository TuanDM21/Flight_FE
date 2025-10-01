import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { activityKeysFactory } from '@/api/query-key-factory'
import { Activity } from '../types'

interface OptimisticUpdateActivityContext {
  previousActivities?: BaseApiResponse<Activity[]>
}

export const useDeleteActivity = () => {
  const queryClient = useQueryClient()

  return $queryClient.useMutation('delete', '/api/activities/{id}', {
    onMutate: async (variables) => {
      const activityId = variables?.params?.path?.id

      // Cancel any outgoing refetches to prevent them overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: activityKeysFactory.lists(),
      })

      // Snapshot the current value
      const previousActivities = queryClient.getQueryData<
        BaseApiResponse<Activity[]>
      >(activityKeysFactory.lists())

      // Optimistically remove the activity from the list
      queryClient.setQueryData<BaseApiResponse<Activity[]>>(
        activityKeysFactory.lists(),
        (old) => {
          if (!old?.data || !activityId) return old

          const filteredData = old.data.filter(
            (activity) => activity.id !== activityId
          )

          return {
            ...old,
            data: filteredData,
          }
        }
      )

      return { previousActivities }
    },

    onError: (_, __, context) => {
      const optimisticContext = context as OptimisticUpdateActivityContext
      if (optimisticContext?.previousActivities) {
        queryClient.setQueryData(
          activityKeysFactory.lists(),
          optimisticContext.previousActivities
        )
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: activityKeysFactory.lists(),
      })
    },
  })
}
