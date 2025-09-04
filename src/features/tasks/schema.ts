import * as z from 'zod'
import { ASSIGNMENT_STATUSES, TASK_PRIORITIES } from './constants'

export const assignmentsSchema = z
  .array(
    z.object({
      recipientType: z.string().min(1, 'Vui lòng chọn loại người nhận'),
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
  title: z.string().min(1, { error: 'Vui lòng nhập tiêu đề nhiệm vụ' }),
  content: z.string().min(1, { error: 'Vui lòng nhập nội dung nhiệm vụ' }),
  instructions: z
    .string()
    .min(1, { error: 'Vui lòng nhập hướng dẫn nhiệm vụ' }),
  notes: z.string().optional(),
  assignments: assignmentsSchema,
  attachmentIds: z.array(z.number()).default([]),
  priority: z.enum(TASK_PRIORITIES),
  files: z.array(z.custom<File>()).default([]).optional(),
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
