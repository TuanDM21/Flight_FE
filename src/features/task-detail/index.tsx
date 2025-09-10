import React from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { TaskDetailRoute } from '@/routes/_authenticated/tasks/$task-id'
import { downloadFileFromUrl } from '@/utils/file'
import { useAuth } from '@/context/auth-context'
import { useFileIconType } from '@/hooks/use-file-icon-type'
import { Card, CardContent } from '@/components/ui/card'
import { TaskAssignmentsCard } from '@/features/task-detail/components/task-assignments-card'
import { TaskAttachmentsCard } from '@/features/task-detail/components/task-attachments-card'
import { TaskDetailHeader } from '@/features/task-detail/components/task-detail-header'
import { TaskInformationCard } from '@/features/task-detail/components/task-information-card'
import { TaskAttachment } from '../tasks/types'
import { getTaskDetailQueryOptions } from './hooks/use-task-detail'

export default function TaskDetailPage() {
  const taskId = TaskDetailRoute.useParams()['task-id']
  const { user } = useAuth()

  const { data: taskDetail } = useSuspenseQuery(
    getTaskDetailQueryOptions(Number(taskId))
  )
  const task = taskDetail?.data

  const isTaskOwner = user?.id === task?.createdByUser?.id

  const { getFileIcon } = useFileIconType()

  const handleDownloadAttachment = React.useCallback(
    async (attachment: TaskAttachment) => {
      if (!attachment.id) {
        return
      }

      try {
        // Lấy download URL từ API
        const response = await fetch(
          `/api/attachments/download-url/${attachment.id}`
        )
        if (!response.ok) throw new Error('Failed to get download URL')

        const data = await response.json()
        const downloadUrl = data.data?.downloadUrl

        if (downloadUrl) {
          await downloadFileFromUrl({
            url: downloadUrl,
            filename: attachment.fileName || 'download',
          })
        } else {
          // Fallback: sử dụng filePath
          if (attachment.filePath) {
            await downloadFileFromUrl({
              url: attachment.filePath,
              filename: attachment.fileName || 'download',
            })
          }
        }
      } catch (error) {
        if (attachment.filePath) {
          window.open(attachment.filePath, '_blank')
        }
      }
    },
    []
  )

  const handleViewAttachment = React.useCallback(
    (attachment: TaskAttachment) => {
      if (attachment.filePath) {
        window.open(attachment.filePath, '_blank')
      }
    },
    []
  )

  if (!task) {
    return (
      <div className='pb-4'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground text-center'>
              Không tìm thấy công việc
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='pb-4'>
      <TaskDetailHeader task={task} />

      <div className='grid gap-6'>
        <TaskInformationCard task={task} />

        <TaskAssignmentsCard
          assignments={task.assignments || []}
          isTaskOwner={isTaskOwner}
        />
        <TaskAttachmentsCard
          attachments={task.attachments || []}
          onDownloadAttachment={handleDownloadAttachment}
          onViewAttachment={handleViewAttachment}
          getFileIcon={getFileIcon}
        />
      </div>
    </div>
  )
}
