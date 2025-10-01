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

export const eventSchema = z.object({
  name: z.string('Name is required'),
  notes: z.string('Notes is required'),
  location: z.string('Location is required'),
  startTime: z.date('Start date is required'),
  endTime: z.date('End date is required'),
  pinned: z.boolean(),
  participants: participantsSchema,
})

export type EventFormData = z.infer<typeof eventSchema>
