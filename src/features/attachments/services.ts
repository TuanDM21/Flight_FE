import {
  ERROR_MESSAGES,
  UPLOAD_HEADERS,
  AZURE_BLOB_TYPE,
  UPLOAD_PROGRESS,
} from './constants'
import { useConfirmUploadAttachments } from './hooks/use-confirm-upload-attachments'
import { useGenerateUploadUrls } from './hooks/use-generate-upload-urls'
import {
  ValidatedFileInfo,
  FileUploadInfo,
  SuccessfulUpload,
  UploadOptions,
  UploadResult,
  AttachmentItem,
  UploadCallbacks,
  UploadUrlsResponse,
} from './types'

// Validation Service
export class UploadValidationService {
  static validateFiles(files: File[]): void {
    if (!files.length) {
      throw new Error(ERROR_MESSAGES.NO_FILES)
    }
  }

  static validateFileInfo(
    fileInfo: FileUploadInfo | undefined,
    fileName: string
  ): ValidatedFileInfo {
    if (
      !fileInfo ||
      !fileInfo.uploadUrl ||
      fileInfo.attachmentId === undefined
    ) {
      throw new Error(ERROR_MESSAGES.NO_UPLOAD_URL(fileName))
    }

    return {
      fileName: fileInfo.fileName!,
      uploadUrl: fileInfo.uploadUrl,
      attachmentId: fileInfo.attachmentId,
      uniqueFileName: fileInfo.uniqueFileName,
      expiryTime: fileInfo.expiryTime,
      fileUrl: fileInfo.fileUrl,
      instructions: fileInfo.instructions,
    }
  }
}

// Network Service
export class NetworkService {
  static async uploadFileToStorage(
    file: File,
    uploadUrl: string,
    signal?: AbortSignal
  ): Promise<Response> {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          [UPLOAD_HEADERS.BLOB_TYPE]: AZURE_BLOB_TYPE,
          [UPLOAD_HEADERS.CONTENT_TYPE]: file.type,
        },
        body: file,
        signal,
      })

      if (!response.ok) {
        throw new Error(
          ERROR_MESSAGES.UPLOAD_FAILED(
            file.name,
            response.status,
            response.statusText
          )
        )
      }

      return response
    } catch (error) {
      NetworkService.handleNetworkError(error)
      throw error
    }
  }

  private static handleNetworkError(error: unknown): void {
    if (!navigator.onLine) {
      throw new Error(ERROR_MESSAGES.NO_INTERNET)
    }

    if (
      error instanceof TypeError &&
      error.message.includes('Failed to fetch')
    ) {
      throw new Error(ERROR_MESSAGES.SERVER_ERROR)
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(ERROR_MESSAGES.UPLOAD_ABORTED)
    }
  }
}

// Factory Pattern: Create appropriate error responses
class UploadErrorFactory {
  static createAbortError(error: Error): UploadResult {
    return { success: false, error }
  }

  static createNetworkError(error: Error): UploadResult {
    return { success: false, error }
  }

  static createPartialError(
    failedCount: number,
    attachmentIds: number[],
    confirmedAttachments: AttachmentItem[]
  ): UploadResult {
    return {
      success: false,
      error: new Error(ERROR_MESSAGES.PARTIAL_FAILED(failedCount)),
      attachmentIds,
      confirmedAttachments,
    }
  }

  static createAllFailedError(): UploadResult {
    return {
      success: false,
      error: new Error(ERROR_MESSAGES.ALL_FAILED),
    }
  }
}

// Observer Pattern: Progress tracker
export class UploadProgressTracker {
  constructor(private callbacks: UploadCallbacks) {}

  updateBatch(files: File[], progress: number) {
    files.forEach((file) => this.callbacks.onProgress?.(file, progress))
  }

  notifySuccess(
    successfulUploads: Array<{ file: File; attachmentId: number }>
  ) {
    // Call individual success callbacks
    successfulUploads.forEach(({ file, attachmentId }) =>
      this.callbacks.onSuccess?.(file, attachmentId)
    )
  }

  notifyBatchSuccess(
    results: Array<{
      file: File
      attachmentId: number
      confirmedAttachment: AttachmentItem
    }>
  ) {
    // Call batch success callback if provided
    this.callbacks.onBatchSuccess?.(results)
  }

  notifyError(file: File, error: Error) {
    this.callbacks.onError?.(file, error)
  }
}

// Command Pattern: Upload operations
export class UploadCommand {
  constructor(
    private progressTracker: UploadProgressTracker,
    private generateUploadUrls: ReturnType<typeof useGenerateUploadUrls>,
    private confirmUpload: ReturnType<typeof useConfirmUploadAttachments>
  ) {}

  async execute(files: File[], options: UploadOptions): Promise<UploadResult> {
    try {
      UploadValidationService.validateFiles(files)
      const uploadUrls = await this.generateUrls(files, options)
      const uploadResults = await this.uploadFiles(files, uploadUrls, options)
      return await this.processResults(uploadResults, files, options)
    } catch (error) {
      return this.handleGlobalError(error, files, options)
    } finally {
      options.onFinally?.()
    }
  }

