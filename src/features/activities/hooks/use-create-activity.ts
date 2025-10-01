import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { activityKeysFactory } from '@/api/query-key-factory'
import { Activity } from '../types'

interface OptimisticCreateActivityContext {
  previousActivities?: BaseApiResponse<Activity[]>
}

export const useCreateActivity = () => {
  const queryClient = useQueryClient()

  return $queryClient.useMutation('post', '/api/activities', {
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to prevent them overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: activityKeysFactory.lists(),
      })

      // Snapshot the current value
      const previousActivities = queryClient.getQueryData<
        BaseApiResponse<Activity[]>
      >(activityKeysFactory.lists())

      const { name, location, startTime, endTime, notes, participants } =
        variables?.body || {}

      // Optimistically update the list by adding the new activity
      queryClient.setQueryData<BaseApiResponse<Activity[]>>(
        activityKeysFactory.lists(),
        (old) => {
          if (!old?.data) return old

          const newActivityData: Activity = {
            id: Date.now(),
            name: name || '',
            location: location || '',
            startTime: startTime || new Date().toISOString(),
            endTime: endTime || new Date().toISOString(),
            notes: notes || '',
            participants: participants || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            pinned: false,
          }

          return {
            ...old,
            data: [newActivityData, ...(old.data || [])],
          }
        }
      )

      return { previousActivities }
    },

    onError: (_, __, context) => {
      const optimisticContext = context as OptimisticCreateActivityContext
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
