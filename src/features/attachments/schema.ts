import { z } from 'zod'
import { formatFileSize } from '@/lib/format'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/constants/file'

export const fileSchema = z
  .file()
  .max(MAX_FILE_SIZE, {
    error: `Kích thước tệp không được vượt quá ${formatFileSize(MAX_FILE_SIZE)}`,
  })
  .mime(ACCEPTED_FILE_TYPES, {
    error: 'Định dạng tệp không được hỗ trợ',
  })
