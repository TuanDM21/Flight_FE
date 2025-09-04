import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { TasksRoute } from '@/routes/_authenticated/tasks'
import { CheckCircle, Flag } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { AttachmentItem } from '@/features/attachments/types'
import {
  HierarchicalTask,
  Task,
  TaskAssignment,
  TaskStatus,
} from '@/features/tasks/types'
import { UserItem } from '@/features/users/types'
import { EditableCellSelect } from '../components/editable-cell-select'
import { EditableCellText } from '../components/editable-cell-text'
import { EditableCellTextarea } from '../components/editable-cell-textarea'
import { TaskAssigneeDisplay } from '../components/task-assignee-display'
import { TaskAssignmentsDisplay } from '../components/task-assignments-display'
import { TaskAttachmentsDisplay } from '../components/task-attachments-display'
import { TaskHierarchyCell } from '../components/task-hierarchy-cell'
import { TaskStatusBadge } from '../components/task-status-badge'
import { taskPriorityOptions, taskStatusFilterOptions } from '../utils/tasks'

interface UseTasksTableColumnsOptions {
  onToggleSubtasks?: (taskId: number) => void
}

export function useTasksTableColumns(options?: UseTasksTableColumnsOptions) {
  const { onToggleSubtasks } = options || {}
  const searchParams = TasksRoute.useSearch()
  const filterType = searchParams.type

  const columns = useMemo(
    (): ColumnDef<HierarchicalTask>[] => [
      {
        id: 'select',
        header: ({ table }) => {
          const mainTaskRows = table.getRowModel().rows.filter((row) => {
            const task = row.original
            const level = ('level' in task && task.level) || 0
            return level === 0
          })

          const selectedMainTaskRows = mainTaskRows.filter((row) =>
            row.getIsSelected()
          )
          const isAllMainTasksSelected =
            mainTaskRows.length > 0 &&
            selectedMainTaskRows.length === mainTaskRows.length
          const isSomeMainTasksSelected =
            selectedMainTaskRows.length > 0 &&
            selectedMainTaskRows.length < mainTaskRows.length

          return (
            <Checkbox
              checked={
                isSomeMainTasksSelected
                  ? 'indeterminate'
                  : isAllMainTasksSelected
              }
              onCheckedChange={(value) => {
                mainTaskRows.forEach((row) => {
                  row.toggleSelected(!!value)
                })
              }}
              aria-label='Chọn tất cả'
            />
          )
        },
        cell: ({ row }) => {
          const task = row.original
          const level = ('level' in task && task.level) || 0

          return level === 0 ? (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => {
                row.toggleSelected(!!value)
              }}
              aria-label='Chọn dòng'
            />
          ) : null
        },
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'id',
        accessorKey: 'id',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Mã công việc' />
        ),
        cell: ({ cell, row }) => {
          const taskId = cell.getValue<number>()
          const task = row.original
          const level = ('level' in task && task.level) || 0
          const isLastChild =
            ('isLastChild' in task && task.isLastChild) || false
          const hasSubtask = !!task.hasSubtask

          return (
            <TaskHierarchyCell
              taskId={taskId}
              level={level}
              isLastChild={!!isLastChild}
              hasSubtask={!!hasSubtask}
              onToggleSubtasks={onToggleSubtasks}
            />
          )
        },
        meta: {
          label: 'Mã công việc',
        },
        size: 250,
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        id: 'title',
        accessorKey: 'title',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Tiêu đề' />
        ),
        cell: EditableCellText,
        meta: {
          label: 'Tiêu đề',
        },
        enableColumnFilter: false,
        enableSorting: false,
        size: 250,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Trạng thái' />
        ),
        cell: ({ cell }) => {
          const status = cell.getValue<TaskStatus>()

          return (
            <div className='flex items-center justify-center'>
              {status ? (
                <TaskStatusBadge status={status} size='sm' />
              ) : (
                <span className='text-muted-foreground'>N/A</span>
              )}
            </div>
          )
        },
        meta: {
          label: 'Trạng thái',
          placeholder: 'Tìm kiếm trạng thái...',
          variant: 'select',
          options: taskStatusFilterOptions,
          icon: CheckCircle,
        },
        enableSorting: false,
        enableColumnFilter: filterType !== 'created',
      },
      {
        id: 'priorities',
        accessorKey: 'priority',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Độ ưu tiên' />
        ),
        cell: (cellContext) => (
          <EditableCellSelect {...cellContext} options={taskPriorityOptions} />
        ),
        meta: {
          label: 'Độ ưu tiên',
          placeholder: 'Tìm kiếm độ ưu tiên...',
          variant: 'multiSelect',
          options: taskPriorityOptions,
          icon: Flag,
        },
        size: 150,
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: 'content',
        accessorKey: 'content',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Nội dung' />
        ),
        cell: (cellContext) => (
          <EditableCellTextarea {...cellContext} maxLength={1000} />
        ),
        meta: {
          label: 'Nội dung',
        },
        enableSorting: false,
        size: 300,
      },
      {
        id: 'instructions',
        accessorKey: 'instructions',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Hướng dẫn' />
        ),
        cell: (cellContext) => (
          <EditableCellTextarea {...cellContext} maxLength={1000} />
        ),
        meta: {
          label: 'Hướng dẫn',
        },
        enableSorting: false,
        size: 300,
      },
      {
        id: 'notes',
        accessorKey: 'notes',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Ghi chú' />
        ),
        cell: (cellContext) => (
          <EditableCellTextarea {...cellContext} maxLength={1000} />
        ),
        enableSorting: false,
        meta: {
          label: 'Ghi chú',
        },
        size: 300,
      },
      {
        id: 'createdBy',
        accessorFn: (row) => row.createdByUser,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Người tạo' />
        ),
        cell: ({ cell }) => {
          const createdByUser = cell.getValue<UserItem>()
          return (
            <div className='flex items-center justify-center'>
              <TaskAssigneeDisplay
                users={createdByUser ? [createdByUser] : []}
                maxVisible={1}
              />
            </div>
          )
        },
        enableSorting: false,
        meta: {
          label: 'Người tạo',
        },
      },
      {
        id: 'assignees',
        accessorFn: (row) => row.assignments,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Danh sách phân công' />
        ),
        cell: ({ cell, row }) => {
          const taskAssignments = cell.getValue<TaskAssignment[]>()
          const task = row.original as Task

          return (
            <div className='flex items-center justify-center'>
              <TaskAssignmentsDisplay
                assignments={taskAssignments}
                maxVisible={3}
                task={task}
              />
            </div>
          )
        },
        enableSorting: false,
        meta: {
          label: 'Danh sách phân công',
        },
      },
      {
        id: 'startTime',
        accessorKey: 'startTime',
        meta: {
          label: 'Ngày bắt đầu',
          placeholder: 'Lọc theo ngày bắt đầu...',
          variant: 'date',
        },
        enableColumnFilter: true,
        isFilterVisibleOnly: true,
      },
      {
        id: 'endTime',
        accessorKey: 'endTime',
        meta: {
          label: 'Ngày kết thúc',
          placeholder: 'Lọc theo ngày kết thúc...',
          variant: 'date',
        },
        enableColumnFilter: true,
        isFilterVisibleOnly: true,
      },
      {
        id: 'attachments',
        accessorKey: 'attachments',
        accessorFn: (row) => row.attachments,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Tài liệu đính kèm' />
        ),
        cell: ({ cell }) => {
          const attachments = cell.getValue<AttachmentItem[]>() || []
          const taskId = cell.row.original.id
          const level = cell.row.original.level || 0
          return (
            <div className='flex items-center justify-center'>
              <TaskAttachmentsDisplay
                attachments={attachments}
                maxVisible={3}
                taskId={taskId!}
                filterType={filterType}
                level={level}
              />
            </div>
          )
        },
        enableSorting: false,
        meta: {
          label: 'Tài liệu đính kèm',
        },
      },
    ],
    [filterType]
  )

  return columns
}
