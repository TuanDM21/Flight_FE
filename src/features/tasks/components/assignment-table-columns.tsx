import { z } from 'zod'
import { format } from 'date-fns'
import { UseFormReturn, useWatch } from 'react-hook-form'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { ColumnDef } from '@tanstack/react-table'
import {
  IconDeviceFloppy,
  IconEdit,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { dateFormatPatterns } from '@/config/date'
import { TasksRoute } from '@/routes/_authenticated/tasks'
import { CheckCheck, FileTextIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Popover } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DateTimePicker } from '@/components/datetime-picker'
import { FormFieldTooltipError } from '@/components/form-field-tooltip-error'
import { useRecipientOptions } from '@/features/tasks/hooks/use-recipient-options'
import { updateTaskAssignmentSchema } from '@/features/tasks/schema'
import {
  Task,
  TaskAssignment,
  TaskAssignmentStatus,
} from '@/features/tasks/types'
import {
  assigneeTaskAssignmentStatusLabels,
  ownerTaskAssignmentStatusLabels,
} from '@/features/tasks/utils/tasks'
import { recipientTypeMap, recipientTypes } from '../config'
import { EditableNoteCell } from './editable-note-cell'
import { TaskAssignmentStatusBadge } from './task-assignment-status-badge'

type TaskAssignmentUpdateForm = z.infer<typeof updateTaskAssignmentSchema> & {
  assignmentId?: number
}

interface AssignmentColumnsProps {
  editingAssignmentId: number | undefined
  form: UseFormReturn<TaskAssignmentUpdateForm>
  handleSaveEdit: () => Promise<void>
  resetAssignmentForm: () => void
  handleUpdateAssignmentStatus: (
    assignment: TaskAssignment,
    newStatus: TaskAssignmentStatus
  ) => void
  handleOpenCommentsSheet: (assignment: TaskAssignment) => void
  startEditing: (assignment: TaskAssignment) => void
  handleDeleteAssignment: (assignment: TaskAssignment) => void
  updateAssignmentMutation: { isPending: boolean }

  task: Task
}

