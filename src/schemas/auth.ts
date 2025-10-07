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
      error: 'Password must be at least 6 characters long',
    }),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'Vui lòng nhập mật khẩu hiện tại' }),
    newPassword: z
      .string()
      .min(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số',
      }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Vui lòng xác nhận mật khẩu' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
