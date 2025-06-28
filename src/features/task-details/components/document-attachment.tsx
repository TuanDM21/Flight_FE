import React from 'react'
import { Eye, Download } from 'lucide-react'
import { formatFileSize } from '@/lib/format'
import { DataTableActionBarAction } from '@/components/data-table/data-table-action-bar'
import { TaskDocumentAttachment } from '@/features/tasks/types'

interface DocumentAttachmentProps {
  attachment: TaskDocumentAttachment
  attachIndex: number
  onDownload: (attachment: TaskDocumentAttachment) => void
  getFileIcon: (fileName: string) => React.ReactNode
}

export function DocumentAttachment({
  attachment,
  attachIndex,
  onDownload,
  getFileIcon,
}: DocumentAttachmentProps) {
  return (
    <div
      key={attachment.id || attachIndex}
      className='hover:bg-muted/30 flex items-center justify-between rounded-md border p-2 transition-colors'
    >
      <div className='flex items-center space-x-2'>
        <div className='bg-primary/10 rounded-md p-1'>
          {getFileIcon(attachment.fileName || '')}
        </div>
        <div>
          <p className='text-xs font-medium'>{attachment.fileName}</p>
          <div className='text-muted-foreground flex items-center space-x-2 text-xs'>
            <span>{formatFileSize(attachment.fileSize || 0)}</span>
            {attachment.uploadedBy && (
              <>
                <span>•</span>
                <span>bởi {attachment.uploadedBy.name}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        {attachment.filePath && (
          <a
            href={attachment.filePath}
            target='_blank'
            rel='noopener noreferrer'
          >
            <DataTableActionBarAction
              size='icon'
              tooltip='Xem tệp'
              className='h-6 w-6'
            >
              <Eye className='h-3 w-3' />
            </DataTableActionBarAction>
          </a>
        )}
        <DataTableActionBarAction
          size='icon'
          tooltip='Tải xuống tệp'
          onClick={() => {
            onDownload(attachment)
          }}
          className='h-6 w-6'
        >
          <Download className='h-3 w-3' />
        </DataTableActionBarAction>
      </div>
    </div>
  )
}
