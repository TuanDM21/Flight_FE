import { useEffect } from 'react'
import { useWatch, useFieldArray, type UseFormReturn } from 'react-hook-form'
import { UserPlus2, UserX, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import MultipleSelector, { type Option } from '@/components/ui/multiselect'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DateTimePicker } from '@/components/datetime-picker'
import type { TEventFormData } from '@/features/calendar/schemas'
import { useAvailableRecipientOptions } from '@/features/tasks/hooks/use-available-recipient-options'

function RecipientField({
  form,
  index,
}: {
  form: UseFormReturn<TEventFormData>
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

  // Check if queries are loading
  const isLoading =
    getTeamQuery.isLoading || getUnitsQuery.isLoading || getUsersQuery.isLoading

  const availableOptions: Option[] = options.map((option) => ({
    value: String(option.value),
    label: option.label || '',
  }))

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
            <FormLabel className='text-sm'>Người nhận</FormLabel>
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
                    ? 'Đang tải danh sách người tham gia...'
                    : currentRecipientType
                      ? 'Chọn người tham gia'
                      : 'Vui lòng chọn loại người tham gia trước'
                }
                emptyIndicator={
                  isLoading ? (
                    <p className='text-muted-foreground text-center text-sm'>
                      Đang tải danh sách người tham gia...
                    </p>
                  ) : currentRecipientType ? (
                    <p className='text-muted-foreground text-center text-sm'>
                      Không tìm thấy người tham gia
                    </p>
                  ) : (
                    <p className='text-muted-foreground text-center text-sm'>
                      Vui lòng chọn loại người tham gia trước
                    </p>
                  )
                }
                disabled={!currentRecipientType || isLoading}
                commandProps={{
                  label: 'Chọn người tham gia',
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
  form: UseFormReturn<TEventFormData>
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
    const availableTypes = deriveRecipientOptions.map(
      (option) => option.value as 'UNIT' | 'TEAM' | 'USER'
    )
    const unusedType = availableTypes.find(
      (type) => !selectedTypes.includes(type)
    )

    append({
      participantIds: [],
      participantType: unusedType || 'UNIT',
    })
    // Clear any previous participants validation error
    form.clearErrors('participants')
  }

  // Check if all participant types are already selected
  const selectedTypes = allParticipants?.map((p) => p.participantType) || []
  const availableTypes = deriveRecipientOptions.map(
    (option) => option.value as 'UNIT' | 'TEAM' | 'USER'
  )
  // Check if there are still unused participant types available
  const unusedTypes = availableTypes.filter(
    (type) => !selectedTypes.includes(type)
  )
  const canAddMoreParticipants = unusedTypes.length > 0
  return (
    <div className='space-y-4'>
      {/* Header với Add button */}
      <div className='flex items-center justify-between'>
        <FormLabel>Người tham gia</FormLabel>
        {canAddMoreParticipants && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleAddParticipant}
            className='h-8 px-2 text-xs'
          >
            <PlusCircle className='mr-1 h-3 w-3' />
            Thêm loại
          </Button>
        )}
      </div>

      {/* Empty state */}
      {fields.length === 0 && (
        <div className='rounded-lg border-2 border-dashed p-8 text-center'>
          <div className='text-muted-foreground mb-3 text-sm'>
            Chưa thêm người tham gia nào
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleAddParticipant}
          >
            <UserPlus2 className='mr-2 h-4 w-4' />
            Thêm người tham gia đầu tiên
          </Button>
        </div>
      )}

      {/* Participants list - simple layout without nested cards */}
      {fields.length > 0 && (
        <div className='space-y-4'>
          {fields.map((field, index) => (
            <div key={field.id} className='rounded-lg border p-4'>
              {/* Header row: Type badge + Remove button */}
              <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium'>
                    {deriveRecipientOptions.find(
                      (opt) =>
                        opt.value === allParticipants?.[index]?.participantType
                    )?.label || 'Không xác định'}{' '}
                    #{index + 1}
                  </span>
                </div>
                {fields.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
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
                    className='text-destructive hover:text-destructive h-8 w-8 p-0'
                  >
                    <UserX className='h-4 w-4' />
                  </Button>
                )}
              </div>

              {/* Form fields - Type field nhỏ, Recipients field full width */}
              <div className='space-y-4'>
                <div className='flex items-center gap-4'>
                  <FormField
                    control={form.control}
                    name={`participants.${index}.participantType` as const}
                    render={({ field }) => (
                      <FormItem className='min-w-[160px]'>
                        <FormLabel className='text-sm'>Loại</FormLabel>
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
                            <SelectTrigger className='w-[160px]'>
                              <SelectValue placeholder='Chọn loại' />
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

                  <div className='flex-1'>
                    <RecipientField form={form} index={index} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function EventFormFields({
  form,
}: {
  form: UseFormReturn<TEventFormData>
}) {
  // Watch both dates for cross-field validation
  const startDate = useWatch({
    control: form.control,
    name: 'startDate',
  })

  const endDate = useWatch({
    control: form.control,
    name: 'endDate',
  })

  // Trigger validation when either date changes
  useEffect(() => {
    if (startDate || endDate) {
      // Trigger validation on both fields to show/hide error messages
      void form.trigger(['startDate', 'endDate'])
    }
  }, [startDate, endDate, form])

  return (
    <div className='grid gap-4'>
      <FormField
        control={form.control}
        name='title'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel htmlFor='title' className='required'>
              Tiêu đề
            </FormLabel>
            <FormControl>
              <Input
                id='title'
                placeholder='Nhập tiêu đề'
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
              Địa điểm
            </FormLabel>
            <FormControl>
              <Input
                id='location'
                placeholder='Nhập địa điểm'
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
        name='startDate'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='required'>Thời gian bắt đầu</FormLabel>
            <FormControl>
              <DateTimePicker
                value={field.value}
                onChange={(dateString) => {
                  field.onChange(dateString ? new Date(dateString) : undefined)
                }}
                placeholder='Chọn thời gian bắt đầu'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='endDate'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='required'>Thời gian kết thúc</FormLabel>
            <FormControl>
              <DateTimePicker
                value={field.value}
                onChange={(dateString) => {
                  field.onChange(dateString ? new Date(dateString) : undefined)
                }}
                placeholder='Chọn thời gian kết thúc'
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
        name='description'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Mô tả</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder='Nhập mô tả'
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
              <FormLabel>Ghim sự kiện này</FormLabel>
              <p className='text-muted-foreground text-sm'>
                Sự kiện được ghim sẽ hiển thị ở đầu danh sách
              </p>
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}
