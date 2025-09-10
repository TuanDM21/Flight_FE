import React from 'react'
import { DropdownMenu } from '@radix-ui/react-dropdown-menu'
import { BellIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { NavigationBreadcrumb } from '@/components/navigation-breadcrumb'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { Separator } from '../ui/separator'
import { SidebarTrigger } from '../ui/sidebar'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export const Header = ({
  className,
  fixed,
  children,
  ...props
}: HeaderProps) => {
  const [offset, setOffset] = React.useState(0)

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        'bg-background flex h-16 items-center gap-3 py-4 sm:gap-4',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-md',
        offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
        className
      )}
      {...props}
    >
      <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />
      <Separator orientation='vertical' className='h-6' />
      {children}
      <NavigationBreadcrumb />
      <div className='ml-auto flex items-center gap-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className='flex items-center gap-2'>
              <div className='relative'>
                <Button variant='ghost' size='icon'>
                  <BellIcon />
                </Button>
                <span className='ring-background bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium shadow-sm ring-2'>
                  2
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
        </DropdownMenu>
        <ThemeSwitch />
        <UserNav />
      </div>
    </header>
  )
}

Header.displayName = 'Header'
