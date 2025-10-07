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

export const useUpdateActivity = (queryParams: ActivitiesQueryParams) => {
  const queryClient = useQueryClient()

  return $queryClient.useMutation('put', '/api/activities/{id}', {
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

      const {
        title,
        location,
        startDate,
        endDate,
        description,
        participants,
        pinned,
      } = variables?.body || {}

      // Optimistically update the existing activity in the list
      queryClient.setQueryData<CalendarApiResponse>(
        activityKeysFactory.lists(queryParams),
        (old) => {
          if (
            !old?.data?.activities ||
            !Array.isArray(old.data.activities) ||
            !activityId
          )
            return old

          const updatedActivities = old.data.activities.map((activity) => {
            if (activity.id === activityId) {
              return {
                ...activity,
                title: title ?? activity.title,
                location: location ?? activity.location,
                startDate: startDate ?? activity.startDate,
                endDate: endDate ?? activity.endDate,
                description: description ?? activity.description,
                participants: participants ?? activity.participants,
                pinned: pinned ?? activity.pinned,
              }
            }
            return activity
          })

          return {
            ...old,
            data: {
              ...old.data,
              activities: updatedActivities,
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
