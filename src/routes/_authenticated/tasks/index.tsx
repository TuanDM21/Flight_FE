import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tasks/')({
  loader: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    } else {
      redirect({
        to: '/tasks/all',
        throw: true,
      })
    }
  },
})
