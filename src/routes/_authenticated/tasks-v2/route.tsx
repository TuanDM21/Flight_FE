import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tasks-v2')({
  component: Outlet,
  loader: () => {
    return {
      crumb: 'Danh sách công việc V2',
    }
  },
})
