import { createFileRoute } from '@tanstack/react-router'
import { ActivitiesPage } from '@/features/activities'
import { searchActivityParamsSchema } from '@/features/activities/schema'

export const Route = createFileRoute('/_authenticated/activities/')({
  validateSearch: (search) => {
    return searchActivityParamsSchema.parse(search)
  },
  component: ActivitiesPage,
})

export { Route as ActivitiesRoute }
