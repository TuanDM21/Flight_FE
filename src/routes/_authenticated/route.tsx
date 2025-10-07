import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { CommandSearchProvider } from '@/context/command-search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import SkipToMain from '@/components/skip-to-main'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    // Check if user needs to change password
    if (context.auth.requiresPasswordChange) {
      throw redirect({
        to: '/change-password',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <CommandSearchProvider>
      <SidebarProvider defaultOpen={false}>
        <SkipToMain />
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'w-full max-w-full flex-1',
            'transition-all duration-200 ease-in-out',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'sm:transition-[width] sm:duration-200 sm:ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh',
            'px-3'
          )}
        >
          <Header />
          <Outlet />
        </div>
      </SidebarProvider>
    </CommandSearchProvider>
  )
}
