import { useMemo } from 'react'
import $queryClient from '@/api'

export function useRecipientOptions() {
  const getTeamQuery = $queryClient.useQuery('get', '/api/teams/assignable')
  const getUnitsQuery = $queryClient.useQuery('get', '/api/units/assignable')
  const getUsersQuery = $queryClient.useQuery('get', '/api/users/assignable')

  const teamOptions = useMemo(() => {
    return (
      (getTeamQuery.data?.data ?? []).map((team) => ({
        value: team.id!.toString(),
        label: team.teamName!,
      })) ?? []
    )
  }, [getTeamQuery.data?.data])

  const unitOptions = useMemo(() => {
    return (
      (getUnitsQuery.data?.data ?? []).map((unit) => ({
        value: unit.id!.toString(),
        label: unit.unitName!,
      })) ?? []
    )
  }, [getUnitsQuery.data?.data])

  const userOptions = useMemo(() => {
    return (
      (getUsersQuery.data?.data ?? []).map((user) => ({
        value: user.id!.toString(),
        label: user.name!,
      })) ?? []
    )
  }, [getUsersQuery.data?.data])

  return {
    teamOptions,
    unitOptions,
    userOptions,
  }
}
