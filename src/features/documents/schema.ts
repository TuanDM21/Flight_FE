import { z } from 'zod'
import { MAX_FILE_SIZE, MAX_FILES_COUNT } from '../../constants/file'

const baseDocumentFields = {
  documentType: z.string().min(1, 'Loại tài liệu là bắt buộc'),
  content: z.string().min(1, 'Nội dung là bắt buộc'),
  notes: z.string().min(1, 'Ghi chú là bắt buộc'),
}

// Schema cho attachment
const attachmentSchema = z.object({
  id: z.number(),
  filePath: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  createdAt: z.string(),
})

// Base files schema với các validation chung
const createBaseFilesSchema = () => {
  let schema = z.array(z.custom<File>())

  return schema
    .max(MAX_FILES_COUNT, `Vui lòng chọn tối đa ${MAX_FILES_COUNT} tệp`)
    .refine((files) => files.every((file) => file.size <= MAX_FILE_SIZE), {
      message: `Kích thước tệp phải nhỏ hơn ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      path: ['files'],
    })
    .refine(
      (files) =>
        files.reduce((acc, file) => acc + file.size, 0) <=
        MAX_FILE_SIZE * MAX_FILES_COUNT,
      {
        message: 'Tổng kích thước các tệp phải nhỏ hơn 50MB',
        path: ['files'],
      }
    )
    .default([])
    .optional()
}

export const createDocumentSchema = z.object({
  ...baseDocumentFields,
  files: createBaseFilesSchema(),
  attachments: z.array(attachmentSchema).default([]).optional(),
})

export const editDocumentSchema = z.object({
  ...baseDocumentFields,
  files: createBaseFilesSchema(),
  attachments: z.array(attachmentSchema).default([]).optional(),
})
