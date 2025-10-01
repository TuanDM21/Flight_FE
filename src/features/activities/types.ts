import { paths } from '@/generated/api-schema'

export type ActivitiesQueryParams =
  paths['/api/activities']['get']['parameters']['query']

export type Activity = Required<
  NonNullable<
    NonNullable<
      paths['/api/activities']['get']['responses']['200']['content']['*/*']['data']
    >['activities']
  >[0]
>
