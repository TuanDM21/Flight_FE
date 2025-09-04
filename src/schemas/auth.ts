import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .email({ error: 'Invalid email address' })
    .min(1, { error: 'Please enter your email' }),

  password: z
    .string()
    .min(1, {
      error: 'Please enter your password',
    })
    .min(6, {
      error: 'Password must be at least 7 characters long',
    }),
})
