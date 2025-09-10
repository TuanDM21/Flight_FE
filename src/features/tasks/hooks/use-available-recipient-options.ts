import { useMemo } from 'react'
import $queryClient from '@/api'
import { LiteralUnion } from 'type-fest'
import { useAuth } from '@/context/auth-context'

export function useAvailableRecipientOptions() {
  const { hasRole } = useAuth()

  const getTeamQuery = $queryClient.useQuery('get', '/api/teams/assignable')
  const getUnitsQuery = $queryClient.useQuery('get', '/api/units/assignable')
  const getUsersQuery = $queryClient.useQuery('get', '/api/users/assignable')

  const getRecipientOptions = (
    type: LiteralUnion<'TEAM' | 'UNIT' | 'USER', string>
  ) => {
    if (type === 'TEAM') {
      return (
        (getTeamQuery.data?.data ?? []).map((team) => ({
          value: team.id,
          label: team.teamName,
        })) ?? []
      )
    }
    if (type === 'UNIT') {
      return (
        (getUnitsQuery.data?.data ?? []).map((unit) => ({
          value: unit.id,
          label: unit.unitName,
        })) ?? []
      )
    }
    return (
      (getUsersQuery.data?.data ?? []).map((user) => ({
        value: user.id,
        label: user.name,
      })) ?? []
    )
  }

  const deriveRecipientOptions = useMemo(() => {
    const userOption = { label: 'Cá nhân', value: 'USER' }
    const teamOption = { label: 'Đội', value: 'TEAM' }
    const unitOption = { label: 'Tổ', value: 'UNIT' }

    const higherRoles = ['ADMIN', 'DIRECTOR', 'VICE_DIRECTOR']
    if (higherRoles.some((role) => hasRole(role)))
      return [userOption, teamOption, unitOption]
    const mediumRoles = ['TEAM_VICE_LEAD', 'TEAM_LEAD']
    if (mediumRoles.some((role) => hasRole(role)))
      return [userOption, unitOption]
    return [userOption]
  }, [hasRole])

  return {
    getTeamQuery,
    getUnitsQuery,
    getUsersQuery,
    getRecipientOptions,
    deriveRecipientOptions,
  }
}
