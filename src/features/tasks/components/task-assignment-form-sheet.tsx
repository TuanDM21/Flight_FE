import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { DialogProps } from '@/hooks/use-dialogs'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCreateTaskAssignmentsMutation } from '../hooks/use-create-task-assignments'
import { createTaskAssignmentsSchema } from '../schema'
import { TaskAssignmentsField } from './task-assignments-field'

type TaskSheetFormValues = z.infer<typeof createTaskAssignmentsSchema>

interface TaskAssignmentFormSheetPayload {
  taskId: number
}

export const TaskAssignmentFormSheet = ({
  payload,
  open,
  onClose,
}: DialogProps<TaskAssignmentFormSheetPayload>) => {
  const { taskId } = payload
  const taskAssignmentsMutation = useCreateTaskAssignmentsMutation()

  const form = useForm<TaskSheetFormValues>({
    resolver: zodResolver(createTaskAssignmentsSchema),
    defaultValues: {
      assignments: [],
    },
  })

  const handleSubmit = async (data: TaskSheetFormValues) => {
    const promise = taskAssignmentsMutation.mutateAsync({
      body: {
        assignments: data.assignments,
        taskId: taskId,
      },
    })

    toast.promise(promise, {
      loading: 'Đang tạo phân công...',
      success: () => {
        onClose()
        form.reset()
        return `Tạo phân công công việc thành công!`
      },
      error: `Không thể tạo phân công công việc. Vui lòng thử lại.`,
    })
  }

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className='flex h-full w-full flex-col sm:max-w-3xl'>
        <SheetHeader className='flex-shrink-0 border-b'>
          <SheetTitle>Tạo phân công công việc</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='flex min-h-0 flex-1 flex-col'
          >
            <div className='min-h-0 flex-1 overflow-y-auto px-4 pb-2'>
              <TaskAssignmentsField form={form} name='assignments' />
            </div>
            <div className='flex-shrink-0 border-t p-4'>
              <Button type='submit' size='lg' className='w-full'>
                Lưu phân công
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
