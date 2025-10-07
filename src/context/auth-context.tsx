import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { AUTH_TOKEN_KEY, REQUIRES_PASSWORD_CHANGE_KEY } from '@/config/auth'
import { AuthorizedUser } from '@/types/auth'
import { useLocalStorage } from 'react-use'

export interface AuthContext {
  isAuthenticated: boolean
  user: AuthorizedUser | null
  requiresPasswordChange: boolean
  logout: () => void
  setToken: React.Dispatch<React.SetStateAction<string | null | undefined>>
  setRequiresPasswordChange: (value: boolean) => void
  hasRole: (role: string) => boolean
}

const AuthContext = React.createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken, removeToken] = useLocalStorage<string | null>(
    AUTH_TOKEN_KEY,
    null,
    { raw: true }
  )

  const [user, setUser] = React.useState<AuthorizedUser | null>(null)
  const [
    requiresPasswordChange,
    setRequiresPasswordChangeState,
    _removeRequiresPasswordChange,
  ] = useLocalStorage<boolean>(REQUIRES_PASSWORD_CHANGE_KEY, false)

  const setRequiresPasswordChange = React.useCallback(
    (value: boolean) => {
      setRequiresPasswordChangeState(value)
    },
    [setRequiresPasswordChangeState]
  )
  const isAuthenticated = token != null

  const getMeQuery = $queryClient.useQuery(
    'get',
    '/api/users/me',
    {},
    {
      enabled: isAuthenticated,
      retry: 1,
      retryDelay: 1000,
    }
  )

  const reset = React.useCallback(() => {
    removeToken()

    setUser(null)
    setRequiresPasswordChange(false)

    void queryClient.invalidateQueries({ queryKey: ['get', '/api/users/me'] })
    queryClient.clear()
  }, [queryClient, removeToken, setRequiresPasswordChange])

  const logout = React.useCallback(() => {
    reset()
  }, [reset])

  React.useEffect(() => {
    if (getMeQuery.data?.data) {
      setUser(getMeQuery.data.data)
    }
  }, [getMeQuery.data])

  const hasRole = React.useCallback(
    (role: string) => {
      return user?.roleName === role
    },
    [user]
  )

  const contextValue = React.useMemo(
    () => ({
      isAuthenticated,
      user,
      requiresPasswordChange: requiresPasswordChange ?? false,
      setToken,
      logout,
      setRequiresPasswordChange,
      hasRole,
    }),
    [
      isAuthenticated,
      user,
      requiresPasswordChange,
      setToken,
      logout,
      setRequiresPasswordChange,
      hasRole,
    ]
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

/**
 * Hook to use the auth context
 */
export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
