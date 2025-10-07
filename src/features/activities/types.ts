import { paths } from '@/generated/api-schema'
import { Except } from 'type-fest'

export type ActivitiesQueryParams =
  paths['/api/activities']['get']['parameters']['query']

export type Activity = Except<
  Required<
    NonNullable<
      NonNullable<
        paths['/api/activities']['get']['responses']['200']['content']['*/*']['data']
      >['activities']
    >[0]
  >,
  'createdAt' | 'updatedAt'
>
