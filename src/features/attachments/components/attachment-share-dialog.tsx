import React, {
  Suspense,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronDown, Users } from 'lucide-react'
import { matchSorter } from 'match-sorter'
import { toast } from 'sonner'
import { DialogProps } from '@/hooks/use-dialogs'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxBadgeItem,
  ComboboxBadgeList,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useSuspenseUsers } from '@/features/users/hooks/use-users'
import { UserItem } from '@/features/users/types'
import { useGrantAttachmentAccess } from '../hooks/use-grant-attachment-access'
import { useSuspenseUsersSharedWithFile } from '../hooks/use-user-shared-with-attachments'
import { AttachmentItem } from '../types'
import { UserAccessAttachmentList } from './user-access-attachment-list'

interface AttachmentShareDialogPayload {
  attachment: AttachmentItem
}

// Loading component for Suspense fallback
function AttachmentShareDialogSkeleton() {
  return (
    <div className='flex flex-1 flex-col gap-2 overflow-hidden px-2'>
      {/* Add people section skeleton */}
      <div className='space-y-2'>
        <div className='bg-muted h-4 w-20 animate-pulse rounded' />
        <div className='bg-muted h-20 animate-pulse rounded-lg' />

        {/* Info section skeleton */}
        <div className='flex items-center gap-2 border-b-1 border-gray-200 py-2'>
          <div className='bg-muted h-8 w-8 animate-pulse rounded-full' />
          <div className='bg-muted h-3 w-48 animate-pulse rounded' />
        </div>
      </div>

      {/* People with access section skeleton */}
      <div className='flex-1 space-y-3 overflow-hidden'>
        <div className='bg-muted h-4 w-32 animate-pulse rounded' />
        <div className='space-y-2'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='flex items-center justify-between py-2'>
              <div className='flex items-center gap-3'>
                <div className='bg-muted h-8 w-8 animate-pulse rounded-full' />
                <div className='space-y-1'>
                  <div className='bg-muted h-4 w-24 animate-pulse rounded' />
                  <div className='bg-muted h-3 w-32 animate-pulse rounded' />
                </div>
              </div>
              <div className='bg-muted h-6 w-6 animate-pulse rounded' />
            </div>
          ))}
        </div>
      </div>

      {/* Button skeleton */}
      <div className='flex items-center justify-end space-x-2 border-t pt-4'>
        <div className='bg-muted h-10 w-16 animate-pulse rounded' />
        <div className='bg-muted h-10 w-16 animate-pulse rounded' />
      </div>
    </div>
  )
}

export function AttachmentShareDialog({
  payload,
  open,
  onClose,
}: DialogProps<AttachmentShareDialogPayload>) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className='flex h-[80vh] max-h-[800px] flex-col sm:max-w-2xl'>
        <DialogHeader className='flex flex-row items-center justify-between pb-2'>
          <DialogTitle className='flex items-center gap-2'>
            Chia sẻ {payload.attachment.fileName || 'Tệp đính kèm'}
          </DialogTitle>
        </DialogHeader>

        <Suspense fallback={<AttachmentShareDialogSkeleton />}>
          <AttachmentShareDialogContent payload={payload} onClose={onClose} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}

