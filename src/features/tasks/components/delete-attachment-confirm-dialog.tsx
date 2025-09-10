import { Trash, TriangleAlertIcon } from 'lucide-react'
import { toast } from 'sonner'
import { DialogProps } from '@/hooks/use-dialogs'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteTaskAttachment } from '../hooks/use-delete-task-attachment'
import { TaskAttachment, TaskFilterTypes } from '../types'

export interface DeleteAttachmentPayload {
  taskId: number
  filterType: TaskFilterTypes
  attachment: TaskAttachment
  onSuccess?: () => void
}

export function DeleteAttachmentConfirmDialog({
  open,
  payload,
  onClose,
}: DialogProps<DeleteAttachmentPayload, boolean>) {
  const { attachment, taskId, filterType } = payload
  const { fileName, id } = attachment ?? {}
  const deleteTaskAttachmentMutation = useDeleteTaskAttachment(filterType)

  const handleConfirm = async () => {
    const removePromise = deleteTaskAttachmentMutation.mutateAsync({
      params: { path: { id: taskId } },
      body: {
        attachmentIds: [id!],
      },
    })
    toast.promise(removePromise, {
      loading: `Đang xóa tệp đính kèm "${fileName}"...`,
      success: () => {
        payload.onSuccess?.()
        return `Tệp đính kèm "${fileName}" đã được xóa thành công!`
      },
      error: (error) => {
        return error.message || `Không thể xóa tệp đính kèm "${fileName}"`
      },
    })
  }

  const handleCancel = async () => {
    await onClose(false)
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleCancel()}
    >
      <AlertDialogContent className='top-0 mt-6 translate-y-0 p-4'>
        <AlertDialogHeader className='items-center text-center'>
          <div className='mb-2 flex size-12 items-center justify-center rounded-full'>
            <TriangleAlertIcon className='text-destructive h-6 w-6' />
          </div>
          <AlertDialogTitle className='text-lg font-semibold'>
            Bạn có chắc chắn muốn xóa tệp đính kèm này?
          </AlertDialogTitle>
          <AlertDialogDescription className='text-muted-foreground text-sm'>
            Hành động này sẽ xóa tệp khỏi công việc và không thể khôi phục.
          </AlertDialogDescription>

          {fileName && (
            <Alert className='bg-muted/40 mt-4 flex w-full flex-col items-start rounded-lg border-none px-4 py-3 text-xs'>
              <AlertTitle className='text-muted-foreground mb-1 font-semibold uppercase'>
                Tên tệp
              </AlertTitle>
              <AlertDescription className='text-foreground truncate font-medium'>
                {fileName}
              </AlertDescription>
            </Alert>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={deleteTaskAttachmentMutation.isPending}
          >
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteTaskAttachmentMutation.isPending}
            className='bg-destructive dark:bg-destructive/60 hover:bg-destructive focus-visible:ring-destructive'
          >
            <Trash className='h-4 w-4' />
            {deleteTaskAttachmentMutation.isPending ? 'Đang xóa...' : 'Xóa tệp'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