export function useAssignmentTableColumns({
  editingAssignmentId,
  form,
  handleSaveEdit,
  resetAssignmentForm,
  handleUpdateAssignmentStatus,
  handleOpenCommentsSheet,
  startEditing,
  handleDeleteAssignment,
  updateAssignmentMutation,
  task,
}: AssignmentColumnsProps): ColumnDef<TaskAssignment>[] {
  const { user } = useAuth()
  const searchParams = TasksRoute.useSearch()
  const filterType = searchParams.type

  const isTaskOwner = user?.id === task.createdByUser?.id
  const { getRecipientOptions, deriveRecipientOptions } = useRecipientOptions()

  const currentRecipientType = useWatch({
    control: form.control,
    name: 'recipientType',
  })

  const taskAssignmentStatusLabels = isTaskOwner
    ? ownerTaskAssignmentStatusLabels
    : assigneeTaskAssignmentStatusLabels

  return [
    {
      id: 'recipientType',
      accessorKey: 'recipientType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Loại' />
      ),
      cell: ({ row, cell }) => {
        const assignment = row.original
        const isEditing = editingAssignmentId === assignment.assignmentId
        const value = cell.getValue<string>()

        if (isEditing) {
          return (
            <FormField
              control={form.control}
              name='recipientType'
              render={({ field, fieldState }) => (
                <FormItem className='flex flex-col'>
                  <FormControl>
                    <FormFieldTooltipError
                      message={fieldState.error?.message || ''}
                      showError={!!fieldState.error}
                    >
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          form.setValue('recipientId', null as any, {
                            shouldValidate: false,
                          })
                        }}
                      >
                        <SelectTrigger
                          className={cn(
                            'w-full',
                            fieldState.error && 'border-destructive'
                          )}
                        >
                          <SelectValue placeholder='Chọn loại' />
                        </SelectTrigger>
                        <SelectContent>
                          {deriveRecipientOptions.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormFieldTooltipError>
                  </FormControl>
                </FormItem>
              )}
            />
          )
        }
        return (
          <div>
            {value
              ? recipientTypes[value as keyof typeof recipientTypes]
              : 'N/A'}
          </div>
        )
      },
      size: 100,
      enableSorting: false,
    },
    {
      id: 'recipientUser',
      accessorKey: 'recipientUser',
      accessorFn: (row) => {
        if (row.recipientType === 'user') {
          return row.recipientUser?.name ?? ''
        }
        if (row.recipientType === 'team') {
          return row.recipientUser?.teamName ?? ''
        }
        if (row.recipientType === 'unit') {
          return row.recipientUser?.unitName ?? ''
        }
        return 'N/A'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Người nhận' />
      ),
      cell: ({ row }) => {
        const assignment = row.original
        const isEditing = editingAssignmentId === assignment.assignmentId

        if (isEditing) {
          return (
            <FormField
              control={form.control}
              name='recipientId'
              render={({ field, fieldState }) => {
                return (
                  <FormItem className='flex flex-col'>
                    <FormControl>
                      <Select
                        value={field.value ? String(field.value) : ''}
                        onValueChange={(value) => {
                          field.onChange(Number(value))
                        }}
                        disabled={!currentRecipientType}
                      >
                        <FormFieldTooltipError
                          message={fieldState.error?.message || ''}
                          showError={!!fieldState.error}
                        >
                          <SelectTrigger
                            className={cn(
                              'w-full',
                              fieldState.error && 'border-destructive'
                            )}
                          >
                            <SelectValue placeholder='Chọn người nhận' />
                          </SelectTrigger>
                        </FormFieldTooltipError>
                        <SelectContent>
                          {(() => {
                            const options = getRecipientOptions(
                              currentRecipientType || ''
                            )
                            if (options.length === 0) {
                              return (
                                <div className='text-muted-foreground p-2 text-sm'>
                                  Không có người nhận nào
                                </div>
                              )
                            }

                            return options.map((recipient) => (
                              <SelectItem
                                key={recipient.value}
                                value={String(recipient.value)}
                              >
                                {recipient.label}
                              </SelectItem>
                            ))
                          })()}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )
              }}
            />
          )
        }

        if (assignment.recipientType === recipientTypeMap.user) {
          return <div>{assignment?.recipientUser?.name || 'N/A'}</div>
        }
        if (assignment.recipientType === recipientTypeMap.team) {
          return <div>{assignment?.recipientUser?.teamName || 'N/A'}</div>
        }
        if (assignment.recipientType === recipientTypeMap.unit) {
          return <div>{assignment?.recipientUser?.unitName || 'N/A'}</div>
        }

        return 'N/A'
      },
      size: 100,
      enableSorting: false,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Trạng thái' />
      ),
      cell: ({ row }) => {
        const assignment = row.original
        const isEditing = editingAssignmentId === assignment.assignmentId
        const status = assignment.status || 'DONE'

        if (isEditing) {
          return (
            <FormField
              control={form.control}
              name='status'
              render={({ field, fieldState }) => (
                <FormItem className='flex flex-col'>
                  <FormControl>
                    <FormFieldTooltipError
                      message={fieldState.error?.message || ''}
                      showError={!!fieldState.error}
                    >
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={cn(
                            'w-full',
                            fieldState.error && 'border-destructive'
                          )}
                        >
                          <SelectValue placeholder='Chọn trạng thái' />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(taskAssignmentStatusLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormFieldTooltipError>
                  </FormControl>
                </FormItem>
              )}
            />
          )
        }

        return <TaskAssignmentStatusBadge status={status} />
      },
      size: 120,
      enableSorting: false,
    },
    {
      id: 'assignedByUser',
      accessorKey: 'assignedByUser',
      accessorFn: (row) => row.assignedByUser?.name ?? '',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Được giao bởi' />
      ),
      cell: ({ cell }) => <div>{cell.getValue<string>() || 'N/A'}</div>,
      size: 100,
      enableSorting: false,
    },
    {
      id: 'assignedAt',
      accessorKey: 'assignedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ngày giao' />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue<string>()
        if (!value) return <div>Chưa thiết lập</div>
        const date = new Date(value)
        return <div>{format(date, dateFormatPatterns.fullDateTime)}</div>
      },
      enableSorting: false,
    },
    {
      id: 'dueAt',
      accessorKey: 'dueAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Hạn hoàn thành' />
      ),
      cell: ({ row, cell }) => {
        const assignment = row.original
        const isEditing = editingAssignmentId === assignment.assignmentId
        const value = cell.getValue<string | null>()
        if (isEditing) {
          return (
            <FormField
              control={form.control}
              name='dueAt'
              render={({ field, fieldState }) => (
                <FormItem className='flex flex-col'>
                  <FormControl>
                    <FormFieldTooltipError
                      message={fieldState.error?.message || ''}
                      showError={!!fieldState.error}
                    >
                      <Popover>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder='Chọn thời hạn hoàn thành'
                        />
                      </Popover>
                    </FormFieldTooltipError>
                  </FormControl>
                </FormItem>
              )}
            />
          )
        }
        if (!value) return <div>Chưa thiết lập</div>
        const date = new Date(value)
        return <div>{format(date, dateFormatPatterns.fullDateTime)}</div>
      },
      enableSorting: false,
    },
    {
      id: 'note',
      accessorKey: 'note',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ghi chú' />
      ),
      cell: ({ row }) => {
        const assignment = row.original
        return (
          <EditableNoteCell
            assignment={assignment}
            assignmentId={editingAssignmentId!}
            form={form}
          />
        )
      },
      size: 200,
      enableSorting: false,
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Hành động' />
      ),
      cell: ({ row }) => {
        const assignment = row.original
        const isEditing = editingAssignmentId === assignment.assignmentId

        if (isEditing) {
          return (
            <div className='flex space-x-2'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={handleSaveEdit}
                    disabled={updateAssignmentMutation.isPending}
                  >
                    <IconDeviceFloppy className='h-4 w-4' />
                    <span className='sr-only'>Lưu thay đổi</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Lưu thay đổi</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={resetAssignmentForm}
                  >
                    <IconX className='h-4 w-4' />
                    <span className='sr-only'>Hủy chỉnh sửa</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hủy chỉnh sửa</TooltipContent>
              </Tooltip>
            </div>
          )
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
              >
                <DotsHorizontalIcon className='h-4 w-4' />
                <span className='sr-only'>Mở menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[160px]'>
              {filterType === 'received' && assignment.status !== 'DONE' && (
                <DropdownMenuItem
                  onClick={() =>
                    handleUpdateAssignmentStatus(assignment, 'DONE')
                  }
                >
                  Hoàn thành công việc
                  <DropdownMenuShortcut>
                    <CheckCheck className='h-4 w-4' />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  handleOpenCommentsSheet(assignment)
                }}
              >
                Xem bình luận
                <DropdownMenuShortcut>
                  <FileTextIcon />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              {isTaskOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      startEditing(assignment)
                    }}
                  >
                    Chỉnh sửa
                    <DropdownMenuShortcut>
                      <IconEdit />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleDeleteAssignment(assignment)
                    }}
                  >
                    Xóa
                    <DropdownMenuShortcut>
                      <IconTrash />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 20,
      meta: {
        className: 'sticky right-0 bg-background border-l',
      },
      enableSorting: false,
    },
  ]
}
