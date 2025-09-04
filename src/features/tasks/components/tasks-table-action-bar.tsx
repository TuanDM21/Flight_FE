'use client'

import { Table } from '@tanstack/react-table'
import { TasksRoute } from '@/routes/_authenticated/tasks'
import { Trash2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from '@/components/data-table/data-table-action-bar'
import { HierarchicalTask } from '@/features/tasks/types'
import { useDeleteTasksConfirm } from '../hooks/use-delete-tasks-confirm'

interface TasksTableActionBarProps {
  table: Table<HierarchicalTask>
}

export function TasksTableActionBar({ table }: TasksTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows
  const searchParams = TasksRoute.useSearch()
  const currentType = searchParams.type
  const { onDeleteTasks } = useDeleteTasksConfirm(currentType)

  const handleDeleteSelected = () => {
    const selectedTasks = rows.map((row) => row.original)
    onDeleteTasks(selectedTasks)
  }

  return (
    <DataTableActionBar
      table={table}
      visible={rows.length > 0 && currentType !== 'received'}
    >
      <DataTableActionBarSelection table={table} />
      <Separator
        orientation='vertical'
        className='hidden data-[orientation=vertical]:h-5 sm:block'
      />
      <div className='flex items-center gap-1.5'>
        <DataTableActionBarAction
          size='icon'
          tooltip='Xóa nhiệm vụ'
          onClick={handleDeleteSelected}
        >
          <Trash2 />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  )
}
