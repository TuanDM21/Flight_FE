import { DocumentAttachment } from '@/features/documents/types'

export async function convertToFile(obj: DocumentAttachment): Promise<File> {
  if (!obj.filePath || !obj.fileName || !obj.createdAt) {
    throw new Error('Invalid DocumentAttachment object')
  }

  const response = await fetch(obj.filePath)
  if (!response.ok) {
    throw new Error(`Không thể tải file: ${response.statusText}`)
  }

  const blob = await response.blob()

  const file = new File([blob], obj.fileName, {
    type: blob.type || 'application/octet-stream',
    lastModified: new Date(obj.createdAt).getTime(),
  })

  return file
}

export function downloadFileFromUrl({
  url,
  filename,
}: {
  url: string
  filename?: string
}): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const a = document.createElement('a')
      a.href = url
      if (filename) a.download = filename

      document.body.append(a)

      a.click()

      a.remove()
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

export function getFileType(fileName: string): string {
  const extension = getFileExtension(fileName)

  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf']
  const spreadsheetTypes = ['xls', 'xlsx', 'csv']
  const presentationTypes = ['ppt', 'pptx']
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz']
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
  const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg']

  if (imageTypes.includes(extension)) return 'image'
  if (documentTypes.includes(extension)) return 'document'
  if (spreadsheetTypes.includes(extension)) return 'spreadsheet'
  if (presentationTypes.includes(extension)) return 'presentation'
  if (archiveTypes.includes(extension)) return 'archive'
  if (videoTypes.includes(extension)) return 'video'
  if (audioTypes.includes(extension)) return 'audio'

  return 'other'
}
