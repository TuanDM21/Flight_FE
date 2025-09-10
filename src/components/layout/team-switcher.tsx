import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'

export function TeamSwitcher() {
  const team = sidebarData.team

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center'
        >
          <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center rounded-lg'>
            <team.logo className='size-4' />
          </div>
          <div className='grid flex-1 overflow-hidden text-left text-sm leading-tight transition-all duration-200 ease-linear group-data-[collapsible=icon]:hidden'>
            <span className='truncate font-semibold'>{team.name}</span>
            <span className='truncate text-xs'>{team.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
