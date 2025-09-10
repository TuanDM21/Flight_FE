import * as z from 'zod'
import { fileSchema } from '../attachments/schema'
import { ASSIGNMENT_STATUSES, TASK_PRIORITIES } from './constants'

export const assignmentsSchema = z
  .array(
    z.object({
      recipientType: z.enum(['USER', 'TEAM', 'UNIT'], {
        error: 'Vui lòng chọn loại người nhận',
      }),
      recipientId: z
        .number({ error: 'Vui lòng chọn người nhận' })
        .int('Vui lòng chọn người nhận hợp lệ'),
      dueAt: z.string({ error: 'Vui lòng chọn ngày hạn' }),
      note: z.string().optional(),
    })
  )
  .default([])
  .optional()

export const createTaskSchema = z.object({
  title: z.string().min(1, { error: 'Vui lòng nhập tiêu đề công việc' }),
  content: z.string().min(1, { error: 'Vui lòng nhập nội dung công việc' }),
  instructions: z
    .string()
    .min(1, { error: 'Vui lòng nhập hướng dẫn công việc' }),
  notes: z.string().optional(),
  assignments: assignmentsSchema,
  attachmentIds: z.array(z.number()).default([]),
  priority: z.enum(TASK_PRIORITIES),
  files: z.array(fileSchema).optional(),
})

export const updateTaskAssignmentSchema = z.object({
  recipientId: z.number({ error: 'Vui lòng chọn người nhận' }),
  recipientType: z.string().min(1, { error: 'Vui lòng chọn loại người nhận' }),
  dueAt: z.string({ error: 'Vui lòng chọn ngày hạn' }),
  note: z.string().optional(),
  status: z.enum(ASSIGNMENT_STATUSES),
})

export const createTaskAssignmentsSchema = z.object({
  assignments: assignmentsSchema,
})
