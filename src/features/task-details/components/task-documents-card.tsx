import React from 'react'
import { format } from 'date-fns'
import { dateFormatPatterns } from '@/config/date'
import { FileText, Paperclip, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useShowDocumentAttachments } from '@/features/documents/hooks/use-show-document-attachments'
import { TaskDocument, TaskDocumentAttachment } from '@/features/tasks/types'

interface TaskDocumentsCardProps {
  documents: TaskDocument[]
  onDownloadAttachment: (attachment: TaskDocumentAttachment) => void
  getFileIcon: (fileName: string) => React.ReactNode
}

interface TaskDocumentItemProps {
  document: TaskDocument
  index: number
  onDownloadAttachment: (attachment: TaskDocumentAttachment) => void
  getFileIcon: (fileName: string) => React.ReactNode
}

function TaskDocumentItem({ document, index }: TaskDocumentItemProps) {
  const { showAttachments } = useShowDocumentAttachments()

  const handleViewAttachments = () => {
    if (document.id) {
      showAttachments(document.id)
    }
  }

  return (
    <div
      key={document.id || index}
      className='rounded-lg border p-3 transition-colors sm:p-4'
    >
      <div className='space-y-3'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
              <div className='flex items-center space-x-2'>
                <FileText className='h-4 w-4 shrink-0' />
                <span className='truncate text-sm font-medium'>
                  Tài liệu #{document.id}
                </span>
              </div>
              {document.documentType && (
                <Badge variant='outline' className='w-fit shrink-0 text-xs'>
                  {document.documentType}
                </Badge>
              )}
            </div>
            <p className='text-muted-foreground mt-1 text-xs'>
              <span className='hidden sm:inline'>Tạo ngày </span>
              <span className='sm:hidden'>Tạo: </span>
              {format(
                new Date(document.createdAt || ''),
                dateFormatPatterns.fullDateTime
              )}
            </p>
          </div>
        </div>

        {document.content && (
          <div className='space-y-2'>
            <h5 className='text-muted-foreground text-xs font-medium'>
              Nội dung
            </h5>
            <div className='bg-muted/50 rounded-md p-2.5 sm:p-3'>
              <p className='text-sm break-words whitespace-pre-wrap'>
                {document.content}
              </p>
            </div>
          </div>
        )}

        {document.notes && (
          <div className='space-y-2'>
            <h5 className='text-muted-foreground text-xs font-medium'>
              Ghi chú
            </h5>
            <div className='bg-muted/50 rounded-md p-2.5 sm:p-3'>
              <p className='text-xs break-words italic'>{document.notes}</p>
            </div>
          </div>
        )}

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <h4 className='text-muted-foreground text-xs font-medium'>
              Tệp đính kèm ({document.attachments?.length || 0})
            </h4>
            {document.attachments &&
              document.attachments.length > 0 &&
              document.id && (
                <Button
                  variant='outline'
                  size='sm'
                  className='h-7 gap-1.5 text-xs'
                  onClick={handleViewAttachments}
                >
                  <Eye className='h-3 w-3' />
                  Xem tất cả
                </Button>
              )}
          </div>
          <div className='bg-muted/30 rounded-md p-2'>
            {document.attachments && document.attachments.length > 0 ? (
              <p className='text-muted-foreground text-xs'>
                {document.attachments.length} tệp
                {document.attachments.length === 1 ? '' : ''} đã đính kèm.{' '}
                <span className='font-medium'>
                  Nhấn "Xem tất cả" để xem chi tiết.
                </span>
              </p>
            ) : (
              <p className='text-muted-foreground text-xs'>
                Không có tệp đính kèm nào cho tài liệu này.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TaskDocumentsCard({
  documents,
  onDownloadAttachment,
  getFileIcon,
}: TaskDocumentsCardProps) {
  if (!documents || documents.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center space-x-2 text-lg'>
          <Paperclip className='h-5 w-5 shrink-0' />
          <span className='truncate'>Tài liệu ({documents.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='px-3 sm:px-6'>
        <ScrollArea className='h-96'>
          <div className='grid grid-cols-1 gap-3 pr-4 sm:gap-4 lg:grid-cols-2'>
            {documents.map((document, index) => (
              <TaskDocumentItem
                key={document.id || index}
                document={document}
                index={index}
                onDownloadAttachment={onDownloadAttachment}
                getFileIcon={getFileIcon}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
