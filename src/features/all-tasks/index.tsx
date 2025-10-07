import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AllTasksRoute } from '@/routes/_authenticated/tasks/all'
import { useDataTable } from '@/hooks/use-data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import PageTableSkeleton from '@/components/page-table-skeleton'
import { TaskSearchInput } from '../tasks/components/task-search-input'
import { TasksDataTable } from '../tasks/components/tasks-data-table'
import { TasksTableActionBar } from '../tasks/components/tasks-table-action-bar'
import { useRecipientOptions } from '../tasks/hooks/use-recipient-options'
import { HierarchicalTask, Task } from '../tasks/types'
import { allTasksQueryOptions } from './hooks/use-all-tasks'
import { useAllTasksTableColumns } from './hooks/use-all-tasks-table-columns'

export function AllTasksPage() {
  const searchParams = AllTasksRoute.useSearch()
  const filterType = searchParams.type
  const isFiltering = searchParams.filters?.length > 0
  const { teamOptions, unitOptions, userOptions } = useRecipientOptions()

  // Function to build task hierarchy from flat list
  const buildTaskHierarchy = (tasks: Task[]): HierarchicalTask[] => {
    const taskMap = new Map<number, Task>()
    const rootTasks: Task[] = []

    // Create a map for quick lookup and separate root tasks
    for (const task of tasks) {
      if (task.id) {
        taskMap.set(task.id, task)
        if (!task.parentId) {
          rootTasks.push(task)
        }
      }
    }

    // Function to build hierarchy recursively
    const buildHierarchy = (
      task: Task,
      level: number = 0
    ): HierarchicalTask[] => {
      const hierarchicalTask: HierarchicalTask = {
        ...task,
        level,
        isLastChild: false, // Will be set correctly later
      }

      const result: HierarchicalTask[] = [hierarchicalTask]

      // Find children of this task
      const children = tasks.filter((t) => t.parentId === task.id)

      for (const [index, child] of children.entries()) {
        const childHierarchy = buildHierarchy(child, level + 1)
        // Mark the last child
        if (index === children.length - 1 && childHierarchy.length > 0) {
          childHierarchy[0].isLastChild = true
        }
        result.push(...childHierarchy)
      }

      return result
    }

    // Build the complete hierarchy starting from root tasks
    const hierarchicalTasks: HierarchicalTask[] = []
    for (const rootTask of rootTasks) {
      hierarchicalTasks.push(...buildHierarchy(rootTask))
    }

    return hierarchicalTasks
  }

  const {
    data: tasksResponse,
    isLoading,
    isFetching,
  } = useQuery({
    ...allTasksQueryOptions(searchParams),
    placeholderData: (prev) => prev,
  })

  // Fallback for undefined response
  const safeTasksResponse = tasksResponse || {
    data: {
      tasks: [],
      pagination: { totalPages: 1, currentPage: 1, pageSize: 20 },
    },
  }

  const tasks = useMemo(() => {
    const allTasks = safeTasksResponse.data?.tasks ?? []
    return buildTaskHierarchy(allTasks)
  }, [safeTasksResponse.data?.tasks])

  const columns = useAllTasksTableColumns({
    filterType,
    allowCellEditing: false,
  })

  const { table, debounceMs } = useDataTable<HierarchicalTask>({
    data: tasks,
    columns,
    pageCount: safeTasksResponse.data?.pagination?.totalPages ?? 1,
    initialState: {
      columnVisibility: {
        content: false,
        instructions: false,
        notes: false,
      },
      sorting: [{ id: 'createdAt', desc: true }],
      columnPinning: { left: ['select', 'id'] },
      pagination: {
        pageIndex: safeTasksResponse.data?.pagination?.currentPage ?? 1,
        pageSize: safeTasksResponse.data?.pagination?.pageSize ?? 20,
      },
    },
    getRowId: (row) => String(row.id ?? 'unknown'),
    shallow: false,
    clearOnDefault: true,
    enableBordered: true,
    enableHeaderPinning: true,
    meta: {
      updateCellValue: () => {},
    },
  })

  if (isLoading) {
    return (
      <Main fixed>
        <div className='flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Quản lý công việc
            </h2>
          </div>
        </div>
        <PageTableSkeleton />
      </Main>
    )
  }

  return (
    <Main fixed>
      <div className='flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Quản lý công việc
          </h2>
        </div>
      </div>
      <div className='flex-1 overflow-hidden py-2'>
        <TasksDataTable
          key={`${filterType}-${teamOptions.length}-${unitOptions.length}-${userOptions.length}`}
          table={table}
          className='h-full'
          isLoading={isFetching}
        >
          <TasksTableActionBar table={table} filterType={filterType} />
          <DataTableToolbar table={table}>
            <TaskSearchInput
              isFiltering={isFiltering}
              debounceMs={debounceMs}
            />
          </DataTableToolbar>
        </TasksDataTable>
      </div>
    </Main>
  )
}
