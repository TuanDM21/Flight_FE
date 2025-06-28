import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import {
  AppAbility,
  AppRoles,
  AppSubjects,
  RoleActions,
} from '@/features/ability/types'
import { permissionsMatrix, rolesMeta } from './config'

export default function buildAbilityFor(role: AppRoles) {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)
  const meta = rolesMeta[role]

  for (const subject in meta.permissions) {
    const actions = meta.permissions[subject as keyof typeof meta.permissions]
    if (actions)
      for (const action of actions) can(action, subject as AppSubjects)
  }

  return build()
}

export function canActWithMatrix(
  currentRole: AppRoles,
  targetRole: AppRoles,
  action: RoleActions
): boolean {
  const config = permissionsMatrix[action]
  if (!config) return false

  return (
    config.allowedFrom.includes(currentRole) &&
    config.allowedTarget.includes(targetRole)
  )
}
