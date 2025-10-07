import { SignInRoute } from '@/routes/(auth)/sign-in'
import { Shield, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { ChangePasswordForm } from './components/change-password-form'

type ChangePasswordPageProps = {
  isForced?: boolean
}

export function ChangePasswordPage({
  isForced = false,
}: ChangePasswordPageProps) {
  const auth = useAuth()
  const navigate = SignInRoute.useNavigate()

  const handleLogout = () => {
    auth.logout()
    void navigate({ to: '/sign-in' })
  }
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
      <div className='container mx-auto flex min-h-screen flex-col items-center justify-center p-4'>
        <div className='mb-6 text-center'>
          <div className='bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
            <Shield className='text-primary h-8 w-8' />
          </div>
          <h1 className='text-foreground text-3xl font-bold tracking-tight'>
            Bảo mật tài khoản
          </h1>
        </div>

        <Card className='w-full max-w-md shadow-lg'>
          <CardHeader className='space-y-4'>
            {isForced && (
              <Alert className='border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50'>
                <AlertTriangle className='h-4 w-4 text-amber-600 dark:text-amber-500' />
                <AlertDescription className='text-amber-800 dark:text-amber-200'>
                  Vì lý do bảo mật, bạn cần đổi mật khẩu trước khi tiếp tục sử
                  dụng hệ thống
                </AlertDescription>
              </Alert>
            )}

            <CardDescription className='text-sm'>
              {isForced
                ? 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số'
                : 'Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <ChangePasswordForm isForced={isForced} />
            {isForced && (
              <div className='border-t pt-4'>
                <p className='text-muted-foreground text-center text-xs'>
                  Nếu bạn không muốn đổi mật khẩu ngay bây giờ, bạn có thể{' '}
                  <button
                    onClick={handleLogout}
                    className='text-primary hover:underline'
                  >
                    đăng xuất
                  </button>{' '}
                  và đăng nhập lại sau
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
