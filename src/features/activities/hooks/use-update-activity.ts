import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { activityKeysFactory } from '@/api/query-key-factory'
import { Activity } from '../types'

interface OptimisticUpdateActivityContext {
  previousActivities?: BaseApiResponse<Activity[]>
}

export const useUpdateActivity = () => {
  const queryClient = useQueryClient()

  return $queryClient.useMutation('put', '/api/activities/{id}', {
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

      const { name, location, startTime, endTime, notes, participants } =
        variables?.body || {}

      // Optimistically update the existing activity in the list
      queryClient.setQueryData<BaseApiResponse<Activity[]>>(
        activityKeysFactory.lists(),
        (old) => {
          if (!old?.data || !activityId) return old

          const updatedData = old.data.map((activity) => {
            if (activity.id === activityId) {
              return {
                ...activity,
                name: name ?? activity.name,
                location: location ?? activity.location,
                startTime: startTime ?? activity.startTime,
                endTime: endTime ?? activity.endTime,
                notes: notes ?? activity.notes,
                participants: participants ?? activity.participants,
                updatedAt: new Date().toISOString(),
              }
            }
            return activity
          })

          return {
            ...old,
            data: updatedData,
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
