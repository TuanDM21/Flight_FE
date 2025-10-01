import { type ReactNode, useEffect, useMemo } from 'react'
import { addMinutes, set } from 'date-fns'
import {
  useForm,
  useFieldArray,
  useWatch,
  type UseFormReturn,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, UserPlus2, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import MultipleSelector, { type Option } from '@/components/ui/multiselect'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DateTimePicker } from '@/components/datetime-picker'
import { useAvailableRecipientOptions } from '@/features/tasks/hooks/use-available-recipient-options'
import { useCalendar } from '../contexts/calendar-context'
import { useDisclosure } from '../hooks'
import { IEvent } from '../interfaces'
import { EventFormData, eventSchema } from '../schemas'

function RecipientField({
  form,
  index,
}: {
  form: UseFormReturn<EventFormData>
  index: number
}) {
  const { getRecipientOptions, getTeamQuery, getUnitsQuery, getUsersQuery } =
    useAvailableRecipientOptions()
  const currentRecipientType = useWatch({
    control: form.control,
    name: `participants.${index}.participantType` as const,
  })

  // Get options only when currentRecipientType is available
  const options = currentRecipientType
    ? getRecipientOptions(currentRecipientType)
    : []
  const availableOptions: Option[] = options.map((option) => ({
    value: String(option.value),
    label: option.label || '',
  }))

  // Check if queries are loading
  const isLoading =
    getTeamQuery.isLoading || getUnitsQuery.isLoading || getUsersQuery.isLoading
  return (
    <FormField
      control={form.control}
      name={`participants.${index}.participantIds` as const}
      render={({ field }) => {
        const selectedOptions: Option[] = (field.value || []).map(
          (id: number) => {
            const option = options.find((opt) => opt.value === id)
            return {
              value: String(id),
              label: option?.label || '',
            }
          }
        )
        return (
          <FormItem className='w-full'>
            <FormLabel className='text-foreground/80 text-sm font-medium'>
              Recipients
            </FormLabel>
            <FormControl>
              <MultipleSelector
                key={`${currentRecipientType}-${availableOptions.length}`}
                value={selectedOptions}
                onChange={(selected) => {
                  const ids = selected.map((option) => Number(option.value))
                  field.onChange(ids)
                }}
                defaultOptions={availableOptions}
                placeholder={
                  isLoading
                    ? 'Loading recipients...'
                    : currentRecipientType
                      ? 'Select recipients'
                      : 'Please select recipient type first'
                }
                emptyIndicator={
                  isLoading ? (
                    <p className='text-muted-foreground text-center text-sm'>
                      Loading recipients...
                    </p>
                  ) : currentRecipientType ? (
                    <p className='text-muted-foreground text-center text-sm'>
                      No recipients found
                    </p>
                  ) : (
                    <p className='text-muted-foreground text-center text-sm'>
                      Please select recipient type first
                    </p>
                  )
                }
                disabled={!currentRecipientType || isLoading}
                commandProps={{
                  label: 'Select recipients',
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
function EventParticipantsField({
  form,
}: {
  form: UseFormReturn<EventFormData>
}) {
  const { deriveRecipientOptions } = useAvailableRecipientOptions()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'participants',
  })

  // Watch all participants to get selected types
  const allParticipants = useWatch({
    control: form.control,
    name: 'participants',
  })

  const handleAddParticipant = () => {
    // Get selected types to find the first available type
    const selectedTypes = allParticipants?.map((p) => p.participantType) || []
    const availableTypes = deriveRecipientOptions.map((option) => option.value)
    const unusedType = availableTypes.find(
      (type) => !selectedTypes.includes(type as any)
    )

    append({
      participantIds: [],
      participantType: (unusedType || 'UNIT') as 'UNIT' | 'TEAM' | 'USER',
    })
    // Clear any previous participants validation error
    form.clearErrors('participants')
  }

  // Check if all participant types are already selected
  const selectedTypes = allParticipants?.map((p) => p.participantType) || []
  const availableTypes = deriveRecipientOptions.map((option) => option.value)
  // Check if there are still unused participant types available
  const unusedTypes = availableTypes.filter(
    (type) => !selectedTypes.includes(type as any)
  )
  const canAddMoreParticipants = unusedTypes.length > 0
  return (
    <div className='space-y-4'>
      <FormLabel>Participants</FormLabel>
      <div className='space-y-6'>
        {fields.length === 0 && (
          <Card className='border-2 border-dashed'>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <Button
                type='button'
                variant='outline'
                className='h-12 rounded-full px-2.5'
                onClick={handleAddParticipant}
              >
                <span className='bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full'>
                  <UserPlus2 />
                </span>
                Add Participant
              </Button>
            </CardContent>
          </Card>
        )}
        <div className='space-y-6'>
          {fields.map((field, index) => (
            <Card key={field.id} className='border-l-4 p-6 shadow-sm'>
              <div className='mb-6 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full text-sm font-bold'>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className='text-foreground text-lg font-semibold'>
                      Participant {index + 1}
                    </h4>
                    <p className='text-muted-foreground text-sm'>
                      Select participant type and recipient
                    </p>
                  </div>
                </div>
                {fields.length > 1 && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      remove(index)
                      if (fields.length === 1) {
                        form.setError('participants', {
                          type: 'manual',
                          message: 'Vui lòng thêm ít nhất một người tham gia',
                        })
                      }
                    }}
                    className='border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-2'
                  >
                    <UserX className='size-4' />
                    Remove
                  </Button>
                )}
              </div>
              <div className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name={`participants.${index}.participantType` as const}
                    render={({ field }) => (
                      <FormItem className='w-full'>
                        <FormLabel className='text-foreground/80 text-sm font-medium'>
                          Recipient Type
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            form.setValue(
                              `participants.${index}.participantIds` as const,
                              [],
                              {
                                shouldDirty: true,
                                shouldTouch: false,
                                shouldValidate: false,
                              }
                            )
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select recipient type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {deriveRecipientOptions.map((type) => {
                              const isAlreadySelected = allParticipants?.some(
                                (participant, participantIndex) =>
                                  participantIndex !== index &&
                                  participant.participantType === type.value
                              )

                              return (
                                <SelectItem
                                  key={type.value}
                                  value={type.value}
                                  disabled={isAlreadySelected}
                                >
                                  {type.label}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <RecipientField form={form} index={index} />
                </div>
                {fields.length > 0 && canAddMoreParticipants && (
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full border-2 border-dashed'
                    onClick={handleAddParticipant}
                  >
                    <PlusCircle className='mr-2 h-4 w-4' />
                    Add Another Participant
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
export function EventFormFields({
  form,
}: {
  form: UseFormReturn<EventFormData>
}) {
  return (
    <div className='grid gap-4 py-4'>
      <FormField
        control={form.control}
        name='name'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel htmlFor='name' className='required'>
              Name
            </FormLabel>
            <FormControl>
              <Input
                id='name'
                placeholder='Enter a name'
                {...field}
                className={fieldState.invalid ? 'border-red-500' : ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='location'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel htmlFor='location' className='required'>
              Location
            </FormLabel>
            <FormControl>
              <Input
                id='location'
                placeholder='Enter location'
                {...field}
                className={fieldState.invalid ? 'border-red-500' : ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='startTime'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='required'>Start Time</FormLabel>
            <FormControl>
              <DateTimePicker placeholder='Chọn thời gian bắt đầu' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='endTime'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='required'>End Time</FormLabel>
            <FormControl>
              <DateTimePicker
                placeholder='Chọn thời gian kết thúc'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='participants'
        render={() => (
          <FormItem>
            <EventParticipantsField form={form} />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='notes'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className='required'>Notes</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder='Enter notes'
                className={fieldState.invalid ? 'border-red-500' : ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='pinned'
        render={({ field }) => (
          <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className='space-y-1 leading-none'>
              <FormLabel>Pin this event</FormLabel>
              <p className='text-muted-foreground text-sm'>
                Pinned events will appear at the top of the list
              </p>
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}
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
  const { addEvent, updateEvent } = useCalendar()
  const isEditing = !!event
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
      startDate: new Date(event.startTime),
      endDate: new Date(event.endTime),
    }
  }, [startDate, startTime, event, isEditing])
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event?.name ?? '',
      location: event?.location ?? '',
      notes: event?.notes ?? '',
      startTime: initialDates.startDate,
      endTime: initialDates.endDate,
      pinned: false,
      participants: [
        {
          participantType: 'UNIT',
          participantIds: [],
        },
      ],
    },
  })
  useEffect(() => {
    const transformedParticipants = event?.participants?.length
      ? event.participants.map((p: any) => ({
          participantType: (p.participantType || 'UNIT') as
            | 'UNIT'
            | 'TEAM'
            | 'USER',
          participantIds: p.participantId ? [p.participantId] : [],
        }))
      : [
          {
            participantType: 'UNIT' as const,
            participantIds: [],
          },
        ]
    form.reset({
      name: event?.name ?? '',
      location: event?.location ?? '',
      notes: event?.notes ?? '',
      startTime: initialDates.startDate,
      endTime: initialDates.endDate,
      pinned: false,
      participants: transformedParticipants,
    })
  }, [event, initialDates, form])
  const onSubmit = async (values: EventFormData) => {
    try {
      const formattedEvent: EventFormData = {
        ...values,
        startTime: values.startTime,
        endTime: values.endTime,
      }
      if (isEditing) {
        await updateEvent(event.id, formattedEvent)
        toast.success('Event updated successfully')
      } else {
        await addEvent(formattedEvent)
        toast.success('Event created successfully')
      }
      onClose()
      form.reset()
    } catch {
      toast.error(`Failed to ${isEditing ? 'edit' : 'add'} event`)
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={onToggle} modal={false}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='flex h-[90vh] max-h-screen w-full !max-w-3xl flex-col pr-1'>
        <DialogHeader className='flex-shrink-0 space-y-1.5'>
          <DialogTitle>
            {isEditing ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modify your existing event.'
              : 'Create a new event for your calendar.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='flex-1 overflow-y-auto pr-4'>
          <Form {...form}>
            <form
              id='event-form'
              onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit(onSubmit)(e)
              }}
              className='space-y-4'
            >
              <EventFormFields form={form} />
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className='flex-shrink-0 border-t pt-4 pr-4'>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </DialogClose>
          <Button form='event-form' type='submit'>
            {isEditing ? 'Save Changes' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
