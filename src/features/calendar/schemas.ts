import { z } from 'zod'

export const participantsSchema = z
  .array(
    z.object({
      participantType: z.enum(['UNIT', 'TEAM', 'USER'], {
        error: 'Vui lòng chọn loại người tham gia',
      }),
      participantIds: z
        .array(z.number().int())
        .min(1, 'Vui lòng chọn ít nhất một người tham gia'),
    })
  )
  .min(1, 'Vui lòng thêm ít nhất một người tham gia')

export const eventSchema = z
  .object({
    title: z.string().min(1, 'Tiêu đề là bắt buộc'),
    description: z.string(),
    location: z.string().min(1, 'Địa điểm là bắt buộc'),
    startDate: z.date({ message: 'Thời gian bắt đầu là bắt buộc' }),
    endDate: z.date({ message: 'Thời gian kết thúc là bắt buộc' }),
    pinned: z.boolean(),
    participants: participantsSchema,
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate
      }
      return true
    },
    {
      message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate < data.endDate
      }
      return true
    },
    {
      message: 'Thời gian bắt đầu phải trước thời gian kết thúc',
      path: ['startDate'],
    }
  )

export type TEventFormData = z.infer<typeof eventSchema>
