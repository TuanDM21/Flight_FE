import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { EditTaskRoute } from '@/routes/_authenticated/tasks/$task-id/edit'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { createTaskSchema } from '@/features/tasks/schema'
import { getTaskDetailQueryOptions } from '../task-detail/hooks/use-task-detail'
import { useUpdateTask } from './hooks/use-update-task'

export default function EditTaskPage() {
  const taskId = EditTaskRoute.useParams()['task-id']
  const searchParams = EditTaskRoute.useSearch()
  const navigate = EditTaskRoute.useNavigate()
  const currentType = searchParams.type || 'assigned'

  const { data: taskDetailsQuery } = useSuspenseQuery(
    getTaskDetailQueryOptions(Number(taskId))
  )
  const updateTaskMutation = useUpdateTask(currentType)

  const taskData = taskDetailsQuery?.data || {}

  const form = useForm<any>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      content: taskData.content || '',
      instructions: taskData.instructions || '',
      notes: taskData.notes || '',
      assignments:
        taskData.assignments?.map((assignment) => ({
          recipientId: assignment.recipientId,
          recipientType: assignment.recipientType,
          dueAt: assignment.dueAt || '',
          note: assignment.note || '',
        })) || [],
    },
  })

  const onSubmit = async (data: any) => {
    const { content, instructions, notes } = data

    const taskUpdatePromise = updateTaskMutation.mutateAsync({
      params: {
        path: {
          id: Number(taskId),
        },
      },
      body: {
        content,
        instructions,
        notes,
      },
    })

    toast.promise(taskUpdatePromise, {
      loading: `Đang cập nhật công việc #${taskId}...`,
      success: () => {
        void navigate({ to: '/tasks', search: { type: currentType } })
        return `Công việc #${taskId} đã được cập nhật thành công!`
      },
      error: `Không thể cập nhật công việc #${taskId}`,
    })
  }

  return (
    <div className='px-4 py-2'>
      <Card className='py-4'>
        <CardHeader>
          <CardTitle>Chỉnh sửa công việc</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              id='tasks-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6'
            >
              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Nội dung</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className='min-h-32'
                        placeholder='Nhập nội dung của bạn tại đây'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='instructions'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Hướng dẫn</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className='min-h-32'
                        placeholder='Nhập hướng dẫn của bạn tại đây'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className='min-h-32'
                        placeholder='Nhập ghi chú của bạn tại đây'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <div className='bg-background sticky bottom-0 z-10 flex items-center justify-end space-x-2 border-t px-2 pt-2'>
          <Button
            form='tasks-form'
            type='submit'
            size='lg'
            disabled={updateTaskMutation.isPending}
          >
            Lưu công việc
          </Button>
        </div>
      </Card>
    </div>
  )
}
