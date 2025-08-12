import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tasks')({
  component: Outlet,
  loader: () => {
    return {
      crumb: 'Danh sách công việc',
    }
  },
})
