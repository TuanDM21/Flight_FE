import { createFileRoute, redirect } from '@tanstack/react-router'
import { ChangePasswordPage } from '@/features/auth/change-password'

export const Route = createFileRoute('/change-password')({
  beforeLoad: ({ context, location }) => {
    // If not authenticated, redirect to login
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    // If not requires password change, redirect to tasks
    if (!context.auth.requiresPasswordChange) {
      throw redirect({
        to: '/tasks',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <ChangePasswordPage isForced={true} />
}
