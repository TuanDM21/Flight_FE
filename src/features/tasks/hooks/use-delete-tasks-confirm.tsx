import { toast } from 'sonner'
import { useDialogs } from '@/hooks/use-dialogs'
import { Task, TaskFilterTypes } from '../types'
import { useDeleteTasks } from './use-delete-tasks'

export const useDeleteTasksConfirm = (filterType: TaskFilterTypes) => {
  const dialogs = useDialogs()
  const deleteTasksMutation = useDeleteTasks(filterType)

  const onDeleteTasks = async (tasks: Task[]) => {
    if (tasks.length === 0) return

    const taskIds = tasks.map((task) => task.id!).filter(Boolean)
    const taskCount = taskIds.length

    const confirmed = await dialogs.confirm(
      <div className='space-y-3'>
        <p className='text-muted-foreground text-sm'>
          Bạn có chắc chắn muốn xóa {taskCount} công việc được chọn?
        </p>
        <div className='bg-destructive/10 rounded-md p-3'>
          <p className='text-destructive mb-2 text-sm font-medium'>
            Việc xóa sẽ bao gồm tất cả dữ liệu liên quan:
          </p>
          <ul className='text-destructive ml-4 list-disc space-y-1 text-sm'>
            <li>Tất cả phân công và bình luận</li>
            <li>Tất cả tài liệu đính kèm</li>
            <li>Lịch sử và tiến độ công việc</li>
          </ul>
        </div>
        <div className='text-muted-foreground text-sm'>
          <p className='mb-2 font-medium'>Danh sách công việc sẽ bị xóa:</p>
          <div className='bg-muted/50 max-h-32 overflow-y-auto rounded border p-2 text-xs'>
            {tasks.slice(0, 10).map((task) => (
              <div key={task.id} className='py-1'>
                <span className='text-muted-foreground font-mono'>
                  #{task.id}
                </span>{' '}
                - {task.content}
              </div>
            ))}
            {tasks.length > 10 && (
              <div className='text-muted-foreground py-1 italic'>
                ...và {tasks.length - 10} công việc khác
              </div>
            )}
          </div>
        </div>
        <p className='text-destructive text-sm font-medium'>
          Hành động này không thể hoàn tác!
        </p>
      </div>,
      {
        title: `Xóa ${taskCount} công việc`,
        severity: 'error',
        okText: 'Xóa tất cả',
        cancelText: 'Hủy bỏ',
      }
    )

    if (confirmed) {
      const deleteTasksPromise = deleteTasksMutation.mutateAsync({
        body: {
          taskIds,
        },
      })

      toast.promise(deleteTasksPromise, {
        loading: `Đang xóa ${taskCount} công việc...`,
        success: () => {
          return `Đã xóa thành công ${taskCount} công việc.`
        },
        error: (error) =>
          error.message ?? `Không thể xóa các công việc. Vui lòng thử lại.`,
      })
    }
  }

  return {
    onDeleteTasks,
    isDeleting: deleteTasksMutation.isPending,
  }
}
