import {
  ERROR_MESSAGES,
  UPLOAD_HEADERS,
  AZURE_BLOB_TYPE,
} from '../constants/upload'
import { ValidatedFileInfo, FileUploadInfo } from '../types/upload'

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
