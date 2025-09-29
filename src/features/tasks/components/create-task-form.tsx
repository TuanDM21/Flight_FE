import React, { useRef } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Eye, Trash, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_COUNT,
  MAX_TOTAL_FILES_SIZE,
} from '@/constants/file'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
} from '@/components/ui/file-upload'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DataTableActionBarAction } from '@/components/data-table/data-table-action-bar'
import { useUploadAttachments } from '../../attachments/hooks/use-upload-attachments'
import { CreateTaskFormOutput } from '../types'
import { taskPriorityOptions } from '../utils'
import { TaskAssignmentsField } from './task-assignments-field'
import { taskTypesQueryOptions } from './use-task-types'

interface CreateTaskFormProps {
  form: UseFormReturn<CreateTaskFormOutput>
  formId: string
  onSubmit: (data: CreateTaskFormOutput) => Promise<void>
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  form,
  formId,
  onSubmit,
}) => {
  const uploadAttachments = useUploadAttachments()
  const abortControllerRef = useRef<AbortController | null>(null)
  const { data: taskTypesResponse } = useQuery({
    ...taskTypesQueryOptions(),
  })

  const taskTypeOptions = (taskTypesResponse?.data ?? []).map((type) => ({
    id: type.id,
    name: type.name,
  }))

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
      abortControllerRef.current = new AbortController()

      const result = await uploadAttachments(files, {
        onProgress,
        onSuccess,
        onError,
        abortController: abortControllerRef.current,
      })

      if (result.success && result.attachmentIds) {
        form.setValue('attachmentIds', result.attachmentIds)
      }
    },
    [form, uploadAttachments]
  )

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" đã bị từ chối`,
    })
  }, [])

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit(onSubmit)(e)
        }}
        className='space-y-6'
      >
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem className='space-y-1'>
              <FormLabel>Tiêu đề công việc</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className='min-h-16'
                  placeholder='Nhập tiêu đề công việc'
                />
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
              <FormLabel>Nội dung công việc</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className='min-h-32'
                  placeholder='Nhập mô tả chi tiết nội dung công việc'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='instructions'
          render={({ field }) => (
            <FormItem className='space-y-1'>
              <FormLabel>Hướng dẫn thực hiện</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className='min-h-32'
                  placeholder='Nhập hướng dẫn cách thực hiện công việc'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'priority'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mức độ ưu tiên</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className='w-full [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0'>
                    <SelectValue placeholder='Chọn mức độ ưu tiên' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className='flex flex-col gap-2'>
                      {taskPriorityOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className={cn('cursor-pointer', option.className)}
                        >
                          <div className='flex items-center gap-2'>
                            {option.icon && (
                              <option.icon
                                className={cn('h-3 w-3 bg-transparent')}
                              />
                            )}
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'taskTypeId'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại công việc</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className='w-full [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0'>
                    <SelectValue placeholder='Chọn loại công việc' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className='flex flex-col gap-2'>
                      {taskTypeOptions.map((option) => (
                        <SelectItem
                          key={option.id}
                          value={option.id!.toString()}
                          className={cn('cursor-pointer')}
                        >
                          <span>{option.name}</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
              <FormLabel>Ghi chú công việc</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className='min-h-32'
                  placeholder='Nhập ghi chú thêm về công việc'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TaskAssignmentsField form={form} name='assignments' />

        <FormField
          control={form.control}
          name='files'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tệp đính kèm</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onValueChange={field.onChange}
                  accept={ACCEPTED_FILE_TYPES.join(',')}
                  maxFiles={MAX_FILES_COUNT}
                  maxSize={MAX_FILE_SIZE}
                  maxTotalSize={MAX_TOTAL_FILES_SIZE}
                  onFileReject={onFileReject}
                  onUpload={onUpload}
                  multiple
                >
                  <FileUploadDropzone className='p-4'>
                    <div className='flex w-full flex-col items-center gap-1 rounded-lg px-2 py-3 text-center'>
                      <div className='bg-primary/5 mb-1 flex items-center justify-center rounded-full border p-2.5'>
                        <Upload className='text-primary size-6' />
                      </div>
                      <p className='text-sm font-medium'>
                        Kéo thả tệp vào đây hoặc nhấn để chọn từ thiết bị của
                        bạn
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        (Tối đa {MAX_FILES_COUNT} tệp,{' '}
                        {MAX_FILE_SIZE / 1024 / 1024}MB mỗi tệp, tổng cộng{' '}
                        {MAX_TOTAL_FILES_SIZE / 1024 / 1024}
                        MB)
                      </p>
                    </div>
                  </FileUploadDropzone>
                  <FileUploadList className='w-full'>
                    {field.value?.map((file: File, index: number) => (
                      <FileUploadItem
                        key={index}
                        value={file}
                        className='flex-col'
                      >
                        <div className='flex w-full items-center gap-2'>
                          <FileUploadItemPreview />
                          <FileUploadItemMetadata />
                          <DataTableActionBarAction
                            type='button'
                            size='icon'
                            tooltip='Xem tệp'
                            onClick={() => {
                              const url = URL.createObjectURL(file)
                              window.open(url, '_blank')
                            }}
                          >
                            <Eye />
                          </DataTableActionBarAction>
                          <FileUploadItemDelete type='button' asChild>
                            <DataTableActionBarAction
                              type='button'
                              size='icon'
                              tooltip='Xóa tệp'
                              onClick={() => {
                                if (abortControllerRef.current) {
                                  abortControllerRef.current.abort()
                                  abortControllerRef.current = null
                                }
                              }}
                            >
                              <Trash />
                            </DataTableActionBarAction>
                          </FileUploadItemDelete>
                        </div>
                        <FileUploadItemProgress />
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                </FileUpload>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
