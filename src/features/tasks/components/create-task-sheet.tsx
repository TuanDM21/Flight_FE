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
import { useCreateTask } from '../hooks/use-create-task'
import { useCreateTaskForm } from '../hooks/use-create-task-form'
import { CreateTaskFormOutput } from '../types'
import { CreateTaskForm } from './create-task-form'

interface CreateTaskSheetPayload {}

export const CreateTaskSheet: React.FC<DialogProps<CreateTaskSheetPayload>> = ({
  open,
  onClose,
}) => {
  const createTaskMutation = useCreateTask()
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
      const createTaskPromise = createTaskMutation.mutateAsync({
        body: rest,
      })

      toast.promise(createTaskPromise, {
        loading: `Đang tạo công việc...`,
        success: () => {
          form.reset()
          return `Tạo công việc thành công!`
        },
        error: `Không thể tạo công việc. Vui lòng thử lại.`,
        finally: () => {
          onClose()
        },
      })
    },
    [createTaskMutation, onClose, form.reset]
  )

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent
        className='flex size-full flex-col sm:max-w-3xl'
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          event.preventDefault()
        }}
      >
        <SheetHeader className='shadow-sm backdrop-blur-sm'>
          <SheetTitle>Tạo công việc</SheetTitle>
          <SheetDescription>
            Tạo công việc mới và giao cho các thành viên trong nhóm
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className='min-h-0 flex-1'>
          <div className='flex flex-col gap-4 px-4'>
            <CreateTaskForm
              form={form}
              formId='create-tasks-form'
              onSubmit={onSubmit}
            />
          </div>
        </ScrollArea>

        <SheetFooter className='flex-row justify-end shadow-sm backdrop-blur-sm'>
          <SheetClose asChild>
            <Button variant='outline' size='lg'>
              <ChevronLeftIcon />
              Hủy
            </Button>
          </SheetClose>
          <Button form='create-tasks-form' type='submit' size='lg'>
            Tạo công việc
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