  private async generateUrls(files: File[], options: UploadOptions) {
    this.progressTracker.updateBatch(files, UPLOAD_PROGRESS.URL_GENERATED)

    const uploadRequest = {
      files: files.map((file) => ({
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      })),
    }

    const result = await this.generateUploadUrls.mutateAsync({
      body: uploadRequest,
      signal: options.abortController?.signal,
    })

    this.progressTracker.updateBatch(files, UPLOAD_PROGRESS.URLS_READY)
    return result.data!
  }

  private async uploadFiles(
    files: File[],
    uploadUrls: UploadUrlsResponse,
    options: UploadOptions
  ) {
    const uploadPromises = files.map(
      async (file): Promise<SuccessfulUpload> => {
        const fileInfo = uploadUrls.files.find(
          (f: FileUploadInfo) => f.fileName === file.name
        )

        const validatedFileInfo = UploadValidationService.validateFileInfo(
          fileInfo,
          file.name
        )

        try {
          await NetworkService.uploadFileToStorage(
            file,
            validatedFileInfo.uploadUrl,
            options.abortController?.signal
          )

          this.progressTracker.updateBatch(
            [file],
            UPLOAD_PROGRESS.FILE_UPLOADED
          )
          return { file, attachmentId: validatedFileInfo.attachmentId }
        } catch (error) {
          throw error
        }
      }
    )

    return await Promise.allSettled(uploadPromises)
  }

  private async processResults(
    uploadResults: PromiseSettledResult<SuccessfulUpload>[],
    files: File[],
    options: UploadOptions
  ): Promise<UploadResult> {
    const successfulUploads = uploadResults
      .filter(
        (result): result is PromiseFulfilledResult<SuccessfulUpload> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value)

    const failedUploads = uploadResults.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    )

    // Handle failures
    this.handleFailures(failedUploads, uploadResults, files)

    // Handle successes
    if (successfulUploads.length > 0) {
      try {
        const { attachmentIds, confirmedAttachments } =
          await this.confirmUploads(successfulUploads, options)

        // Chain of Responsibility Pattern: Success handling
        if (failedUploads.length === 0) {
          return { success: true, attachmentIds, confirmedAttachments }
        } else {
          return UploadErrorFactory.createPartialError(
            failedUploads.length,
            attachmentIds,
            confirmedAttachments
          )
        }
      } catch (confirmError) {
        return UploadErrorFactory.createNetworkError(confirmError as Error)
      }
    }

    return UploadErrorFactory.createAllFailedError()
  }

  private handleFailures(
    failedUploads: PromiseRejectedResult[],
    uploadResults: PromiseSettledResult<SuccessfulUpload>[],
    files: File[]
  ) {
    failedUploads.forEach((result) => {
      const failedIndex = uploadResults.indexOf(result)
      const file = files[failedIndex]
      if (file) {
        this.progressTracker.notifyError(file, result.reason as Error)
      }
    })
  }

  private async confirmUploads(
    successfulUploads: SuccessfulUpload[],
    options: UploadOptions
  ) {
    const attachmentIds = successfulUploads
      .filter((result) => result.attachmentId !== undefined)
      .map((result) => Number(result.attachmentId))

    const confirmedAttachments = await this.confirmUpload.mutateAsync({
      body: { attachmentIds },
      signal: options.abortController?.signal,
    })

    // Update progress to 100%
    successfulUploads.forEach((result) =>
      this.progressTracker.updateBatch([result.file], UPLOAD_PROGRESS.COMPLETED)
    )

    // Notify individual successes
    this.progressTracker.notifySuccess(
      successfulUploads.map((result) => ({
        file: result.file,
        attachmentId: Number(result.attachmentId),
      }))
    )

    // Notify batch success with full results
    const batchResults = successfulUploads.map((result, index) => ({
      file: result.file,
      attachmentId: Number(result.attachmentId),
      confirmedAttachment: confirmedAttachments.data![index],
    }))

    this.progressTracker.notifyBatchSuccess(batchResults)

    return {
      attachmentIds,
      confirmedAttachments: confirmedAttachments.data!,
    }
  }

  private handleGlobalError(
    error: unknown,
    files: File[],
    _options: UploadOptions
  ): UploadResult {
    if (error instanceof Error && error.name === 'AbortError') {
      files.forEach((file) => this.progressTracker.notifyError(file, error))
      return UploadErrorFactory.createAbortError(error)
    }

    if (!navigator.onLine) {
      const offlineError = new Error(ERROR_MESSAGES.OFFLINE)
      files.forEach((file) =>
        this.progressTracker.notifyError(file, offlineError)
      )
      return UploadErrorFactory.createNetworkError(offlineError)
    }

    if (error instanceof TypeError) {
      // Handle server errors (Failed to fetch)
      if (error.message.includes('Failed to fetch')) {
        const serverError = new Error(ERROR_MESSAGES.FETCH_FAILED)
        files.forEach((file) =>
          this.progressTracker.notifyError(file, serverError)
        )
        return UploadErrorFactory.createNetworkError(serverError)
      }
    }

    files.forEach((file) =>
      this.progressTracker.notifyError(file, error as Error)
    )
    return UploadErrorFactory.createNetworkError(error as Error)
  }
}
