import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { CheckCircle, Flag } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { AttachmentItem } from '@/features/attachments/types'
import {
  HierarchicalTask,
  Task,
  TaskAssignment,
  TaskFilterTypes,
  TaskStatus,
} from '@/features/tasks/types'
import { EditableCellSelect } from '../components/editable-cell-select'
import { EditableCellText } from '../components/editable-cell-text'
import { EditableCellTextarea } from '../components/editable-cell-textarea'
import { TaskAssignmentsDisplay } from '../components/task-assignments-display'
import { TaskAttachmentsDisplay } from '../components/task-attachments-display'
import { TaskHierarchyCell } from '../components/task-hierarchy-cell'
import { TaskStatusBadge } from '../components/task-status-badge'
import { taskPriorityOptions, taskStatusFilterOptions } from '../utils'
import { useRecipientOptions } from './use-recipient-options'

interface UseTasksTableColumnsOptions {
  onToggleSubtasks?: (taskId: number) => void
  allowCellEditing: boolean
  filterType: TaskFilterTypes
}

export function useTasksTableColumns(options: UseTasksTableColumnsOptions) {
  const { onToggleSubtasks, allowCellEditing, filterType } = options
  const { teamOptions, unitOptions, userOptions } = useRecipientOptions()

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
        size: 14,
        maxSize: 14,
        enableSorting: false,
        enableResizing: true,
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
              filterType={filterType}
            />
          )
        },
        meta: {
          label: 'Mã công việc',
        },
        size: 140,
        minSize: 100,
        maxSize: 200,
        enableColumnFilter: false,
        enableHiding: false,
        enableSorting: false,
      },
      {
        id: 'title',
        accessorKey: 'title',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Tiêu đề' />
        ),
        cell: (cellContext) => (
          <EditableCellText
            {...cellContext}
            filterType={filterType}
            allowCellEditing={allowCellEditing}
          />
        ),
        meta: {
          label: 'Tiêu đề',
        },
        enableColumnFilter: false,
        enableSorting: false,
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
        size: 100,
        minSize: 90,
        enableResizing: false,
        maxSize: 120,
      },
      {
        id: 'priorities',
        accessorKey: 'priority',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Độ ưu tiên' />
        ),
        cell: (cellContext) => (
          <EditableCellSelect
            {...cellContext}
            options={taskPriorityOptions}
            filterType={filterType}
            allowCellEditing={allowCellEditing}
          />
        ),
        meta: {
          label: 'Độ ưu tiên',
          placeholder: 'Tìm kiếm độ ưu tiên...',
          variant: 'multiSelect',
          options: taskPriorityOptions,
          icon: Flag,
        },
        size: 110,
        minSize: 90,
        maxSize: 150,
        enableColumnFilter: true,
        enableResizing: false,
        enableSorting: false,
      },
      {
        id: 'content',
        accessorKey: 'content',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Nội dung' />
        ),
        cell: (cellContext) => (
          <EditableCellTextarea
            {...cellContext}
            maxLength={1000}
            filterType={filterType}
            allowCellEditing={allowCellEditing}
          />
        ),
        meta: {
          label: 'Nội dung',
        },
        enableSorting: false,
      },
      {
        id: 'instructions',
        accessorKey: 'instructions',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Hướng dẫn' />
        ),
        cell: (cellContext) => (
          <EditableCellTextarea
            {...cellContext}
            maxLength={1000}
            filterType={filterType}
            allowCellEditing={allowCellEditing}
          />
        ),
        meta: {
          label: 'Hướng dẫn',
        },
        enableSorting: false,
      },
      {
        id: 'notes',
        accessorKey: 'notes',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Ghi chú' />
        ),
        cell: (cellContext) => (
          <EditableCellTextarea
            {...cellContext}
            maxLength={1000}
            filterType={filterType}
            allowCellEditing={allowCellEditing}
          />
        ),
        enableSorting: false,
        meta: {
          label: 'Ghi chú',
        },
      },
      {
        id: 'assignees',
        accessorFn: (row) => row.assignments,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Phân công' />
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
                filterType={filterType}
                allowCellEditing={allowCellEditing}
              />
            </div>
          )
        },
        enableSorting: false,
        enableResizing: false,
        meta: {
          label: 'Phân công',
        },
        size: 60,
        minSize: 50,
        maxSize: 80,
      },
      {
        id: 'attachments',
        accessorKey: 'attachments',
        accessorFn: (row) => row.attachments,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Tệp đính kèm' />
        ),
        cell: ({ cell }) => {
          const attachments = cell.getValue<AttachmentItem[]>() || []
          const taskId = cell.row.original.id
          const level = cell.row.original.level || 0

          return (
            <div className='flex items-center justify-center'>
              <TaskAttachmentsDisplay
                attachments={attachments}
                taskId={taskId!}
                filterType={filterType}
                level={level}
                allowCellEditing={allowCellEditing}
              />
            </div>
          )
        },
        enableSorting: false,
        enableResizing: false,
        meta: {
          label: 'Tệp đính kèm',
        },
        size: 80,
        minSize: 50,
        maxSize: 80,
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
        id: 'teamIds',
        accessorKey: 'teamIds',
        meta: {
          label: 'Đội',
          placeholder: 'Lọc theo dội...',
          variant: 'multiSelect',
          options: teamOptions,
        },
        enableColumnFilter: true,
        isFilterVisibleOnly: true,
      },
      {
        id: 'unitIds',
        accessorKey: 'unitIds',
        meta: {
          label: 'Tổ',
          placeholder: 'Lọc theo tổ...',
          variant: 'multiSelect',
          options: unitOptions,
        },
        enableColumnFilter: true,
        isFilterVisibleOnly: true,
      },
      {
        id: 'userIds',
        accessorKey: 'userIds',
        meta: {
          label: 'Cá nhân',
          placeholder: 'Lọc theo Cá nhân...',
          variant: 'multiSelect',
          options: userOptions,
        },
        enableColumnFilter: true,
        isFilterVisibleOnly: true,
      },
    ],
    [
      filterType,
      allowCellEditing,
      onToggleSubtasks,
      teamOptions,
      unitOptions,
      userOptions,
    ]
  )

  return columns
}
