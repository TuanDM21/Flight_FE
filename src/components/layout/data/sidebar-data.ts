import { IconChecklist } from '@tabler/icons-react'
import { TicketsPlane } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Flight Admin',
    email: 'flight@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  team: {
    name: 'Dong Hoi Airport',
    logo: TicketsPlane,
    plan: '',
  },
  navGroups: [
    {
      title: 'Tổng quan',
      items: [
        // {
        //   title: 'Bảng điều khiển',
        //   url: '/',
        //   icon: IconLayoutDashboard,
        // },
        // {
        //   title: 'Chuyến bay',
        //   url: '/flights',
        //   icon: IconPlaneArrival,
        // },
        {
          title: 'Công việc',
          url: '/tasks',
          icon: IconChecklist,
          items: [
            {
              title: 'Công việc chung',
              url: '/tasks/all',
            },
            {
              title: 'Công việc của tôi',
              url: '/tasks/my',
            },
          ],
        },
        // {
        //   title: 'Tài liệu',
        //   url: '/documents',
        //   icon: IconFileTypeDoc,
        // },
        // {
        //   title: 'Tệp đính kèm',
        //   url: '/attachments',
        //   icon: IconPaperclip,
        //   items: [
        //     {
        //       title: 'Tệp của tôi',
        //       url: '/attachments',
        //     },
        //     {
        //       title: 'Được chia sẻ với tôi',
        //       url: '/attachments/shared-with-me',
        //     },
        //   ],
        // },
      ],
    },
  ],
}
