import $queryClient from '@/api'
import { components } from '@/generated/api-schema'

export type ActivityDetailResponse = components['schemas']['ActivityDTO']

export const activityDetailQueryOptions = (activityId: number) => {
  return $queryClient.queryOptions('get', '/api/activities/{id}', {
    params: {
      path: {
        id: activityId,
      },
    },
  })
}
