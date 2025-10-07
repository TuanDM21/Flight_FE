import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { activityKeysFactory } from '@/api/query-key-factory'
import { ActivitiesQueryParams, Activity } from '../types'

interface OptimisticCreateActivityContext {
  previousActivities?: BaseApiResponse<{
    currentDate: string
    activities: Activity[]
    activityType: string
  }>
}

export const useCreateActivity = (queryParams: ActivitiesQueryParams) => {
  const queryClient = useQueryClient()

  return $queryClient.useMutation('post', '/api/activities', {
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to prevent them overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: activityKeysFactory.lists(queryParams),
      })

      // Snapshot the current value
      const previousActivities = queryClient.getQueryData<
        BaseApiResponse<{
          currentDate: string
          activities: Activity[]
          activityType: string
        }>
      >(activityKeysFactory.lists(queryParams))

      const { title, location, startDate, endDate, description, participants } =
        variables?.body || {}

      // Optimistically update the list by adding the new activity
      queryClient.setQueryData<
        BaseApiResponse<{
          currentDate: string
          activities: Activity[]
          activityType: string
        }>
      >(activityKeysFactory.lists(queryParams), (old) => {
        if (!old?.data) return old

        const newActivityData: Activity = {
          id: Date.now(),
          title: title || '',
          location: location || '',
          startDate: startDate,
          endDate: endDate,
          description: description || '',
          participants: participants || [],
          pinned: false,
        }

        return {
          ...old,
          data: {
            ...old.data,
            activities: [newActivityData, ...(old.data.activities || [])],
          },
        }
      })

      return { previousActivities }
    },

    onError: (_, __, context) => {
      const optimisticContext = context as OptimisticCreateActivityContext
      if (optimisticContext?.previousActivities) {
        queryClient.setQueryData(
          activityKeysFactory.lists(queryParams),
          optimisticContext.previousActivities
        )
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: activityKeysFactory.lists(queryParams),
      })
    },
  })
}
