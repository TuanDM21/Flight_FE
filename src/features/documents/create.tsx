import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { convertToFile } from '@/utils/file'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AppDialog } from '@/components/app-dialog'
import { useUploadAttachments } from '../attachments/hooks/use-upload-attachments'
import { DocumentAttachmentField } from './components/document-attachment-field'
import { SelectAttachmentsDialog } from './components/select-attachments-dialog'
import { useCreateDocument } from './hooks/use-create-document'
import { createDocumentSchema } from './schema'
import { CreateDocumentForm, DocumentAttachment } from './types'

export default function CreateDocumentPage() {
  const navigate = useNavigate()
  const createDocumentMutation = useCreateDocument()
  const uploadAttachments = useUploadAttachments()
  const selectAttachmentsDialog = AppDialog.useDialog()

  const form = useForm<CreateDocumentForm>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      content: '',
      documentType: '',
      notes: '',
      files: [] as File[],
      attachments: [],
    },
  })

  const handleSelectAttachments = React.useCallback(
    async (attachments: DocumentAttachment[]) => {
      const selectAttachmentsPromise = (async () => {
        selectAttachmentsDialog.close()
        const selectedFiles =
          (attachments.length ?? 0) > 0
            ? await Promise.all(
                attachments.map(async (att) => {
                  try {
                    const file = await convertToFile(att)
                    Object.assign(file, {
                      __uploaded: true,
                    })
                    return file
                  } catch {
                    toast.error(
                      `Tệp đính kèm "${att.fileName}" không phải là tệp hợp lệ. Vui lòng chọn tệp đính kèm khác.`
                    )
                    return null
                  }
                }) ?? []
              )
            : []
        const allSelectedFiles = [
          ...(form.getValues('files') ?? []),
          ...selectedFiles.filter((file): file is File => file !== null),
        ]
        const allSelectedAttachments = [
          ...(form.getValues('attachments') ?? []),
          ...attachments,
        ] as Required<DocumentAttachment>[]

        form.setValue('files', allSelectedFiles)
        form.setValue('attachments', allSelectedAttachments)
        return attachments.length
      })()

      toast.promise(selectAttachmentsPromise, {
        loading: 'Đang thêm tệp đính kèm...',
        success: (count) => `Đã thêm ${count} tệp đính kèm thành công!`,
        error: 'Không thể thêm tệp đính kèm',
      })
    },
    [form, selectAttachmentsDialog]
  )

  const handleSubmit = async (data: CreateDocumentForm) => {
    const createDocumentPromise = createDocumentMutation.mutateAsync({
      body: {
        documentType: data.documentType,
        content: data.content,
        notes: data.notes,
        attachmentIds:
          data.attachments?.map((attachment) => attachment.id) ?? [],
      },
    })
    toast.promise(createDocumentPromise, {
      loading: 'Đang tạo tài liệu...',
      success: () => {
        navigate({ to: '/documents' })
        return 'Tạo tài liệu thành công!'
      },
      error: 'Không thể tạo tài liệu. Vui lòng thử lại.',
    })
  }

  const onUpload = React.useCallback(
    async (
      files: File[],
      {
        onProgress,
        onSuccess,
        onError,
      }: {
        onProgress: (file: File, progress: number) => void
        onSuccess: (file: File) => void
        onError: (file: File, error: Error) => void
      }
    ) => {
      const result = await uploadAttachments(files, {
        onProgress,
        onSuccess,
        onError,
      })

      if (result.success) {
        form.setValue('attachments', result.confirmedAttachments)
      }
    },
    [uploadAttachments]
  )

  const onFileReject = React.useCallback((file: File, message: string) => {
    form.setError('files', {
      message,
    })
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" đã bị từ chối`,
    })
  }, [])

  const handleOpenPreview = React.useCallback((file: File) => {
    const attachments = form.getValues('attachments') ?? []
    const attachment = attachments.find((a) => a.fileName === file.name)
    if (attachment) {
      window.open(attachment.filePath, '_blank', 'noopener,noreferrer')
    }
  }, [])

  return (
    <>
      {selectAttachmentsDialog.isOpen && (
        <SelectAttachmentsDialog
          dialog={selectAttachmentsDialog}
          getSelectedAttachmentIds={() =>
            form.getValues('attachments')?.map((a) => a.id) ?? []
          }
          onSubmit={handleSelectAttachments}
        />
      )}
      <div className='px-4 py-2'>
        <Card className='py-4'>
          <CardHeader>
            <CardTitle>Tạo tài liệu</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                id='document-form'
                onSubmit={form.handleSubmit(handleSubmit)}
                className='space-y-6'
              >
                <FormField
                  control={form.control}
                  name='documentType'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel>Loại tài liệu</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Nhập loại tài liệu' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='content'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel>Nội dung</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className='min-h-32'
                          placeholder='Nhập nội dung của bạn tại đây'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='notes'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className='min-h-32'
                          placeholder='Nhập ghi chú của bạn tại đây'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='files'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tệp đính kèm</FormLabel>
                      <FormControl>
                        <DocumentAttachmentField
                          value={field.value}
                          onChange={field.onChange}
                          onSelectAttachments={selectAttachmentsDialog.open}
                          onFileReject={onFileReject}
                          onUpload={onUpload}
                          onOpenPreview={handleOpenPreview}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
          <div className='bg-background sticky bottom-0 z-10 flex items-center justify-end space-x-2 border-t px-2 pt-4'>
            <Button
              variant='outline'
              size='lg'
              onClick={() => void navigate({ to: '/documents' })}
            >
              Hủy
            </Button>
            <Button form='document-form' type='submit' size='lg'>
              Tạo tài liệu
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}
