import { useCallback, useState } from 'react'
import { IconEyeX } from '@tabler/icons-react'
import { UserX } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UserItem } from '@/features/users/types'
import { useRevokeAttachmentAccessConfirm } from '../hooks/use-revoke-attachment-access-confirm'
import { useSuspenseUsersSharedWithFile } from '../hooks/use-user-shared-with-attachments'
import { AttachmentItem } from '../types'

interface UserAccessAttachmentListProps {
  attachment: AttachmentItem
}

export function UserAccessAttachmentList({
  attachment,
}: UserAccessAttachmentListProps) {
  const { data: sharedUsers } = useSuspenseUsersSharedWithFile(attachment.id!)
  const { onRevokeAccessConfirm, revokeUserAccess } =
    useRevokeAttachmentAccessConfirm()

  const { user: loggedInUser } = useAuth()

  const sharedUserList = sharedUsers?.data ?? []

  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set())

  const handleRemoveShare = useCallback(
    async (user: UserItem) => {
      onRevokeAccessConfirm({
        attachmentId: attachment.id!,
        users: [user],
        fileName: attachment.fileName,
      })
    },
    [onRevokeAccessConfirm, attachment.id, attachment.fileName]
  )

  const handleRemoveSelected = useCallback(async () => {
    const usersToRemove = sharedUserList
      .filter((user) => user.id && selectedUsers.has(user.id))
      .map((user) => user.sharedWith!)

    if (usersToRemove.length > 0) {
      const hasAccessRevoked = await onRevokeAccessConfirm({
        attachmentId: attachment.id!,
        users: usersToRemove,
        fileName: attachment.fileName,
      })
      if (hasAccessRevoked) {
        setSelectedUsers(new Set())
      }
    }
  }, [
    onRevokeAccessConfirm,
    attachment.id,
    attachment.fileName,
    selectedUsers,
    sharedUserList,
  ])

  const handleSelectUser = useCallback((userId: number, checked: boolean) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(userId)
      } else {
        newSet.delete(userId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedUsers(
          new Set(
            sharedUserList
              .map((user) => user.id)
              .filter((id) => id !== undefined)
          )
        )
      } else {
        setSelectedUsers(new Set())
      }
    },
    [sharedUserList]
  )

  const getInitialCharacter = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'N/A'
  }

  const isAllSelected =
    selectedUsers.size === sharedUserList.length && sharedUserList.length > 0
  const isIndeterminate =
    selectedUsers.size > 0 && selectedUsers.size < sharedUserList.length
  const hasSelection = selectedUsers.size > 0

  if (sharedUserList.length === 0) {
    return (
      <div className='flex h-full flex-col items-center justify-center px-4 py-8 text-center'>
        <div className='bg-muted/50 mb-3 flex h-12 w-12 items-center justify-center rounded-full'>
          <UserX className='text-muted-foreground h-6 w-6' />
        </div>
        <h3 className='text-foreground mb-1 text-sm font-medium'>
          Chưa có quyền truy cập được chia sẻ
        </h3>
        <p className='text-muted-foreground max-w-sm text-xs'>
          Thêm người ở trên để cấp cho họ quyền truy cập vào tệp này. Họ sẽ có
          thể xem và tải xuống tệp.
        </p>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col'>
      {/* Header with select all and bulk actions */}
      <div className='flex items-center justify-between border-b px-4 py-2'>
        <div className='flex items-center gap-2'>
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
            {...(isIndeterminate && { 'data-state': 'indeterminate' })}
            aria-label='Chọn tất cả người dùng'
          />
          <span className='text-muted-foreground text-sm'>
            {hasSelection ? `${selectedUsers.size} đã chọn` : 'Chọn tất cả'}
          </span>
        </div>

        {hasSelection && (
          <Button
            variant='destructive'
            size='sm'
            onClick={handleRemoveSelected}
            disabled={revokeUserAccess.isPending}
            className='flex items-center gap-1'
          >
            <IconEyeX className='h-3 w-3' />
            Thu hồi ({selectedUsers.size})
          </Button>
        )}
      </div>

      {/* User list */}
      <div className='flex-1 space-y-2 overflow-y-auto px-4 py-2'>
        {sharedUserList.map((user) => (
          <div key={user.id} className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Checkbox
                checked={user.id ? selectedUsers.has(user.id) : false}
                onCheckedChange={(checked) =>
                  user.id && handleSelectUser(user.id, !!checked)
                }
                aria-label={`Chọn ${user.sharedWith?.name}`}
              />
              <Avatar className='h-8 w-8 bg-gray-100 text-gray-600'>
                <AvatarFallback>
                  {getInitialCharacter(user.sharedWith?.name!)}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <div className='truncate text-sm font-medium'>
                  {user.sharedWith?.name}
                </div>
                <div className='text-muted-foreground truncate text-xs'>
                  {user.sharedWith?.email}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {user.sharedBy?.id === loggedInUser?.id && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6'
                      onClick={() => handleRemoveShare(user.sharedWith!)}
                      disabled={revokeUserAccess.isPending}
                    >
                      <IconEyeX className='text-destructive h-3 w-3' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Thu hồi quyền truy cập</span>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
