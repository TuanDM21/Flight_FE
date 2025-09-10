import { FileUpIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AttachmentItem } from '@/features/attachments/types'
import { TaskFilterTypes } from '../types'
import { TaskAttachmentsFileList } from './task-attachments-file-list'
import { TaskAttachmentsUploader } from './task-attachments-uploader'

interface TaskAttachmentsDisplayProps {
  attachments: AttachmentItem[]
  taskId: number
  filterType: TaskFilterTypes
  level?: number
  allowCellEditing: boolean
}

export function TaskAttachmentsDisplay({
  attachments,
  taskId,
  filterType,
  level = 0,
  allowCellEditing,
}: TaskAttachmentsDisplayProps) {
  const count = attachments.length
  const isDisabled = !allowCellEditing || level > 0 || filterType === 'received'

  return (
    <div className='group flex items-center gap-2'>
      {!isDisabled && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('transition-all duration-200 ease-out')}>
              <TaskAttachmentsUploader taskId={taskId} filterType={filterType}>
                <Button
                  size='icon'
                  variant='outline'
                  className='hover:border-primary hover:bg-primary/5 size-8 rounded-full border-2 border-dashed transition-all duration-200 hover:border-solid'
                >
                  <FileUpIcon className='size-4' />
                  <span className='sr-only'>Thêm tệp đính kèm</span>
                </Button>
              </TaskAttachmentsUploader>
            </div>
          </TooltipTrigger>
          <TooltipContent className='px-2 py-1 text-xs'>
            Thêm tệp đính kèm
          </TooltipContent>
        </Tooltip>
      )}

      {count > 0 && (
        <div className='flex items-center -space-x-2'>
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className='ring-background hover:ring-primary/20 cursor-pointer ring-2 transition-all duration-200 ease-out hover:shadow-lg'>
                <AvatarFallback className='bg-muted text-xs font-medium'>
                  +{count}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>

            <PopoverContent className='w-80 p-2 pr-0'>
              <TaskAttachmentsFileList
                attachments={attachments}
                taskId={taskId}
                filterType={filterType}
                isDisabled={isDisabled}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}
