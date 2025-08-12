import {
  IconChecklist,
  IconFileTypeDoc,
  IconPaperclip,
  IconPlaneArrival,
} from '@tabler/icons-react'
import { Command } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Flight Admin',
    email: 'flight@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  team: {
    name: 'Flight',
    logo: Command,
    plan: 'Flight',
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
        {
          title: 'Chuyến bay',
          url: '/flights',
          icon: IconPlaneArrival,
        },
        {
          title: 'Công việc',
          url: '/tasks',
          icon: IconChecklist,
        },
        {
          title: 'Công việc V2',
          url: '/tasks-v2',
          icon: IconChecklist,
        },
        {
          title: 'Tài liệu',
          url: '/documents',
          icon: IconFileTypeDoc,
        },
        {
          title: 'Tệp đính kèm',
          url: '/attachments',
          icon: IconPaperclip,
          items: [
            {
              title: 'Tệp của tôi',
              url: '/attachments',
            },
            {
              title: 'Được chia sẻ với tôi',
              url: '/attachments/shared-with-me',
            },
          ],
        },
      ],
    },
  ],
}
