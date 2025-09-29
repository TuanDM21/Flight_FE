import React, { useCallback, useRef } from 'react'
import { ChevronLeftIcon } from 'lucide-react'
import { toast } from 'sonner'
import { DialogProps } from '@/hooks/use-dialogs'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCreateSubtask } from '../hooks/use-create-subtask'
import { useCreateTaskForm } from '../hooks/use-create-task-form'
import { CreateTaskFormOutput } from '../types'
import { CreateTaskForm } from './create-task-form'

interface CreateSubTaskSheetPayload {
  parentTaskId: number
}

export const CreateSubTaskSheet: React.FC<
  DialogProps<CreateSubTaskSheetPayload>
> = ({ payload, open, onClose }) => {
  const { parentTaskId } = payload
  const createSubtaskMutation = useCreateSubtask()
  const abortControllerRef = useRef<AbortController | null>(null)

  const onReset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const { form } = useCreateTaskForm({
    open,
    onReset,
  })

  const onSubmit = useCallback(
    async ({ files, ...rest }: CreateTaskFormOutput) => {
      try {
        const createTaskPromise = createSubtaskMutation.mutateAsync({
          body: rest,
          params: {
            path: {
              parentId: parentTaskId,
            },
          },
        })

        toast.promise(createTaskPromise, {
          loading: `Đang tạo công việc con...`,
          success: () => {
            onClose()
            return `Tạo công việc con thành công!`
          },
          error: `Không thể tạo công việc con. Vui lòng thử lại.`,
          finally: () => {
            form.reset()
          },
        })
      } catch {
        toast.error('Có lỗi xảy ra khi tạo công việc con')
      }
    },
    [createSubtaskMutation, onClose, form.reset, parentTaskId]
  )

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent
        className='flex flex-col sm:max-w-3xl'
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          event.preventDefault()
        }}
      >
        <SheetHeader className='shadow-sm backdrop-blur-sm'>
          <SheetTitle>Tạo công việc con</SheetTitle>
          <SheetDescription>
            Tạo công việc con cho công việc #{parentTaskId}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className='min-h-0 flex-1 overflow-auto'>
          <div className='flex flex-col gap-4 p-4'>
            <CreateTaskForm
              form={form}
              formId='create-sub-tasks-form'
              onSubmit={onSubmit}
            />
          </div>
        </ScrollArea>

        <SheetFooter className='flex-row justify-end shadow-sm backdrop-blur-sm'>
          <SheetClose asChild>
            <Button variant='outline' size='lg' onClick={() => onClose()}>
              <ChevronLeftIcon />
              Hủy
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button form='create-sub-tasks-form' type='submit' size='lg'>
              Tạo công việc con
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
