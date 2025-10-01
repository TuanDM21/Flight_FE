import { createFileRoute } from '@tanstack/react-router'
import { ActivitiesPage } from '@/features/activities'

export const Route = createFileRoute('/_authenticated/activities/')({
  component: ActivitiesPage,
})

export { Route as ActivitiesRoute }
