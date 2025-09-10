import React from 'react'
import { format } from 'date-fns'
import { dateFormatPatterns } from '@/config/date'
import { Paperclip, Download, Eye } from 'lucide-react'
import { formatFileSize } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TaskAttachment } from '@/features/tasks/types'

interface TaskAttachmentsCardProps {
  attachments: TaskAttachment[]
  onDownloadAttachment: (attachment: TaskAttachment) => void
  onViewAttachment: (attachment: TaskAttachment) => void
  getFileIcon: (fileName: string) => React.ReactNode
}

interface TaskAttachmentItemProps {
  attachment: TaskAttachment
  index: number
  onDownloadAttachment: (attachment: TaskAttachment) => void
  onViewAttachment: (attachment: TaskAttachment) => void
  getFileIcon: (fileName: string) => React.ReactNode
}

function TaskAttachmentItem({
  attachment,
  index,
  onDownloadAttachment,
  onViewAttachment,
  getFileIcon,
}: TaskAttachmentItemProps) {
  const handleDownload = () => {
    onDownloadAttachment(attachment)
  }

  const handleView = () => {
    onViewAttachment(attachment)
  }

  return (
    <div
      key={attachment.id || index}
      className='hover:bg-muted/50 cursor-pointer rounded-lg border p-3 transition-colors sm:p-4'
      onClick={handleView}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center space-x-3'>
            <div className='bg-primary/10 rounded-md p-2'>
              {getFileIcon(attachment.fileName || '')}
            </div>
            <div className='min-w-0 flex-1'>
              <h3 className='truncate text-sm font-medium'>
                {attachment.fileName || 'Tệp đính kèm'}
              </h3>
              <div className='text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs'>
                {attachment.createdAt && (
                  <span>
                    {format(
                      new Date(attachment.createdAt),
                      dateFormatPatterns.fullDateTime
                    )}
                  </span>
                )}
                {attachment.fileSize && (
                  <>
                    {attachment.createdAt && <span>•</span>}
                    <span>{formatFileSize(attachment.fileSize)}</span>
                  </>
                )}
                {attachment.uploadedBy && (
                  <>
                    {(attachment.createdAt || attachment.fileSize) && (
                      <span>•</span>
                    )}
                    <span>Tải lên bởi {attachment.uploadedBy.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 shrink-0 gap-1.5 text-xs'
            onClick={(e) => {
              e.stopPropagation()
              handleView()
            }}
          >
            <Eye className='h-3 w-3' />
            Xem
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='h-8 shrink-0 gap-1.5 text-xs'
            onClick={(e) => {
              e.stopPropagation()
              handleDownload()
            }}
          >
            <Download className='h-3 w-3' />
            Tải xuống
          </Button>
        </div>
      </div>
    </div>
  )
}

export function TaskAttachmentsCard({
  attachments,
  onDownloadAttachment,
  onViewAttachment,
  getFileIcon,
}: TaskAttachmentsCardProps) {
  if (!attachments || attachments.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center space-x-2 text-lg'>
          <Paperclip className='h-5 w-5 shrink-0' />
          <span className='truncate'>Tệp đính kèm ({attachments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='px-3 sm:px-6'>
        <ScrollArea className='max-h-96'>
          <div
            className={`grid gap-3 pr-4 sm:gap-4 ${
              attachments.length === 1
                ? 'grid-cols-1'
                : 'grid-cols-1 lg:grid-cols-2'
            }`}
          >
            {attachments.map((attachment, index) => (
              <TaskAttachmentItem
                key={attachment.id || index}
                attachment={attachment}
                index={index}
                onDownloadAttachment={onDownloadAttachment}
                onViewAttachment={onViewAttachment}
                getFileIcon={getFileIcon}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
