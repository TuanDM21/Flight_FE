import z from 'zod'
import {
  TASK_FILTER_TYPES,
  TASK_PRIORITIES,
  TASK_STATUS_FILTER,
} from '../tasks/constants'

export const searchMyTaskParamsSchema = z.object({
  type: z.enum(TASK_FILTER_TYPES).catch('assigned'),
  page: z.number().nonnegative().optional(),
  size: z.number().min(1).max(500).optional(),
  keyword: z.any().optional(),
  priorities: z
    .string()
    .transform((val) => {
      if (!val) return undefined
      const values = val.split(',')
      const allValid = values.every((v) => TASK_PRIORITIES.includes(v as any))
      return allValid && values.length > 0 ? values : undefined
    })
    .catch(undefined),
  status: z.enum(TASK_STATUS_FILTER).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  teamIds: z.any().optional(),
  userIds: z.any().optional(),
  unitIds: z.any().optional(),
  taskTypeIds: z.any().optional(),
})
