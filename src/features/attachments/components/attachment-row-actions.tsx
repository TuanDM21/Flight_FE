import { MoreHorizontalIcon, EyeIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeleteAttachmentsConfirm } from '../hooks/use-delete-attachments-confirm'
import { AttachmentItem } from '../types'

interface AttachmentRowActionsProps {
  attachment: AttachmentItem
}

export function AttachmentRowActions({
  attachment,
}: AttachmentRowActionsProps) {
  const { onDeleteAttachments, isAttachmentsDeleting } =
    useDeleteAttachmentsConfirm()

  const handleDelete = async () => {
    await onDeleteAttachments([attachment])
  }

  const handlePreview = () => {
    window.open(attachment.filePath, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Mở menu</span>
            <MoreHorizontalIcon className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={handlePreview}>
            <EyeIcon className='mr-2 h-4 w-4' />
            Xem trước
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={void handleDelete}
            disabled={isAttachmentsDeleting}
          >
            <TrashIcon className='mr-2 h-4 w-4' />
            {isAttachmentsDeleting ? 'Đang xóa...' : 'Xóa'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
