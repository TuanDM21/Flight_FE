import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  loader: async ({ context }) => {
    if (context.auth.isAuthenticated) {
      redirect({
        to: '/tasks',
        throw: true,
      })
    } else {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})
