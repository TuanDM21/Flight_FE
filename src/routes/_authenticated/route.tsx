import Cookies from 'js-cookie'
import { DropdownMenu } from '@radix-ui/react-dropdown-menu'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { BellIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CommandSearchProvider } from '@/context/command-search-context'
import { Button } from '@/components/ui/button'
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { NavigationBreadcrumb } from '@/components/navigation-breadcrumb'
import SkipToMain from '@/components/skip-to-main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'

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
  },
  loader: async () => {
    return {
      crumb: 'index',
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
            'ml-auto w-full max-w-full',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'sm:transition-[width] sm:duration-200 sm:ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
          )}
        >
          <Header>
            <NavigationBreadcrumb />

            <div className='ml-auto flex items-center gap-4'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className='flex items-center gap-2'>
                    <div className='relative'>
                      <Button variant='ghost' size='icon'>
                        <BellIcon />
                      </Button>
                      <span className='ring-background absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white shadow-sm ring-2'>
                        2
                      </span>
                    </div>
                  </div>
                </DropdownMenuTrigger>
              </DropdownMenu>
              <ThemeSwitch />
              <UserNav />
            </div>
          </Header>
          <Outlet />
        </div>
      </SidebarProvider>
    </CommandSearchProvider>
  )
}
