import { useHover } from '@uidotdev/usehooks'
import { Download, Eye, FileUpIcon, MoreHorizontal, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDialogs } from '@/hooks/use-dialogs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AttachmentItem } from '@/features/attachments/types'
import { TaskAttachment, TaskFilterTypes } from '../types'
import { getFileIcon, getImagePreviewUrl } from '../utils/tasks'
import { DeleteAttachmentConfirmDialog } from './delete-attachment-confirm-dialog'
import { TaskAttachmentsUploader } from './task-attachments-uploader'

interface TaskAttachmentsDisplayProps {
  attachments: AttachmentItem[]
  maxVisible?: number
  taskId: number
  filterType: TaskFilterTypes
  level?: number
}

interface AttachmentActionsProps {
  attachment: AttachmentItem
  onView?: (attachment: AttachmentItem) => void
  onDownload?: (attachment: AttachmentItem) => void
  onDelete?: (attachment: AttachmentItem) => void
  isDisabled?: boolean
}

function AttachmentActions({
  attachment,
  onView,
  onDownload,
  onDelete,
  isDisabled = false,
}: AttachmentActionsProps) {
  return (
    <div className='absolute top-2 right-2 z-10'>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='secondary'
            size='sm'
            className='h-8 w-8 rounded-full p-0'
          >
            <MoreHorizontal className='size-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-48 p-2' align='end'>
          <div className='space-y-1'>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start gap-2'
              onClick={() => onView?.(attachment)}
            >
              <Eye className='size-4' />
              Xem
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start gap-2'
              onClick={() => onDownload?.(attachment)}
            >
              <Download className='size-4' />
              Tải xuống
            </Button>
            {!isDisabled && (
              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700'
                onClick={() => onDelete?.(attachment)}
              >
                <Trash2 className='size-4' />
                Xóa
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function AttachmentListItemActions({
  attachment,
  onView,
  onDownload,
  onDelete,
  isDisabled = false,
}: AttachmentActionsProps) {
  return (
    <div
      className='flex-shrink-0 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100'
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
            <MoreHorizontal className='size-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-48 p-2' align='end'>
          <div className='space-y-1'>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start gap-2'
              onClick={() => onView?.(attachment)}
            >
              <Eye className='size-4' />
              Xem
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start gap-2'
              onClick={() => onDownload?.(attachment)}
            >
              <Download className='size-4' />
              Tải xuống
            </Button>
            {!isDisabled && (
              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700'
                onClick={() => onDelete?.(attachment)}
              >
                <Trash2 className='size-4' />
                Xóa
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function TaskAttachmentsDisplay({
  attachments,
  maxVisible = 3,
  taskId,
  filterType,
  level = 0,
}: TaskAttachmentsDisplayProps) {
  const [hoverCardTriggerRef, isHovering] = useHover()
  const count = attachments.length
  const visibleCount = Math.min(count, maxVisible)
  const extra = count - visibleCount
  const dialogs = useDialogs()
  const isDisabled = level > 0 || filterType === 'received'

  const handleOpenDeleteConfirmAttachment = (attachment: TaskAttachment) => {
    dialogs.open(DeleteAttachmentConfirmDialog, {
      attachment,
      filterType,
      taskId,
    })
  }

  return (
    <div className='group flex items-center gap-2' ref={hoverCardTriggerRef}>
      {!isDisabled && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'transition-all duration-200 ease-out',
                isHovering || count === 0
                  ? 'pointer-events-auto translate-x-0 scale-100 opacity-100'
                  : 'pointer-events-none -translate-x-1 scale-90 opacity-0'
              )}
            >
              <TaskAttachmentsUploader taskId={taskId} filterType={filterType}>
                <Button
                  size='icon'
                  variant='outline'
                  className='hover:border-primary hover:bg-primary/5 size-8 rounded-full border-2 border-dashed transition-all duration-200 hover:border-solid'
                >
                  <FileUpIcon className='size-4' />
                  <span className='sr-only'>Thêm tệp đính kèm</span>
                </Button>
              </TaskAttachmentsUploader>
            </div>
          </TooltipTrigger>
          <TooltipContent className='px-2 py-1 text-xs'>
            Thêm tệp đính kèm
          </TooltipContent>
        </Tooltip>
      )}

      {count > 0 && (
        <div className='flex items-center -space-x-2'>
          {attachments.slice(0, visibleCount).map((attachment, index) => {
            const FileIcon = getFileIcon(attachment.fileName || '')
            const imageUrl = getImagePreviewUrl(attachment)

            return (
              <HoverCard key={index} openDelay={200}>
                <HoverCardTrigger asChild>
                  <Avatar
                    className={cn(
                      'cursor-pointer border-2 border-dashed transition-all duration-200 ease-out hover:border-solid',
                      extra > 0
                        ? 'hover:z-10 hover:-translate-y-1 hover:scale-105'
                        : ''
                    )}
                    onClick={() => {
                      if (attachment.filePath) {
                        window.open(attachment.filePath, '_blank')
                      }
                    }}
                  >
                    {imageUrl ? (
                      <AvatarImage
                        src={imageUrl}
                        alt={attachment.fileName || 'Ảnh'}
                        className='object-cover'
                      />
                    ) : (
                      <AvatarFallback className='bg-indigo-500/10'>
                        <FileIcon className='size-4' />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </HoverCardTrigger>
                <HoverCardContent
                  className='border-0 p-0'
                  side='top'
                  sideOffset={5}
                >
                  <div className='relative w-64 overflow-hidden rounded-lg'>
                    <AttachmentActions
                      attachment={attachment}
                      isDisabled={isDisabled}
                      onView={(att) => {
                        window.open(att.filePath, '_blank')
                      }}
                      onDownload={(_att) => {}}
                      onDelete={handleOpenDeleteConfirmAttachment}
                    />

                    {imageUrl ? (
                      <div className='space-y-2'>
                        <img
                          src={imageUrl}
                          alt={attachment.fileName || 'Ảnh'}
                          className='h-48 w-full rounded-t-lg object-cover'
                        />
                        <div className='px-2 pb-2'>
                          <p className='truncate text-center text-xs font-medium'>
                            {attachment.fileName}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        <div className='flex h-48 w-full items-center justify-center rounded-t-lg bg-gray-50'>
                          <div className='text-center'>
                            <FileIcon className='mx-auto size-16 text-gray-400' />
                            <p className='text-muted-foreground mt-2 text-xs'>
                              Tệp không hỗ trợ xem trước
                            </p>
                          </div>
                        </div>
                        <div className='px-2 pb-2'>
                          <p className='truncate text-center text-xs font-medium'>
                            {attachment.fileName || 'Tài liệu'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            )
          })}

          {extra > 0 && (
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <Avatar className='ring-background hover:ring-primary/20 cursor-pointer ring-2 transition-all duration-200 ease-out hover:z-10 hover:-translate-y-1 hover:scale-105 hover:shadow-lg'>
                  <AvatarFallback className='bg-muted text-xs font-medium'>
                    +{extra}
                  </AvatarFallback>
                </Avatar>
              </HoverCardTrigger>

              <HoverCardContent className='w-80 p-2 pr-0'>
                <div className='max-h-72 w-full overflow-y-auto'>
                  <div className='space-y-2'>
                    {attachments
                      .slice(visibleCount)
                      .map((attachment, index) => {
                        const FileIcon = getFileIcon(attachment.fileName || '')
                        const imageUrl = getImagePreviewUrl(attachment)

                        return (
                          <div
                            key={index}
                            className='group hover:bg-muted/50 relative flex cursor-pointer items-center gap-3 rounded-md p-2 transition-all duration-150'
                            onClick={() => {
                              window.open(attachment.filePath, '_blank')
                            }}
                          >
                            <div className='flex-shrink-0'>
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={attachment.fileName}
                                  className='size-10 rounded object-cover'
                                />
                              ) : (
                                <div className='flex size-10 items-center justify-center rounded bg-gray-100'>
                                  <FileIcon className='size-5' />
                                </div>
                              )}
                            </div>
                            <div className='min-w-0 flex-1'>
                              <p className='truncate text-sm font-medium'>
                                {attachment.fileName}
                              </p>
                            </div>

                            <AttachmentListItemActions
                              attachment={attachment}
                              isDisabled={isDisabled}
                              onView={(att) => {
                                window.open(att.filePath, '_blank')
                              }}
                              onDownload={(att) => {
                                const link = document.createElement('a')
                                link.href = att.filePath || ''
                                link.download = att.fileName || 'file'
                                link.click()
                              }}
                              onDelete={handleOpenDeleteConfirmAttachment}
                            />
                          </div>
                        )
                      })}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
      )}
    </div>
  )
}
