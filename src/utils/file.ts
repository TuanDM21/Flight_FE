export async function downloadFileFromUrl({
  url,
  filename,
}: {
  url: string
  filename?: string
}): Promise<void> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Network response was not ok')

    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename || 'download'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Cleanup blob URL
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    const a = document.createElement('a')
    a.href = url
    if (filename) a.download = filename

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
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
