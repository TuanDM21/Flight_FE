import { toast } from 'sonner'
import { useDialogs } from '@/hooks/use-dialogs'
import type { Task } from '../components/types'

interface UseUpdateTaskPriorityConfirmOptions {
  taskId: number
  onSuccess?: () => void
}

type Priority = Task['priority']

export function useUpdateTaskPriorityConfirm({
  taskId: _taskId,
  onSuccess,
}: UseUpdateTaskPriorityConfirmOptions) {
  const dialogs = useDialogs()

  const onUpdatePriority = async (priority: Priority | null) => {
    const priorityText = priority
      ? priority === 'HIGH'
        ? 'Cao'
        : priority === 'MEDIUM'
          ? 'Trung bình'
          : 'Thấp'
      : null

    const message = priority
      ? `Bạn có chắc chắn muốn đặt độ ưu tiên của task này thành "${priorityText}"?`
      : 'Bạn có chắc chắn muốn xóa độ ưu tiên của task này?'

    const isConfirmed = await dialogs.confirm(
      <div className='space-y-2'>
        <p className='text-muted-foreground text-sm'>{message}</p>
      </div>,
      {
        title: priority ? 'Cập nhật độ ưu tiên' : 'Xóa độ ưu tiên',
        okText: priority ? 'Cập nhật' : 'Xóa',
        cancelText: 'Hủy',
      }
    )

    if (isConfirmed) {
      // TODO: Call API to update task priority
      // await updateTaskPriorityMutation.mutateAsync({ taskId, priority })

      toast.success(
        priority
          ? `Đã cập nhật độ ưu tiên thành "${priorityText}"`
          : 'Đã xóa độ ưu tiên'
      )

      onSuccess?.()
    }
  }

  return {
    onUpdatePriority,
  }
}
