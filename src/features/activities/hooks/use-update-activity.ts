import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { paths } from '@/generated/api-schema'
import { activityKeysFactory } from '@/api/query-key-factory'
import { ActivitiesQueryParams } from '../types'
import { ActivityDetailResponse } from './use-activity-detail'

type CalendarApiResponse =
  paths['/api/activities']['get']['responses']['200']['content']['*/*']

interface OptimisticUpdateActivityContext {
  previousActivities?: CalendarApiResponse
  previousActivityDetail?: ActivityDetailResponse
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

      if (activityId) {
        await queryClient.cancelQueries({
          queryKey: activityKeysFactory.detail(activityId),
        })
      }

      // Snapshot the current values
      const previousActivities = queryClient.getQueryData<CalendarApiResponse>(
        activityKeysFactory.lists(queryParams)
      )

      const previousActivityDetail = activityId
        ? queryClient.getQueryData<ActivityDetailResponse>(
            activityKeysFactory.detail(activityId)
          )
        : undefined

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

      // Optimistically update the activity detail
      if (activityId) {
        queryClient.setQueryData<ActivityDetailResponse>(
          activityKeysFactory.detail(activityId),
          (old) => {
            if (!old) return old

            return {
              ...old,
              title: title ?? old.title,
              location: location ?? old.location,
              startDate: startDate ?? old.startDate,
              endDate: endDate ?? old.endDate,
              description: description ?? old.description,
              participants: participants ?? old.participants,
              pinned: pinned ?? old.pinned,
            }
          }
        )
      }

      return { previousActivities, previousActivityDetail }
    },

    onError: (_, variables, context) => {
      const optimisticContext = context as OptimisticUpdateActivityContext
      const activityId = variables?.params?.path?.id

      // Rollback list on error
      if (optimisticContext?.previousActivities) {
        queryClient.setQueryData(
          activityKeysFactory.lists(queryParams),
          optimisticContext.previousActivities
        )
      }

      // Rollback detail on error
      if (activityId && optimisticContext?.previousActivityDetail) {
        queryClient.setQueryData(
          activityKeysFactory.detail(activityId),
          optimisticContext.previousActivityDetail
        )
      }
    },

    onSettled: async (_, __, variables) => {
      const activityId = variables?.params?.path?.id

      // Invalidate activities list
      await queryClient.invalidateQueries({
        queryKey: ['get', '/api/activities'],
      })

      // Invalidate activity detail
      if (activityId) {
        await queryClient.invalidateQueries({
          queryKey: activityKeysFactory.detail(activityId),
        })
      }
    },
  })
}
