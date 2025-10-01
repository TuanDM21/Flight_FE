import { useQuery } from '@tanstack/react-query'
import $queryClient from '@/api'
import { activityKeysFactory } from '@/api/query-key-factory'
import { ActivitiesQueryParams } from '../types'

export const activitiesQueryOptions = (queryParams?: ActivitiesQueryParams) =>
  $queryClient.queryOptions('get', '/api/activities', {
    params: {
      query: queryParams,
    },
  })

export const useActivities = (queryParams?: ActivitiesQueryParams) =>
  useQuery({
    ...activitiesQueryOptions(queryParams),
    queryKey: activityKeysFactory.lists(),
    enabled: false,
  })
