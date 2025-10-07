import { paths } from '@/generated/api-schema'

export type LoginCredentials =
  paths['/api/auth/login']['post']['requestBody']['content']['application/json'] & {
    remember?: boolean
  }

export type LoginResponse = {
  accessToken: string
  requiresPasswordChange?: boolean
}

export type ChangePasswordCredentials = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type AuthorizedUser =
  paths['/api/users/me']['get']['responses'][200]['content']['*/*']['data']
