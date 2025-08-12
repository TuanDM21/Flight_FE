import { useQueryClient } from '@tanstack/react-query'
import $queryClient from '@/api'
import { BaseApiResponse } from '@/types/response'
import { attachmentKeysFactory } from '@/api/query-key-factory'
import { useAuth } from '@/context/auth-context'
import { UserItem } from '@/features/users/types'
import { AttachmentItem, SharedAttachmentUserItem } from '../types'

interface OptimisticGrantContext {
  attachmentId: number
  userIds: number[]
  previousSharedUsers?: BaseApiResponse<SharedAttachmentUserItem[]>
  previousMyFiles?: BaseApiResponse<AttachmentItem[]>
}

export const useGrantAttachmentAccess = () => {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()

  return $queryClient.useMutation('post', '/api/attachments/share', {
    onMutate: async (variables): Promise<OptimisticGrantContext> => {
      const { attachmentId, userIds } = variables.body

      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey:
          attachmentKeysFactory.usersSharedWithAttachments(attachmentId),
      })

      // Snapshot the previous shared users
      const previousSharedUsers = queryClient.getQueryData<
        BaseApiResponse<SharedAttachmentUserItem[]>
      >(attachmentKeysFactory.usersSharedWithAttachments(attachmentId))

      // Get all users to find the ones being shared with
      const allUsers = queryClient.getQueryData<BaseApiResponse<UserItem[]>>([
        'get',
        '/api/users',
      ])

      // Snapshot my files to update share count
      const previousMyFiles = queryClient.getQueryData<
        BaseApiResponse<AttachmentItem[]>
      >(attachmentKeysFactory.myAttachments())

      // Optimistically update the cache with new shared users
      if (previousSharedUsers && allUsers?.data && currentUser) {
        const usersToShare = allUsers.data.filter((user) =>
          userIds.includes(user.id)
        )

        const newSharedUsers: SharedAttachmentUserItem[] = usersToShare.map(
          (user) => ({
            id: Date.now() + user.id, // Temporary ID for optimistic update
            attachmentId,
            fileName: undefined, // Will be filled by server
            filePath: undefined, // Will be filled by server
            fileSize: undefined, // Will be filled by server
            sharedBy: {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              roleName: currentUser.roleName,
              teamName: currentUser.teamName || '',
              unitName: currentUser.unitName || '',
              roleId: currentUser.roleId || 0,
              teamId: currentUser.teamId || 0,
              unitId: currentUser.unitId || 0,
              canCreateActivity: currentUser.canCreateActivity,
              permissions: currentUser.permissions,
            },
            sharedWith: {
              id: user.id,
              name: user.name,
              email: user.email,
              roleName: user.roleName,
              teamName: user.teamName || '',
              unitName: user.unitName || '',
              roleId: user.roleId || 0,
              teamId: user.teamId || 0,
              unitId: user.unitId || 0,
              canCreateActivity: user.canCreateActivity,
              permissions: user.permissions,
            },
            sharedAt: new Date().toISOString(),
            note: undefined,
            sharedCount: undefined,
            active: true,
          })
        )

        queryClient.setQueryData<BaseApiResponse<SharedAttachmentUserItem[]>>(
          attachmentKeysFactory.usersSharedWithAttachments(attachmentId),
          {
            ...previousSharedUsers,
            data: [...(previousSharedUsers.data || []), ...newSharedUsers],
          }
        )
      }

      // Optimistically update share count in myFiles
      if (previousMyFiles?.data) {
        const updatedMyFiles = previousMyFiles.data.map((file) => {
          if (file.id === attachmentId) {
            return {
              ...file,
              sharedCount: (file.sharedCount || 0) + userIds.length,
            }
          }
          return file
        })

        queryClient.setQueryData<BaseApiResponse<AttachmentItem[]>>(
          attachmentKeysFactory.myAttachments(),
          {
            ...previousMyFiles,
            data: updatedMyFiles,
          }
        )
      }

      return {
        attachmentId,
        userIds,
        previousSharedUsers,
        previousMyFiles,
      }
    },
    onError: (_error, _variables, context) => {
      const typedContext = context as OptimisticGrantContext | undefined
      if (!typedContext) return

      // Rollback to the previous state if mutation fails
      if (typedContext.previousSharedUsers) {
        queryClient.setQueryData(
          attachmentKeysFactory.usersSharedWithAttachments(
            typedContext.attachmentId
          ),
          typedContext.previousSharedUsers
        )
      }

      // Rollback myFiles share count
      if (typedContext.previousMyFiles) {
        queryClient.setQueryData(
          attachmentKeysFactory.myAttachments(),
          typedContext.previousMyFiles
        )
      }
    },
    onSettled: (_data, _error, variables, _context) => {
      const { attachmentId } = variables.body

      // Always refetch to ensure we have the latest server state with new shared users
      queryClient.invalidateQueries({
        queryKey:
          attachmentKeysFactory.usersSharedWithAttachments(attachmentId),
      })

      // Invalidate shared with me in case new users can now see shared files
      queryClient.invalidateQueries({
        queryKey: attachmentKeysFactory.sharedWithMe(),
      })

      // Invalidate myFiles to update the actual share count
      queryClient.invalidateQueries({
        queryKey: attachmentKeysFactory.myAttachments(),
      })
    },
  })
}
