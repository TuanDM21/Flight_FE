import { paths } from '@/generated/api-schema'

// Type helpers
export interface ValidatedFileInfo {
  fileName: string
  uploadUrl: string
  attachmentId: number
  uniqueFileName?: string
  expiryTime?: string
  fileUrl?: string
  instructions?: string
}

// API response types
export interface FileUploadInfo {
  fileName?: string
  uploadUrl?: string
  attachmentId?: number
  uniqueFileName?: string
  expiryTime?: string
  fileUrl?: string
  instructions?: string
  error?: string
}

export interface UploadUrlsResponse {
  files: FileUploadInfo[]
  message?: string
}

// Upload operation types
export interface SuccessfulUpload {
  file: File
  attachmentId: string | number
}

export interface UploadCallbacks {
  onProgress: (file: File, progress: number) => void
  onSuccess?: (file: File, attachmentId: number) => void
  onBatchSuccess?: (
    results: Array<{
      file: File
      attachmentId: number
      confirmedAttachment: AttachmentItem
    }>
  ) => void
  onError: (file: File, error: Error) => void
  onFinally?: () => void
}

export interface UploadOptions extends UploadCallbacks {
  abortController?: AbortController
}

export interface UploadResult {
  success: boolean
  attachmentIds?: number[]
  confirmedAttachments?: AttachmentItem[]
  error?: Error
}

export type AttachmentItem = NonNullable<
  paths['/api/attachments/{id}']['get']['responses']['200']['content']['*/*']['data']
>
