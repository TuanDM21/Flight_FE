import { HTMLAttributes } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import $queryClient from '@/api'
import { changePasswordSchema } from '@/schemas/auth'
import { ChangePasswordCredentials } from '@/types/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'

type ChangePasswordFormProps = HTMLAttributes<HTMLFormElement> & {
  isForced?: boolean
}

export function ChangePasswordForm({
  className,
  isForced = false,
  ...props
}: ChangePasswordFormProps) {
  const auth = useAuth()
  const navigate = useNavigate()
  const changePasswordMutation = $queryClient.useMutation(
    'post',
    '/api/auth/change-password-first-login'
  )

  const form = useForm<ChangePasswordCredentials>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  function onSubmit(data: ChangePasswordCredentials) {
    const changePasswordPromise = changePasswordMutation.mutateAsync({
      body: data,
    })

    toast.promise(changePasswordPromise, {
      loading: 'Đang đổi mật khẩu...',
      success: () => {
        if (isForced) {
          auth.setRequiresPasswordChange(false)
          void navigate({ to: '/tasks' })
        } else {
          void navigate({ to: '/' })
        }
        return 'Đổi mật khẩu thành công!'
      },
      error: (error) => {
        void error
        return 'Đổi mật khẩu thất bại. Vui lòng thử lại.'
      },
    })
  }

  const isChanging = changePasswordMutation.isPending

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='currentPassword'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Mật khẩu hiện tại</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='Nhập mật khẩu hiện tại'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Mật khẩu mới</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Nhập mật khẩu mới' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Xác nhận mật khẩu mới</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Nhập lại mật khẩu mới' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className='mt-2'
          disabled={form.formState.isSubmitting || isChanging}
          type='submit'
        >
          {isChanging ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </Button>
      </form>
    </Form>
  )
}
