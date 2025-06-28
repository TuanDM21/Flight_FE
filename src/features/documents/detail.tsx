import React from 'react'
import { format } from 'date-fns'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { dateFormatPatterns } from '@/config/date'
import { DocumentDetailRoute } from '@/routes/_authenticated/documents/$document-id'
import { BaseApiResponse } from '@/types/response'
import {
  Calendar,
  Download,
  Edit,
  Eye,
  FileText,
  Paperclip,
  Trash,
  Trash2,
} from 'lucide-react'
import { documentKeysFactory } from '@/api/query-key-factory'
import { formatFileSize } from '@/lib/format'
import { downloadFileFromUrl } from '@/utils/file'
import { useFileIconType } from '@/hooks/use-file-icon-type'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DataTableActionBarAction } from '@/components/data-table/data-table-action-bar'
import { getDownloadUrlQueryOptions } from '../attachments/hooks/use-download-attachment-url'
import { useDeleteDocumentsConfirm } from './hooks/use-delete-documents-confirm'
import { getDocumentDetailQueryOptions } from './hooks/use-document-detail'
import { useUnlinkAttachmentsFromDocumentConfirm } from './hooks/use-unlink-attachments-from-document-confirm'
import { DocumentAttachment } from './types'

export default function DocumentDetailPage() {
  const documentId = DocumentDetailRoute.useParams()['document-id']
  const { onDeleteDocuments } = useDeleteDocumentsConfirm()
  const { onUnlinkAttachmentFromDocument } =
    useUnlinkAttachmentsFromDocumentConfirm()

  const { data: documentDetail } = useSuspenseQuery(
    getDocumentDetailQueryOptions(Number(documentId))
  )
  const document = documentDetail?.data

  const { getFileType, getFileIcon } = useFileIconType()
  const queryClient = useQueryClient()

  const handleDownloadAttachment = React.useCallback(
    async (attachment: DocumentAttachment) => {
      const downloadUrlQuery = queryClient.getQueryData<
        BaseApiResponse<string>
      >(documentKeysFactory.documentAttachmentsDownloadUrl(attachment.id!))
      if (!downloadUrlQuery) return

      await downloadFileFromUrl({
        url: downloadUrlQuery.data,
        filename: attachment.fileName || 'download',
      })
    },
    []
  )

  const handleAttachmentMouseEnter = React.useCallback(
    (attachment: DocumentAttachment) => {
      if (attachment?.id) {
        queryClient.prefetchQuery(getDownloadUrlQueryOptions(attachment.id))
      }
    },
    [queryClient]
  )

  const getAttachmentsInfo = () => {
    if (!document?.attachments || document.attachments.length === 0) {
      return { count: 0, totalSize: 0, types: [] }
    }

    const totalSize = document.attachments.reduce(
      (sum, att) => sum + (att.fileSize ?? 0),
      0
    )
    const types = [
      ...new Set(
        document.attachments.map((att) => getFileType(att.fileName || ''))
      ),
    ]

    return {
      count: document.attachments.length,
      totalSize,
      types,
    }
  }

  const attachmentsInfo = getAttachmentsInfo()

  if (!document) {
    return (
      <div className='px-4 py-2'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground text-center'>
              Không tìm thấy tài liệu
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className='px-4 py-2'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div>
              <h1 className='text-2xl font-bold'>Tài liệu #{document.id}</h1>
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <Button variant='outline' asChild className='space-x-1'>
              <Link
                to='/documents/$document-id/edit'
                params={{
                  'document-id': (document.id ?? '').toString(),
                }}
              >
                <Edit className='mr-2 h-4 w-4' />
                Chỉnh sửa
              </Link>
            </Button>
            <Button
              variant='destructive'
              className='space-x-1'
              onClick={() => onDeleteDocuments([document])}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Xóa
            </Button>
          </div>
        </div>

        <div className='grid gap-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center space-x-2'>
                  <FileText className='h-5 w-5' />
                  <span>Thông tin tài liệu</span>
                </CardTitle>
                <Badge variant='secondary'>{document.documentType}</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <h3 className='text-muted-foreground mb-2 text-sm font-medium'>
                  Loại tài liệu
                </h3>
                <p className='text-sm'>
                  {document.documentType || 'Không xác định'}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className='text-muted-foreground mb-2 text-sm font-medium'>
                  Nội dung
                </h3>
                <div className='bg-muted/50 rounded-md p-4'>
                  <p className='text-sm whitespace-pre-wrap'>
                    {document.content || 'Không có nội dung'}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className='text-muted-foreground mb-2 text-sm font-medium'>
                  Ghi chú
                </h3>
                <div className='bg-muted/50 rounded-md p-4'>
                  <p className='text-sm whitespace-pre-wrap'>
                    {document.notes || 'Không có ghi chú'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {document.attachments && document.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Paperclip className='h-5 w-5' />
                  <span>Tệp đính kèm ({document.attachments.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {document.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className='hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='bg-primary/10 rounded-md p-2'>
                          {getFileIcon(attachment.fileName || '')}
                        </div>
                        <div>
                          <p className='text-sm font-medium'>
                            {attachment.fileName}
                          </p>
                          <div className='text-muted-foreground flex items-center space-x-2 text-xs'>
                            <span>
                              {formatFileSize(attachment.fileSize ?? 0)}
                            </span>
                            <span>•</span>
                            <span>
                              Thêm vào{' '}
                              {format(
                                new Date(attachment.createdAt ?? ''),
                                dateFormatPatterns.fullDateTime
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className='flex flex-shrink-0 items-center gap-4'
                        onMouseEnter={() => {
                          handleAttachmentMouseEnter(attachment)
                        }}
                      >
                        <DataTableActionBarAction
                          size='icon'
                          tooltip='Xóa tệp'
                          onClick={() =>
                            onUnlinkAttachmentFromDocument(
                              document.id!,
                              attachment
                            )
                          }
                          tabIndex={-1}
                        >
                          <Trash />
                        </DataTableActionBarAction>
                        <a
                          href={attachment.filePath}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <DataTableActionBarAction
                            size='icon'
                            tooltip='Xem tệp'
                          >
                            <Eye />
                          </DataTableActionBarAction>
                        </a>

                        <DataTableActionBarAction
                          size='icon'
                          tooltip='Tải xuống tệp'
                          onClick={() => handleDownloadAttachment(attachment)}
                        >
                          <Download />
                        </DataTableActionBarAction>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Calendar className='h-5 w-5' />
                <span>Thông tin meta</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <h3 className='text-muted-foreground mb-1 text-sm font-medium'>
                    Tạo lúc
                  </h3>
                  <p className='text-sm'>
                    {format(
                      new Date(document.createdAt ?? ''),
                      dateFormatPatterns.fullDateTime
                    )}
                  </p>
                </div>
                <div>
                  <h3 className='text-muted-foreground mb-1 text-sm font-medium'>
                    Cập nhật lần cuối
                  </h3>
                  <p className='text-sm'>
                    {format(
                      new Date(document.updatedAt ?? ''),
                      dateFormatPatterns.fullDateTime
                    )}
                  </p>
                </div>
                <div>
                  <h3 className='text-muted-foreground mb-1 text-sm font-medium'>
                    Mã tài liệu
                  </h3>
                  <p className='font-mono text-sm'>#{document.id}</p>
                </div>
                <div>
                  <h3 className='text-muted-foreground mb-1 text-sm font-medium'>
                    Tệp đính kèm
                  </h3>
                  {attachmentsInfo.count > 0 ? (
                    <div className='space-y-1'>
                      <p className='text-sm'>
                        {attachmentsInfo.count} tệp •{' '}
                        {formatFileSize(attachmentsInfo.totalSize)}
                      </p>
                      {attachmentsInfo.types.length > 0 && (
                        <div className='flex flex-wrap gap-1'>
                          {attachmentsInfo.types.map((type) => (
                            <Badge
                              key={type}
                              variant='outline'
                              className='text-xs'
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className='text-sm'>Không có tệp đính kèm</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
