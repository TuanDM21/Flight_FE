import { createElement } from 'react'
import { Option } from '@/types/data-table'
import {
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronsUp,
  ChevronUp,
  CircleEllipsis,
  Clock,
  Equal,
  FileAudio,
  FileIcon,
  FileImage,
  FileText,
  FileVideo,
} from 'lucide-react'
import { AttachmentItem } from '@/features/attachments/types'
import {
  TaskAssignmentStatus,
  TaskPriority,
  TaskStatus,
} from '@/features/tasks/types'

// Utility functions
const mergeClassNames = (base: string, incoming?: string): string =>
  incoming ? `${base} ${incoming}` : base

const createIconComponent =
  (
    Icon: React.ElementType,
    baseClass = ''
  ): React.FC<React.SVGProps<SVGSVGElement>> =>
  (props) =>
    createElement(Icon, {
      ...props,
      className: mergeClassNames(baseClass, props?.className),
    })

// Task status configuration
export const taskStatusLabels: Record<TaskStatus, string> = {
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  OPEN: 'Mới',
  OVERDUE: 'Quá hạn',
}

export const taskStatusFilterLabels: Record<TaskStatus, string> = {
  OPEN: 'Mới',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  OVERDUE: 'Quá hạn',
}

export const taskStatusStyles: Record<TaskStatus, string> = {
  OPEN: 'bg-slate-100 text-slate-800 border-slate-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  OVERDUE: 'bg-red-100 text-red-800 border-red-200',
}

export const taskStatusIcons: Record<
  TaskStatus,
  React.FC<React.SVGProps<SVGSVGElement>>
> = {
  OPEN: createIconComponent(CircleEllipsis, 'text-slate-700'),
  IN_PROGRESS: createIconComponent(Clock, 'text-blue-700'),
  COMPLETED: createIconComponent(CheckCircle, 'text-green-700'),
  OVERDUE: createIconComponent(Ban, 'text-red-700'),
}

export const taskStatusOptions: Option[] = Object.entries(taskStatusLabels).map(
  ([value, label]) => ({
    value,
    label,
    icon: taskStatusIcons[value as TaskStatus],
  })
)
export const taskStatusFilterOptions: Option[] = Object.entries(
  taskStatusFilterLabels
).map(([value, label]) => ({
  value,
  label,
  icon: taskStatusIcons[value as TaskStatus],
}))

// Task assignment status configuration
export const allTaskAssignmentStatusLabels: Record<
  TaskAssignmentStatus,
  string
> = {
  WORKING: 'Đang thực hiện',
  CANCELLED: 'Đã hủy',
  DONE: 'Đã hoàn thành',
  OVERDUE: 'Quá hạn',
}

export const assigneeTaskAssignmentStatusLabels: Partial<
  Record<TaskAssignmentStatus, string>
> = {
  CANCELLED: 'Đã hủy',
  WORKING: 'Đang thực hiện',
  DONE: 'Đã hoàn thành',
}

export const ownerTaskAssignmentStatusLabels: Partial<
  Record<TaskAssignmentStatus, string>
> = {
  CANCELLED: 'Đã hủy',
  WORKING: 'Đang thực hiện',
  DONE: 'Đã hoàn thành',
}

export const taskAssignmentsStatusStyles: Record<TaskAssignmentStatus, string> =
  {
    WORKING: 'bg-blue-100 text-blue-800 border-blue-200',
    DONE: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
    OVERDUE: 'bg-red-100 text-red-800 border-red-200',
  }

export const taskAssignmentsStatusIcons: Record<
  TaskAssignmentStatus,
  React.ElementType
> = {
  WORKING: CheckCircle,
  DONE: CheckCircle,
  CANCELLED: Ban,
  OVERDUE: Clock,
}

// Task priority configuration
export const priorityLabels: Record<TaskPriority, string> = {
  LOW: 'Thấp',
  NORMAL: 'Bình thường',
  HIGH: 'Quan trọng',
  URGENT: 'Khẩn cấp',
}

export const priorityStyles: Record<TaskPriority, string> = {
  LOW: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  NORMAL: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  HIGH: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  URGENT: 'bg-destructive/10 text-destructive border-destructive/20',
}

export const priorityIcons: Record<
  TaskPriority,
  React.FC<React.SVGProps<SVGSVGElement>>
> = {
  LOW: createIconComponent(ChevronDown, 'text-chart-2 bg-transparent'),
  NORMAL: createIconComponent(Equal, 'text-chart-1 bg-transparent'),
  HIGH: createIconComponent(ChevronUp, 'text-chart-5 bg-transparent'),
  URGENT: createIconComponent(ChevronsUp, 'text-destructive bg-transparent'),
}

export const taskPriorityOptions: Option[] = Object.entries(priorityLabels).map(
  ([value, label]) => ({
    value,
    label,
    icon: priorityIcons[value as TaskPriority],
  })
)

// File type detection constants
const FILE_EXTENSIONS = {
  IMAGE: new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']),
  VIDEO: new Set(['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']),
  AUDIO: new Set(['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma']),
  TEXT: new Set(['txt', 'doc', 'docx', 'pdf', 'rtf', 'odt']),
} as const

// File utility functions
function getFileExtension(fileName: string): string {
  if (!fileName) return ''
  const idx = fileName.lastIndexOf('.')
  if (idx === -1) return ''
  return fileName.slice(idx + 1).toLowerCase()
}

function isImageFile(fileName: string): boolean {
  return FILE_EXTENSIONS.IMAGE.has(getFileExtension(fileName))
}

export function getFileIcon(fileName: string): React.ElementType {
  const extension = getFileExtension(fileName)

  if (!extension) return FileIcon

  if (FILE_EXTENSIONS.IMAGE.has(extension)) return FileImage
  if (FILE_EXTENSIONS.VIDEO.has(extension)) return FileVideo
  if (FILE_EXTENSIONS.AUDIO.has(extension)) return FileAudio
  if (FILE_EXTENSIONS.TEXT.has(extension)) return FileText

  return FileIcon
}

export function getImagePreviewUrl(attachment: AttachmentItem): string | null {
  const fileName = attachment?.fileName || ''
  if (!fileName || !isImageFile(fileName)) return null

  return attachment.filePath ?? null
}

export const getAbbreviation = (name: string) => {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
