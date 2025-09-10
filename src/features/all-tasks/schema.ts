import z from 'zod'
import { TASK_PRIORITIES, TASK_STATUS_FILTER } from '../tasks/constants'

export const searchAllTaskParamsSchema = z.object({
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
})
