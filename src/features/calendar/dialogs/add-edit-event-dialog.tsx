import { type ReactNode, useEffect, useMemo } from 'react'
import { addMinutes, format, set } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActivitiesRoute } from '@/routes/_authenticated/activities'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { useCreateActivity } from '@/features/activities/hooks/use-create-activity'
import { useUpdateActivity } from '@/features/activities/hooks/use-update-activity'
import { EventFormFields } from '@/features/calendar/components/event-form-fields'
import { useDisclosure } from '@/features/calendar/hooks'
import type { IEvent } from '@/features/calendar/interfaces'
import { eventSchema, type TEventFormData } from '@/features/calendar/schemas'

interface IProps {
  children: ReactNode
  startDate?: Date
  startTime?: { hour: number; minute: number }
  event?: IEvent
}

export function AddEditEventDialog({
  children,
  startDate,
  startTime,
  event,
}: IProps) {
  const { isOpen, onClose, onToggle } = useDisclosure()
  const searchParams = ActivitiesRoute.useSearch()

  // React Query hooks for server operations
  const createEventMutation = useCreateActivity(searchParams)
  const updateEventMutation = useUpdateActivity(searchParams)

  const isEditing = !!event
  const isLoading =
    createEventMutation.isPending || updateEventMutation.isPending

  const initialDates = useMemo(() => {
    if (!isEditing && !event) {
      if (!startDate) {
        const now = new Date()
        return { startDate: now, endDate: addMinutes(now, 30) }
      }
      const start = startTime
        ? set(new Date(startDate), {
            hours: startTime.hour,
            minutes: startTime.minute,
            seconds: 0,
          })
        : new Date(startDate)
      const end = addMinutes(start, 30)
      return { startDate: start, endDate: end }
    }

    return {
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
    }
  }, [startDate, startTime, event, isEditing])

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      location: event?.location ?? '',
      startDate: initialDates.startDate,
      endDate: initialDates.endDate,
      pinned: event?.pinned ?? false,
      participants: event?.participants ?? [],
    },
  })

  useEffect(() => {
    form.reset({
      title: event?.title ?? '',
      description: event?.description ?? '',
      location: event?.location ?? '',
      startDate: initialDates.startDate,
      endDate: initialDates.endDate,
      pinned: event?.pinned ?? false,
      participants: event?.participants ?? [],
    })
  }, [event, initialDates, form])

  const onSubmit = (values: TEventFormData) => {
    const formattedEvent = {
      ...values,
      startDate: format(values.startDate, "yyyy-MM-dd'T'HH:mm:ss"),
      endDate: format(values.endDate, "yyyy-MM-dd'T'HH:mm:ss"),
    }

    if (isEditing && event) {
      const updatePromise = updateEventMutation.mutateAsync({
        params: { path: { id: event.id } },
        body: formattedEvent,
      })

      toast.promise(updatePromise, {
        loading: 'Đang cập nhật sự kiện...',
        success: () => {
          onClose()
          form.reset()
          return 'Cập nhật sự kiện thành công!'
        },
        error: 'Không thể cập nhật sự kiện',
      })
    } else {
      const createPromise = createEventMutation.mutateAsync({
        body: formattedEvent,
      })

      toast.promise(createPromise, {
        loading: 'Đang tạo sự kiện...',
        success: () => {
          onClose()
          form.reset()
          return 'Tạo sự kiện thành công!'
        },
        error: 'Không thể tạo sự kiện',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='flex h-[90vh] max-h-screen w-full !max-w-3xl flex-col pr-2'>
        <DialogHeader className='flex-shrink-0 space-y-1.5'>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin sự kiện hiện tại.'
              : 'Tạo một sự kiện mới cho lịch của bạn.'}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto pr-2'>
          <Form {...form}>
            <form
              id='event-form'
              onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit(onSubmit)(e)
              }}
              className='space-y-4 pb-4'
            >
              <EventFormFields form={form} />
            </form>
          </Form>
        </div>

        <DialogFooter className='flex-shrink-0 border-t pt-4'>
          <DialogClose asChild>
            <Button type='button' variant='outline' disabled={isLoading}>
              Hủy
            </Button>
          </DialogClose>
          <Button form='event-form' type='submit' disabled={isLoading}>
            {isEditing ? 'Lưu thay đổi' : 'Tạo sự kiện'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
