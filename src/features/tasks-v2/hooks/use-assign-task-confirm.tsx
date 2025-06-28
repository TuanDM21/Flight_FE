import { toast } from 'sonner'
import { useDialogs } from '@/hooks/use-dialogs'

interface User {
  id: number
  name: string
  email: string
}

interface UseAssignTaskConfirmProps {
  taskId: string
  onSuccess?: () => void
}

export const useAssignTaskConfirm = ({
  taskId,
  onSuccess,
}: UseAssignTaskConfirmProps) => {
  const dialogs = useDialogs()

  const onAssignTask = async (users: User[]) => {
    const isUnassigning = users.length === 0
    const userCount = users.length
    const isMultiple = userCount > 1

    const confirmed = await dialogs.confirm(
      <div className='space-y-2'>
        <p className='text-muted-foreground text-sm'>
          {isUnassigning
            ? `Bạn có chắc chắn muốn hủy tất cả phân công cho Nhiệm vụ ${taskId}?`
            : `Bạn có chắc chắn muốn phân công Nhiệm vụ ${taskId} cho ${
                isMultiple ? `${userCount} người` : users[0]?.name
              }?`}
        </p>
        {!isUnassigning && users.length > 0 && (
          <div className='space-y-1'>
            {users.slice(0, 3).map((user) => (
              <p key={user.id} className='text-muted-foreground text-xs'>
                • {user.name} ({user.email})
              </p>
            ))}
            {users.length > 3 && (
              <p className='text-muted-foreground text-xs'>
                ... và {users.length - 3} người khác
              </p>
            )}
          </div>
        )}
        <p className='text-muted-foreground text-sm font-medium'>
          {isUnassigning
            ? 'Nhiệm vụ sẽ không có người thực hiện.'
            : `${isMultiple ? 'Những người này' : 'Người này'} sẽ nhận được thông báo về việc phân công.`}
        </p>
      </div>,
      {
        title: isUnassigning
          ? 'Hủy phân công'
          : isMultiple
            ? 'Xác nhận phân công cho nhiều người'
            : 'Xác nhận phân công',
        severity: isUnassigning ? 'warning' : undefined,
        okText: isUnassigning ? 'Hủy phân công' : 'Phân công',
        cancelText: 'Hủy',
      }
    )

    if (confirmed) {
      // For now, just simulate the assignment - in real app you'd call an API
      const assignPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve(true)
        }, 1000)
      })

      toast.promise(assignPromise, {
        loading: isUnassigning
          ? 'Đang hủy phân công...'
          : `Đang phân công nhiệm vụ cho ${userCount} người...`,
        success: () => {
          onSuccess?.()
          return isUnassigning
            ? 'Đã hủy phân công thành công!'
            : `Đã phân công thành công cho ${isMultiple ? `${userCount} người` : users[0]?.name}!`
        },
        error: isUnassigning
          ? 'Lỗi khi hủy phân công'
          : 'Lỗi khi phân công nhiệm vụ',
      })

      await assignPromise
    }
  }

  return {
    onAssignTask,
  }
}
