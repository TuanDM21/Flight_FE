import { toast } from 'sonner'
import { useDialogs } from '@/hooks/use-dialogs'
import { AttachmentItem } from '../types'
import { useDeleteAttachments } from './use-delete-attachments'

export function useDeleteAttachmentsConfirm() {
  const dialogs = useDialogs()
  const deleteAttachmentsMutation = useDeleteAttachments()

  const onDeleteAttachments = async (attachments: AttachmentItem[]) => {
    const attachmentCount = attachments.length
    const isMultiple = attachmentCount > 1

    const confirmed = await dialogs.confirm(
      <div>
        <p>
          Bạn có chắc chắn muốn xóa{' '}
          {isMultiple
            ? `${attachmentCount} tệp đính kèm này`
            : 'tệp đính kèm này'}
          ?
        </p>
        <p className='text-muted-foreground mt-2 text-sm'>
          Hành động này không thể hoàn tác.
        </p>
      </div>,
      {
        title: isMultiple ? 'Xóa tệp đính kèm' : 'Xóa tệp đính kèm',
        okText: 'Xóa',
        cancelText: 'Hủy',
        severity: 'error',
      }
    )

    if (confirmed) {
      const attachmentIds = attachments
        .map((attachment) => attachment.id)
        .filter(Boolean) as number[]

      const deleteAttachmentsPromise = deleteAttachmentsMutation.mutateAsync({
        body: {
          attachmentIds,
        },
      })

      toast.promise(deleteAttachmentsPromise, {
        loading: `Đang xóa ${attachmentCount > 1 ? `${attachmentCount} tệp đính kèm` : 'tệp đính kèm'}...`,
        success: () => {
          return `${attachmentCount > 1 ? `${attachmentCount} tệp đính kèm` : 'Tệp đính kèm'} đã được xóa thành công!`
        },
        error: `Không thể xóa ${attachmentCount > 1 ? 'tệp đính kèm' : 'tệp đính kèm'}. Vui lòng thử lại.`,
      })
    }
  }

  return {
    onDeleteAttachments,
    isAttachmentsDeleting: deleteAttachmentsMutation.isPending,
  }
}
