import { UserProfile } from '@/features/me/types'

export interface Assignment {
  assignmentId: number
  taskId: number
  recipientType: string
  assignedAt: string
  dueAt: string | null
  completedAt: string | null
  status: string
  note: string
  assignedByUser: UserProfile
  completedByUser: UserProfile | null
  recipientUser: UserProfile
  recipientId: number
}

export interface Attachment {
  id: number
  filePath: string
  fileName: string
  fileSize: number
  createdAt: string
  uploadedBy: UserProfile
  sharedCount: number | null
}

export interface Task {
  id: number
  title: string
  content: string
  instructions: string
  notes: string | null
  createdAt: string
  updatedAt: string
  startDate?: string | null
  dueDate?: string | null
  createdByUser: UserProfile
  assignments: Assignment[]
  status: 'OPEN' | 'COMPLETED' | 'IN_PROGRESS'
  priority: 'URGENT' | 'NORMAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  parentId: number | null
  subtasks: Task[]
  hierarchyLevel: number | null
  attachments: Attachment[]
}

export interface StatusGroupProps {
  status: 'OPEN' | 'COMPLETED' | 'IN_PROGRESS'
  tasks: Task[]
  expanded: boolean
  onToggle: () => void
  onTaskClick?: (taskId: number) => void
}

export interface TaskRowProps {
  task: Task
  level?: number
  expanded?: boolean
  onToggle?: () => void
}
