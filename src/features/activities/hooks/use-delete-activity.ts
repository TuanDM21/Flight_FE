import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { paths } from '@/generated/api-schema'
import { activityKeysFactory } from '@/api/query-key-factory'
import { ActivitiesQueryParams } from '../types'

type CalendarApiResponse =
  paths['/api/activities']['get']['responses']['200']['content']['*/*']

interface OptimisticUpdateActivityContext {
  previousActivities?: CalendarApiResponse
}

export const useDeleteActivity = (queryParams: ActivitiesQueryParams) => {
  const queryClient = useQueryClient()

  return $queryClient.useMutation('delete', '/api/activities/{id}', {
    onMutate: async (variables) => {
      const activityId = variables?.params?.path?.id

      // Cancel any outgoing refetches to prevent them overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: activityKeysFactory.lists(queryParams),
      })

      // Snapshot the current value
      const previousActivities = queryClient.getQueryData<CalendarApiResponse>(
        activityKeysFactory.lists(queryParams)
      )

      // Optimistically remove the activity from the list
      queryClient.setQueryData<CalendarApiResponse>(
        activityKeysFactory.lists(queryParams),
        (old) => {
          if (
            !old?.data?.activities ||
            !Array.isArray(old.data.activities) ||
            !activityId
          )
            return old

          const filteredActivities = old.data.activities.filter(
            (activity) => activity.id !== activityId
          )

          return {
            ...old,
            data: {
              ...old.data,
              activities: filteredActivities,
            },
          }
        }
      )

      return { previousActivities }
    },

    onError: (_, __, context) => {
      const optimisticContext = context as OptimisticUpdateActivityContext
      if (optimisticContext?.previousActivities) {
        queryClient.setQueryData(
          activityKeysFactory.lists(queryParams),
          optimisticContext.previousActivities
        )
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['get', '/api/activities'],
      })
    },
  })
}
