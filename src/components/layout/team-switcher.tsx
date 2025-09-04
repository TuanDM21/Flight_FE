import { LeafIcon } from 'lucide-react'
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
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
        >
          <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-7 items-center justify-center rounded-lg'>
            <team.logo className='size-4' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>{team.name}</span>
            <span className='truncate text-xs'>{team.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
