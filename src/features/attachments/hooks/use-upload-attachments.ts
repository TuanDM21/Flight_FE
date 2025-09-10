import { UploadCommand, UploadProgressTracker } from '../services'
import { UploadOptions, UploadResult } from '../types'
import { useConfirmUploadAttachments } from './use-confirm-upload-attachments'
import { useGenerateUploadUrls } from './use-generate-upload-urls'

export const useUploadAttachments = () => {
  const generateUploadUrls = useGenerateUploadUrls()
  const confirmUpload = useConfirmUploadAttachments()

  return async (
    files: File[],
    options: UploadOptions
  ): Promise<UploadResult> => {
    const progressTracker = new UploadProgressTracker(options)

    const uploadCommand = new UploadCommand(
      progressTracker,
      generateUploadUrls,
      confirmUpload
    )

    return await uploadCommand.execute(files, options)
  }
}
