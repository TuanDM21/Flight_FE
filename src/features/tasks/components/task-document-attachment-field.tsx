import React from 'react'
import { z } from 'zod'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { FilePlus, PlusCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { convertToFile } from '@/utils/file'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AppDialog } from '@/components/app-dialog'
import { useUploadAttachments } from '../../attachments/hooks/use-upload-attachments'
import { DocumentAttachmentField } from '../../documents/components/document-attachment-field'
import { SelectAttachmentsDialog } from '../../documents/components/select-attachments-dialog'
import { createTaskSchema } from '../schema'
import { TaskDocumentAttachment } from '../types'

type CreateTaskForm = z.infer<typeof createTaskSchema>

interface DocumentCardProps {
  index: number
  onRemove: (index: number) => void
}

function NewDocumentFormCard({ index, onRemove }: DocumentCardProps) {
  const form = useFormContext<CreateTaskForm>()
  const uploadAttachments = useUploadAttachments()
  const selectAttachmentsDialog = AppDialog.useDialog()

  const handleSelectAttachments = React.useCallback(
    async (attachments: TaskDocumentAttachment[]) => {
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

      const currentFiles = form.getValues(`documents.${index}.files`) || []
      const currentAttachments =
        form.getValues(`documents.${index}.attachments`) || []

      const allSelectedFiles = [
        ...currentFiles,
        ...selectedFiles.filter((file): file is File => file !== null),
      ]
      const allSelectedAttachments = [...currentAttachments, ...attachments]

      form.setValue(`documents.${index}.files`, allSelectedFiles)
      form.setValue(`documents.${index}.attachments`, allSelectedAttachments)
    },
    [form, selectAttachmentsDialog, index]
  )

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
        const currentAttachments =
          form.getValues(`documents.${index}.attachments`) || []
        const newAttachments = [
          ...currentAttachments,
          ...result.confirmedAttachments,
        ]
        form.setValue(`documents.${index}.attachments`, newAttachments)
      }
    },
    [uploadAttachments, form, index]
  )

  const onFileReject = React.useCallback(
    (file: File, message: string) => {
      form.setError(`documents.${index}.files`, {
        message,
      })
      toast(message, {
        description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" đã bị từ chối`,
      })
    },
    [form, index]
  )

  const handleOpenPreview = React.useCallback(
    (file: File) => {
      const attachments = form.getValues(`documents.${index}.attachments`) ?? []
      const attachment = attachments.find((a: any) => a.fileName === file.name)
      if (attachment) {
        window.open(attachment.filePath, '_blank', 'noopener,noreferrer')
      }
    },
    [form, index]
  )

  return (
    <>
      {selectAttachmentsDialog.isOpen && (
        <SelectAttachmentsDialog
          dialog={selectAttachmentsDialog}
          getSelectedAttachmentIds={() =>
            form
              .getValues(`documents.${index}.attachments`)
              ?.map((a: any) => a.id) ?? []
          }
          onSubmit={handleSelectAttachments}
        />
      )}

      <Card className='border-l-4 p-6 shadow-sm'>
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold'>
              {index + 1}
            </div>
            <div>
              <h4 className='text-lg font-semibold text-gray-800'>
                Tài liệu {index + 1}
              </h4>
              <p className='text-sm text-gray-500'>
                Điền thông tin và chọn tệp đính kèm cho tài liệu này
              </p>
            </div>
          </div>

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => {
              onRemove(index)
            }}
            className='flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
          >
            <X className='size-4' />
            Xóa tài liệu
          </Button>
        </div>

        <div className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name={`documents.${index}.documentType`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700'>
                    Loại tài liệu *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='VD: Báo cáo, Hợp đồng, Đề xuất...'
                      className='border-gray-300 focus:border-green-500 focus:ring-green-500'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`documents.${index}.content`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-gray-700'>
                  Nội dung *
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className='min-h-32 border-gray-300 focus:border-green-500 focus:ring-green-500'
                    placeholder='Nhập nội dung chi tiết của tài liệu...'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`documents.${index}.notes`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-gray-700'>
                  Ghi chú *
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className='min-h-32 border-gray-300 focus:border-green-500 focus:ring-green-500'
                    placeholder='Thêm ghi chú, hướng dẫn hoặc yêu cầu đặc biệt...'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Attachments Section for this document */}
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <FormField
              control={form.control}
              name={`documents.${index}.files`}
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
          </div>
        </div>
      </Card>
    </>
  )
}

export function TaskDocumentAttachmentField() {
  const form = useFormContext<CreateTaskForm>()

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'documents',
  })

  const addDocument = () => {
    append({
      documentType: '',
      content: '',
      notes: '',
      files: [],
      attachments: [],
    })
  }

  const removeDocument = (index: number) => {
    remove(index)
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between border-b border-gray-200 pb-4'>
          <div>
            <h3 className='text-xl font-semibold text-gray-800'>
              Danh sách tài liệu mới
            </h3>
            <p className='text-sm text-gray-600'>
              Tạo và quản lý các tài liệu cho nhiệm vụ này
            </p>
          </div>
        </div>
        {fields.length === 0 && (
          <Card className='border-dashed'>
            <CardContent className='flex flex-col items-center justify-center py-6'>
              <div className='flex size-16 items-center justify-center rounded-full bg-gray-100'>
                <FilePlus className='text-muted-foreground h-8 w-8' />
              </div>
              <p className='text-muted-foreground mt-2 text-sm'>
                Chưa có tài liệu nào
              </p>
              <Button
                type='button'
                variant='secondary'
                onClick={addDocument}
                className='mt-4'
              >
                <PlusCircle className='mr-2 size-4' />
                Thêm tài liệu đầu tiên
              </Button>
            </CardContent>
          </Card>
        )}

        <div className='space-y-6'>
          {fields.map((field, index) => (
            <NewDocumentFormCard
              key={field.id}
              index={index}
              onRemove={removeDocument}
            />
          ))}
        </div>
        {fields.length > 0 && (
          <Button
            type='button'
            variant='outline'
            className='w-full border-2 border-dashed'
            onClick={addDocument}
          >
            <FilePlus className='mr-2 h-4 w-4' />
            Thêm tài liệu mới
          </Button>
        )}
      </div>
    </div>
  )
}
