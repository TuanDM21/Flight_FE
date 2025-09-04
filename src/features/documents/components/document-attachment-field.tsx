import { Eye, Trash, Upload } from 'lucide-react'
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
import { DataTableActionBarAction } from '@/components/data-table/data-table-action-bar'
import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_COUNT,
  MAX_TOTAL_FILES_SIZE,
} from '../../../constants/file'

interface DocumentAttachmentFieldProps {
  value?: File[]
  onChange: (files: File[]) => void
  onFileReject: (file: File, message: string) => void
  onUpload: (
    files: File[],
    callbacks: {
      onProgress: (file: File, progress: number) => void
      onSuccess: (file: File) => void
      onError: (file: File, error: Error) => void
    }
  ) => Promise<void>
  onOpenPreview: (file: File) => void
}

export function DocumentAttachmentField({
  value,
  onChange,
  onFileReject,
  onUpload,
  onOpenPreview,
}: DocumentAttachmentFieldProps) {
  return (
    <FileUpload
      value={value}
      onValueChange={onChange}
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
            Kéo thả tệp vào đây hoặc nhấn để chọn từ thiết bị của bạn
          </p>
          <p className='text-muted-foreground text-xs'>
            (Tối đa {MAX_FILES_COUNT} tệp, {MAX_FILE_SIZE / 1024 / 1024}MB mỗi
            tệp, tổng cộng {MAX_TOTAL_FILES_SIZE / 1024 / 1024}
            MB)
          </p>
        </div>
        <FileUploadList className='w-full'>
          {value?.map((file, index) => (
            <FileUploadItem key={index} value={file} className='flex-col'>
              <div className='flex w-full items-center gap-2'>
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <DataTableActionBarAction
                  type='button'
                  size='icon'
                  tooltip='Xem tệp'
                  onClick={() => {
                    onOpenPreview(file)
                  }}
                >
                  <Eye />
                </DataTableActionBarAction>
                <FileUploadItemDelete type='button' asChild>
                  <DataTableActionBarAction
                    type='button'
                    size='icon'
                    tooltip='Xóa tệp'
                  >
                    <Trash />
                  </DataTableActionBarAction>
                </FileUploadItemDelete>
              </div>
              <FileUploadItemProgress />
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUploadDropzone>
    </FileUpload>
  )
}
