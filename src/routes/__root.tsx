import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { envVariables } from '@/lib/env'
import { AuthContext } from '@/context/auth-context'
import { DialogsProvider } from '@/context/dialogs-context'
import { NavigationProgress } from '@/components/navigation-progress'
import { AppAbility } from '@/features/ability/types'
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'

interface AppRouterContext {
  queryClient: QueryClient
  auth: AuthContext

  ability: AppAbility
}
export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: () => {
    return (
      <DialogsProvider>
        <NavigationProgress />
        <Outlet />
        {envVariables.mode === 'development' && (
          <>
            <ReactQueryDevtools buttonPosition='bottom-left' />
            <TanStackRouterDevtools position='bottom-right' />
          </>
        )}
      </DialogsProvider>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
