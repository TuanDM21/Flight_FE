import { SignInForm } from './components/sign-in-form'

export default function SignInPage() {
  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-[3fr_2fr] lg:px-0'>
      <div className='relative hidden h-full flex-col overflow-hidden lg:flex dark:border-r'>
        {/* Background Image */}
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage: 'url(./images/login-background.jpg)',
          }}
        />
      </div>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px]'>
          <div className='flex flex-col space-y-2 text-left'>
            <h1 className='text-2xl font-semibold tracking-tight'>Đăng nhập</h1>
            <p className='text-muted-foreground text-sm'>
              Nhập email và mật khẩu của bạn bên dưới <br />
              để đăng nhập vào tài khoản của bạn
            </p>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
