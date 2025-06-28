import { ReactNode } from 'react'
import { File, FileAudio, FileImage, FileText, FileVideo } from 'lucide-react'

export type FileType = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'file'

export function useFileIconType() {
  const getFileType = (fileName: string): FileType => {
    const extension = fileName.split('.').pop()?.toLowerCase() || ''
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension))
      return 'image'
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension))
      return 'video'
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(extension))
      return 'audio'
    if (['pdf'].includes(extension)) return 'pdf'
    if (['txt', 'md', 'json', 'xml', 'csv'].includes(extension)) return 'text'
    return 'file'
  }

  const getFileIcon = (fileName: string): ReactNode => {
    const type = getFileType(fileName)
    switch (type) {
      case 'image': {
        return <FileImage className='text-primary h-4 w-4' />
      }
      case 'video': {
        return <FileVideo className='text-primary h-4 w-4' />
      }
      case 'audio': {
        return <FileAudio className='text-primary h-4 w-4' />
      }
      case 'pdf': {
        return <FileText className='text-primary h-4 w-4' />
      }
      default: {
        return <File className='text-primary h-4 w-4' />
      }
    }
  }

  return { getFileType, getFileIcon }
}
