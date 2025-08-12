import { toast } from 'sonner'
import { useDialogs } from '@/hooks/use-dialogs'

interface UseUpdateTaskDueDateConfirmOptions {
  taskId: string
  onSuccess?: () => void
}

export function useUpdateTaskDueDateConfirm({
  taskId: _taskId,
  onSuccess,
}: UseUpdateTaskDueDateConfirmOptions) {
  const dialogs = useDialogs()

  const onUpdateDueDate = async (dueDate: string | null) => {
    const message = dueDate
      ? `Bạn có chắc chắn muốn đặt ngày hạn của task này thành "${dueDate}"?`
      : 'Bạn có chắc chắn muốn xóa ngày hạn của task này?'

    const isConfirmed = await dialogs.confirm(
      <div className='space-y-2'>
        <p className='text-muted-foreground text-sm'>{message}</p>
      </div>,
      {
        title: dueDate ? 'Cập nhật ngày hạn' : 'Xóa ngày hạn',
        okText: dueDate ? 'Cập nhật' : 'Xóa',
        cancelText: 'Hủy',
      }
    )

    if (isConfirmed) {
      // TODO: Call API to update task due date
      // await updateTaskDueDateMutation.mutateAsync({ taskId, dueDate })

      toast.success(
        dueDate ? `Đã cập nhật ngày hạn thành "${dueDate}"` : 'Đã xóa ngày hạn'
      )

      onSuccess?.()
    }
  }

  return {
    onUpdateDueDate,
  }
}
