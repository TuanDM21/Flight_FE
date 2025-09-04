import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { ACCEPTED_FILE_TYPES } from '@/constants/file'
import { FileUpload, FileUploadTrigger } from '@/components/ui/file-upload'
import { Progress } from '@/components/ui/progress'
import { useUploadAttachments } from '@/features/attachments/hooks/use-upload-attachments'
import { fileSchema } from '@/features/attachments/schema'
import { useUploadTaskAttachments } from '../hooks/use-upload-task-attachments'
import { TaskFilterTypes } from '../types'

interface TaskAttachmentsUploaderProps {
  taskId: number
  filterType: TaskFilterTypes
  children?: React.ReactNode
}

export function TaskAttachmentsUploader({
  taskId,
  children,
  filterType,
}: TaskAttachmentsUploaderProps) {
  const uploadAttachments = useUploadAttachments()
  const uploadTaskAttachmentsMutation = useUploadTaskAttachments(filterType)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  const onFileValidate = useCallback((file: File) => {
    const result = fileSchema.safeParse(file)
    if (result.success) return null
    return result.error.issues[0]?.message || 'Tệp không hợp lệ'
  }, [])

  const onFileAccept = useCallback(
    async (file: File) => {
      const fileName =
        file.name.length > 30 ? `${file.name.slice(0, 30)}...` : file.name

      abortControllerRef.current = new AbortController()

      const cancelUploadAttachments = () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
      }

      const toastId = toast.loading(`Đang tải lên ${fileName}`, {
        action: {
          label: 'Hủy',
          onClick: cancelUploadAttachments,
        },
        duration: 2000,
      })

      const attachmentUploadResult = await uploadAttachments([file], {
        abortController: abortControllerRef.current,
        onProgress: (progressFile, progress) => {
          if (progressFile.name === file.name) {
            toast.loading(`Đang tải lên ${fileName}`, {
              id: toastId,
              description: <Progress value={progress} className='h-2' />,
              action: {
                label: 'Hủy',
                onClick: cancelUploadAttachments,
              },
            })
          }
        },
        onError: (errorFile, error) => {
          if (errorFile.name === file.name) {
            const isAbortError = error.name === 'AbortError'

            const errorMessage = isAbortError
              ? 'Việc tải lên đã bị người dùng hủy'
              : error.message || 'Đã xảy ra lỗi trong quá trình tải lên.'

            toast.error(
              isAbortError
                ? `Tải lên bị hủy: ${fileName}`
                : `Không thể tải lên ${fileName}`,
              {
                id: toastId,
                description: errorMessage,
              }
            )
          }
        },
        onFinally() {
          abortControllerRef.current = null
        },
      })

      // Handle upload result with new API
      if (attachmentUploadResult.success) {
        // All files uploaded successfully
        const attachmentIds = attachmentUploadResult.attachmentIds!

        const executeTaskAttachmentMutation =
          uploadTaskAttachmentsMutation.mutateAsync({
            params: {
              path: {
                id: taskId,
              },
            },
            body: {
              attachmentIds,
            },
            signal: abortControllerRef.current?.signal,
          })

        toast.promise(executeTaskAttachmentMutation, {
          id: toastId,
          loading: `Đang liên kết ${fileName} với task...`,
          success: () => {
            return `Liên kết ${fileName} thành công với task #${taskId}`
          },
          error: (error) => {
            const isAbortError =
              error instanceof Error && error.name === 'AbortError'
            return isAbortError
              ? `Liên kết bị hủy: ${fileName}`
              : `Không thể liên kết ${fileName} với task #${taskId}: ${error.message}`
          },
        })
      } else {
        toast.dismiss(toastId)
      }
    },
    [uploadAttachments, uploadTaskAttachmentsMutation, taskId]
  )

  const onFileReject = useCallback((file: File, message: string) => {
    const fileName =
      file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
    toast.error(`Tệp bị từ chối: ${fileName}`, {
      description: message,
    })
  }, [])

  return (
    <FileUpload
      onFileValidate={onFileValidate}
      onFileAccept={onFileAccept}
      onFileReject={onFileReject}
      accept={ACCEPTED_FILE_TYPES.join(',')}
      multiple
    >
      <FileUploadTrigger asChild>{children}</FileUploadTrigger>
    </FileUpload>
  )
}
