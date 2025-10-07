import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  loader: ({ context }) => {
    if (context.auth.isAuthenticated) {
      redirect({
        to: '/tasks/all',
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
