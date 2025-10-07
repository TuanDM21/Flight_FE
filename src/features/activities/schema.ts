import z from 'zod'

export const searchActivityParamsSchema = z.object({
  type: z.string().catch('company'),
  keyword: z.any().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})
