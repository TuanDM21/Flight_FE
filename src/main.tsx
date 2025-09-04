import ReactDOM from 'react-dom/client'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { toast } from 'sonner'
import { Toaster } from './components/ui/sonner'
import { AuthProvider, useAuth } from './context/auth-context'
import { FontProvider } from './context/font-context'
import { ThemeProvider } from './context/theme-context'
import AbilityProvider from './features/ability/context/ability'
import { useAbility } from './features/ability/hooks/use-ability'
import './index.css'
import { loadEnvVariables } from './lib/env'
import { FetchError } from './models/fetch-error'
import { routeTree } from './routeTree.gen'

loadEnvVariables()

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSettled: (_data, _error, _variables, _context, mutation) => {
      {
        if (mutation.meta?.invalidatesQuery) {
          queryClient.invalidateQueries({
            queryKey: mutation.meta?.invalidatesQuery,
          })
        }
      }
    },
  }),
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof FetchError) {
        if (FetchError.isHttpError(error, 401)) {
          toast.error('Phiên đăng nhập đã hết hạn!')
          const redirect = router.history.location.href
          void router.navigate({ to: '/sign-out', search: { redirect } })
        } else if (FetchError.isServerError(error)) {
          toast.error('Lỗi máy chủ nội bộ!')
          void router.navigate({ to: '/500' })
        } else if (FetchError.isNetworkError(error)) {
          toast.error('Lỗi kết nối mạng!')
        } else if (FetchError.isTimeoutError(error)) {
          toast.error('Hết thời gian chờ yêu cầu!')
        }
      }
    },
  }),
})

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
    queryClient,
    ability: undefined!,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

export function App() {
  const auth = useAuth()
  const ability = useAbility()
  return <RouterProvider router={router} context={{ auth, ability }} />
}

const rootElement = document.querySelector('#root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    // <StrictMode>
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
            <FontProvider>
              <AbilityProvider>
                <App />
                <Toaster richColors className='pointer-events-auto' />
              </AbilityProvider>
            </FontProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </NuqsAdapter>

    // </StrictMode>
  )
}
