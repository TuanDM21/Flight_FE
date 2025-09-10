import { createFileRoute, Outlet } from '@tanstack/react-router'

const RouteComponent = () => <Outlet />

export const Route = createFileRoute('/_authenticated/tasks/my')({
  loader: async () => {
    return {
      crumb: 'Công việc của tôi',
    }
  },
  component: RouteComponent,
})