// Separate component that uses Suspense queries
function AttachmentShareDialogContent({
  payload,
  onClose,
}: {
  payload: AttachmentShareDialogPayload
  onClose: () => void
}) {
  const { attachment } = payload
  const { data: listUser } = useSuspenseUsers()
  const { data: sharedUsers } = useSuspenseUsersSharedWithFile(attachment.id!)
  const grantAttachmentAccess = useGrantAttachmentAccess()

  const [selectedUsers, setSelectedUsers] = useState<UserItem[]>([])
  const [content, setContent] =
    React.useState<React.ComponentRef<'div'> | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const deferredInputValue = useDeferredValue(inputValue)

  const availableUsers = (listUser?.data ?? []).filter((user) => {
    const alreadyShared = sharedUsers?.data?.some(
      (sharedUser) => sharedUser.sharedWith?.id === user.id
    )
    return !alreadyShared
  })

  const filteredUsers = useMemo(() => {
    if (!deferredInputValue) return availableUsers
    return matchSorter(availableUsers, deferredInputValue, {
      keys: ['name', 'email'],
      threshold: matchSorter.rankings.MATCHES,
    })
  }, [deferredInputValue, availableUsers])

  const virtualizer = useVirtualizer({
    count: filteredUsers.length,
    getScrollElement: () => content,
    estimateSize: () => 48,
    overscan: 20,
  })

  const onInputValueChange = useCallback(
    (value: string) => {
      setInputValue(value)
      if (content) {
        content.scrollTop = 0
        virtualizer.measure()
      }
    },
    [content, virtualizer]
  )

  // Re-measure virtualizer when filteredItems changes
  React.useEffect(() => {
    if (content) {
      virtualizer.measure()
    }
  }, [content, virtualizer])

  const handleSave = async () => {
    const userIds = selectedUsers.map((user) => user.id)

    const promise = grantAttachmentAccess.mutateAsync({
      body: {
        attachmentId: attachment.id!,
        userIds: userIds,
      },
    })
    toast.promise(promise, {
      loading: 'Đang chia sẻ tệp đính kèm...',
      success: () => {
        setSelectedUsers([])
        setInputValue('')
        onClose()
        return 'Chia sẻ tệp đính kèm thành công!'
      },
      error: 'Không thể chia sẻ tệp đính kèm.',
    })
  }

  return (
    <>
      <div className='flex flex-1 flex-col gap-2 overflow-hidden px-2'>
        <div>
          <Combobox
            value={selectedUsers.map((user) => user.email)}
            onValueChange={(emails: string[]) => {
              const users = emails.map((email) =>
                availableUsers.find((u) => u.email === email)
              ) as UserItem[]
              setSelectedUsers(users)
            }}
            inputValue={inputValue}
            onInputValueChange={onInputValueChange}
            open={isOpen}
            onOpenChange={setIsOpen}
            manualFiltering
            className='w-full'
            multiple
            autoHighlight
          >
            <ComboboxLabel>Thêm người</ComboboxLabel>
            <ComboboxAnchor className='h-full flex-wrap px-3 py-2'>
              <ComboboxBadgeList className='max-h-20 overflow-y-auto'>
                {selectedUsers.map((user) => {
                  const foundUser = availableUsers.find(
                    (u) => u.email === user.email
                  )
                  if (!foundUser) return null

                  return (
                    <ComboboxBadgeItem key={user.id} value={user.email}>
                      {user.email}
                    </ComboboxBadgeItem>
                  )
                })}
              </ComboboxBadgeList>
              <ComboboxInput
                autoFocus
                placeholder='Thêm người để chia sẻ...'
                className='h-auto min-w-20 flex-1'
                onFocus={() => {
                  setIsOpen(true)
                }}
                onBlur={() => {
                  setIsOpen(false)
                }}
              />
              <ComboboxTrigger className='absolute top-3 right-2'>
                <ChevronDown className='h-4 w-4' />
              </ComboboxTrigger>
            </ComboboxAnchor>
            <div className='flex items-center gap-2 border-b-1 border-gray-200 py-2 text-sm'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100'>
                <Users className='text-muted-foreground h-4 w-4' />
              </div>
              <p className='text-muted-foreground text-xs'>
                Chỉ những người có quyền truy cập mới có thể mở bằng liên kết
              </p>
            </div>
            <ComboboxContent
              portal={false}
              onPointerDownOutside={(e) => {
                e.preventDefault()
              }}
              onEscapeKeyDown={(event) => {
                event.preventDefault()
              }}
              ref={setContent}
              className='bg-popover text-popover-foreground max-h-[300px] overflow-y-auto border shadow-md'
            >
              <ComboboxEmpty>Không tìm thấy người dùng.</ComboboxEmpty>
              <div
                className='relative w-full'
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const user = filteredUsers[virtualItem.index]
                  if (!user) return null

                  return (
                    <ComboboxItem
                      key={user.email}
                      value={user.email}
                      className='absolute top-0 left-0 w-full'
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      outset
                    >
                      <div className='flex flex-col'>
                        <span>{user.name}</span>
                        <span className='text-muted-foreground text-xs'>
                          {user.email}
                        </span>
                      </div>
                    </ComboboxItem>
                  )
                })}
              </div>
            </ComboboxContent>
          </Combobox>
        </div>
        <div className='flex-1 overflow-hidden'>
          <div className='flex h-full flex-col space-y-3'>
            <Label className='text-sm font-medium'>
              Những người có quyền truy cập
            </Label>
            <UserAccessAttachmentList attachment={attachment} />
          </div>
        </div>
      </div>
      <div className='flex items-center justify-end space-x-2 border-t pt-4'>
        <Button
          variant='outline'
          onClick={() => {
            onClose()
          }}
        >
          Đóng
        </Button>
        <Button
          onClick={handleSave}
          disabled={
            selectedUsers.length === 0 || grantAttachmentAccess.isPending
          }
        >
          {grantAttachmentAccess.isPending
            ? 'Đang chia sẻ...'
            : 'Chia sẻ tệp đính kèm'}
        </Button>
      </div>
    </>
  )
}
