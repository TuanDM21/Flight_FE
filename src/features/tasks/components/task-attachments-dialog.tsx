import { Suspense } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { IconTrash } from '@tabler/icons-react'
import { FileChartPie } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useDataTable } from '@/hooks/use-data-table'
import { DialogProps } from '@/hooks/use-dialogs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { useAttachmentTableColumns } from '@/features/attachments/hooks/use-attachment-table-columns'
import { getTaskAttachmentsQueryOptions } from '../hooks/use-task-attachments'
import { Task } from '../types'
import { TaskAttachmentUploader } from './task-attachments-uploader'

interface TaskAttachmentsDialogProps {
  task: Task
}

function TaskAttachmentsContent({ task }: { task: Task }) {
  const taskId = task.id!
  const { user } = useAuth()
  const isTaskOwner = user?.id === task.createdByUser?.id

  const { data: attachmentResponse } = useSuspenseQuery(
    getTaskAttachmentsQueryOptions(Number(taskId))
  )

  const attachments = attachmentResponse.data ?? []
  const attachmentsColumns = useAttachmentTableColumns()

  const { table } = useDataTable({
    data: attachments,
    columns: attachmentsColumns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: 'createdAt', desc: false }] as const,
      columnPinning: { right: ['actions'] },
    },
    shallow: false,
    clearOnDefault: true,
  })

  const selectedDocumentRows = table.getFilteredSelectedRowModel().rows
  const noDocuments = !attachments || attachments.length === 0

  const handleDeleteTaskDocuments = async () => {}

  if (noDocuments) {
    return (
      <div className='flex h-full flex-col items-center justify-center space-y-4 py-8'>
        <div className='bg-muted rounded-full p-4'>
          <FileChartPie className='text-muted-foreground h-8 w-8' />
        </div>
        <div className='space-y-2 text-center'>
          <h3 className='text-muted-foreground'>
            Chưa có tệp đính kèm nào được thêm cho nhiệm vụ này
          </h3>
          {isTaskOwner && <TaskAttachmentUploader taskId={taskId} />}
        </div>
      </div>
    )
  }

  return (
    <>
      {isTaskOwner && (
        <div className='mb-4 flex justify-end gap-2'>
          {selectedDocumentRows.length > 0 && (
            <Button
              variant='destructive'
              className='space-x-2'
              onClick={handleDeleteTaskDocuments}
            >
              <IconTrash className='h-4 w-4' />
              <span>Xóa ({selectedDocumentRows.length})</span>
            </Button>
          )}
          <TaskAttachmentUploader taskId={taskId} />
        </div>
      )}
      <DataTable table={table} />
    </>
  )
}

export function TaskAttachmentsDialog({
  payload,
  open,
  onClose,
}: DialogProps<TaskAttachmentsDialogProps>) {
  const { task } = payload
  const taskId = task.id!

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && void onClose()}>
      <DialogContent
        className='max-h-7xl flex flex-col sm:max-w-7xl'
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className='text-lg font-bold'>
            Tất cả tệp đính kèm cho Task #{taskId}
          </DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-hidden'>
          <Suspense
            fallback={
              <DataTableSkeleton columnCount={5} rowCount={5} withViewOptions />
            }
          >
            <TaskAttachmentsContent task={task} />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  )
}
