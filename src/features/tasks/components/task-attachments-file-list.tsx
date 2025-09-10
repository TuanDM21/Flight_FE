import { Download, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { useDialogs } from '@/hooks/use-dialogs'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { AttachmentItem } from '@/features/attachments/types'
import { TaskAttachment, TaskFilterTypes } from '../types'
import { getFileIcon, getImagePreviewUrl } from '../utils'
import { DeleteAttachmentConfirmDialog } from './delete-attachment-confirm-dialog'

interface TaskAttachmentsFileListProps {
  attachments: AttachmentItem[]
  taskId: number
  filterType: TaskFilterTypes
  isDisabled: boolean
}

interface AttachmentActionsProps {
  attachment: AttachmentItem
  onView?: (attachment: AttachmentItem) => void
  onDownload?: (attachment: AttachmentItem) => void
  onDelete?: (attachment: AttachmentItem) => void
  isDisabled: boolean
}

function AttachmentActions({
  attachment,
  onView,
  onDownload,
  onDelete,
  isDisabled,
}: AttachmentActionsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          className='text-muted-foreground/80 hover:text-foreground rounded-full'
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
  )
}

export function TaskAttachmentsFileList({
  attachments,
  taskId,
  filterType,
  isDisabled,
}: TaskAttachmentsFileListProps) {
  const dialogs = useDialogs()

  const handleOpenDeleteConfirmAttachment = (attachment: TaskAttachment) => {
    dialogs.open(DeleteAttachmentConfirmDialog, {
      attachment,
      filterType,
      taskId,
    })
  }

  if (attachments.length === 0) {
    return null
  }

  return (
    <div className='space-y-2'>
      {attachments.map((attachment, index) => {
        const FileIcon = getFileIcon(attachment.fileName || '')
        const imageUrl = getImagePreviewUrl(attachment)

        return (
          <div
            key={index}
            className='bg-background flex items-center justify-between gap-2 space-y-1 rounded-lg border-b pe-2 last:border-b-0'
          >
            <div className='flex items-center gap-3 overflow-hidden'>
              <div className='bg-accent aspect-square shrink-0 rounded'>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={attachment.fileName || 'Ảnh'}
                    className='size-10 rounded-[inherit] object-cover'
                  />
                ) : (
                  <div className='flex size-10 items-center justify-center rounded bg-gray-100'>
                    <FileIcon className='size-5' />
                  </div>
                )}
              </div>
              <div className='flex min-w-0 flex-col gap-0.5'>
                <p className='truncate text-[13px] font-medium'>
                  {attachment.fileName || 'Tài liệu'}
                </p>
              </div>
            </div>

            <AttachmentActions
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
  )
}
