import { HTMLAttributes } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import $queryClient from '@/api'
import { loginSchema } from '@/schemas/auth'
import { LoginCredentials } from '@/types/auth'
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
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

type SignInFormProps = HTMLAttributes<HTMLFormElement>

export function SignInForm({ className, ...props }: SignInFormProps) {
  const auth = useAuth()
  const navigate = useNavigate()
  const isLoading = useRouterState({ select: (s) => s.isLoading })
  const loginMutation = $queryClient.useMutation('post', '/api/auth/login')

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'director@example.com',
      password: '123456',
      remember: false,
    },
  })
  async function onSubmit(data: LoginCredentials) {
    const { remember, ...loginData } = data
    const loginPromise = loginMutation.mutateAsync({
      body: loginData,
    })
    toast.promise(loginPromise, {
      loading: 'Đang đăng nhập...',
      success: ({ data: loginResponse }) => {
        const newToken = loginResponse?.accessToken
        if (newToken) {
          auth.setToken(newToken)
          navigate({ to: '/tasks' })
        }
        return 'Đăng nhập thành công!'
      },
      error: 'Thông tin đăng nhập không chính xác. Vui lòng thử lại.',
    })
  }

  const isLoggingIn = isLoading || loginMutation.isPending

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
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='Nhập email của bạn' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Nhập mật khẩu của bạn' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className='mt-2'
          disabled={form.formState.isSubmitting || isLoggingIn}
          type='submit'
        >
          {isLoggingIn ? 'Đang tải...' : 'Đăng nhập'}
        </Button>
      </form>
    </Form>
  )
}
