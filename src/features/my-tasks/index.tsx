import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MyTasksRoute } from '@/routes/_authenticated/tasks/my'
import { toast } from 'sonner'
import { useDataTable } from '@/hooks/use-data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import PageTableSkeleton from '@/components/page-table-skeleton'
import { TaskSearchInput } from '../tasks/components/task-search-input'
import { TasksDataTable } from '../tasks/components/tasks-data-table'
import { TasksPrimaryButtons } from '../tasks/components/tasks-primary-buttons'
import { TasksTableActionBar } from '../tasks/components/tasks-table-action-bar'
import { TasksTypeFilter } from '../tasks/components/tasks-type-filter'
import { subtasksQueryOptions } from '../tasks/hooks/use-subtasks'
import { useTasksTableColumns } from '../tasks/hooks/use-tasks-table-columns'
import { useUpdateTask } from '../tasks/hooks/use-update-task'
import { HierarchicalTask, Task } from '../tasks/types'
import { myTasksQueryOptions } from './hooks/use-my-tasks'

export function MyTasksPage() {
  const searchParams = MyTasksRoute.useSearch()
  const navigate = MyTasksRoute.useNavigate()
  const filterType = searchParams.type
  const isFiltering = searchParams.filters?.length > 0
  const updateTaskMutation = useUpdateTask(filterType)
  const queryClient = useQueryClient()
  const [loadedSubtasks, setLoadedSubtasks] = useState<
    Map<number, HierarchicalTask[]>
  >(new Map())

  // Function to calculate level based on parentId hierarchy
  const calculateLevel = useCallback((task: Task, allTasks: Task[]): number => {
    if (!task.parentId) return 0

    const parent = allTasks.find((t) => t.id === task.parentId)
    if (!parent) return 0

    return calculateLevel(parent, allTasks) + 1
  }, [])

  const {
    data: tasksResponse,
    isLoading,
    isFetching,
  } = useQuery({
    ...myTasksQueryOptions(searchParams),
    placeholderData: (prev) => prev,
  })

  // Fallback for undefined response
  const safeTasksResponse = tasksResponse || {
    data: {
      tasks: [],
      pagination: { totalPages: 1, currentPage: 1, pageSize: 20 },
    },
  }

  const handleToggleSubtasks = useCallback(
    async (taskId: number) => {
      if (!tasksResponse) return

      setLoadedSubtasks((prev) => {
        if (prev.has(taskId)) {
          const newMap = new Map(prev)
          newMap.delete(taskId)
          return newMap
        }
        queryClient
          .fetchQuery(subtasksQueryOptions(taskId))
          .then((subtasksResponse) => {
            const subtasksArray = subtasksResponse.data?.slice(1) || []

            setLoadedSubtasks((current) => {
              // Lấy tất cả tasks hiện có (bao gồm cả loaded subtasks)
              const currentMainTasks = safeTasksResponse.data?.tasks ?? []
              const allLoadedSubtasks = [...current.values()].flat()
              const allTasks = [
                ...currentMainTasks,
                ...allLoadedSubtasks,
                ...subtasksArray,
              ]

              const hierarchicalSubtasks = subtasksArray.map(
                (subtask, index) => ({
                  ...subtask,
                  level: calculateLevel(subtask, allTasks),
                  isLastChild: index === subtasksArray.length - 1,
                })
              )

              return new Map(current).set(taskId, hierarchicalSubtasks)
            })
          })

        return prev
      })
    },
    [queryClient, calculateLevel, safeTasksResponse]
  )

  const tasks = useMemo(() => {
    return (safeTasksResponse.data?.tasks ?? []).flatMap((task) => {
      const subtasks = loadedSubtasks.get(task.id!)
      const hierarchicalTask: HierarchicalTask = {
        ...task,
        level: 0,
        isLastChild: false,
      }
      return subtasks ? [hierarchicalTask, ...subtasks] : [hierarchicalTask]
    })
  }, [safeTasksResponse.data?.tasks, loadedSubtasks])

  const handleTypeChange = useCallback(
    (type: string) => {
      navigate({
        search: (prev: any) => {
          const { keyword, ...rest } = prev
          return {
            ...rest,
            type: type,
          }
        },
      })
    },
    [navigate]
  )

  const columns = useTasksTableColumns({
    onToggleSubtasks: handleToggleSubtasks,
    allowCellEditing: true,
    filterType,
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
      updateCellValue: ({ row, column, value }) => {
        const taskId = row.id
        const key = column.id

        const updateTaskPromise = updateTaskMutation.mutateAsync({
          params: {
            path: { id: Number(taskId) },
          },
          body: { [key]: value },
        })

        toast.promise(updateTaskPromise, {
          loading: 'Đang cập nhật công việc...',
          success: 'Cập nhật công việc thành công',
          error: (error) => error.message,
        })
      },
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
          <TasksPrimaryButtons filterType={filterType} />
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
        <TasksPrimaryButtons filterType={filterType} />
      </div>
      <div className='flex-1 overflow-hidden py-2'>
        <TasksDataTable table={table} className='h-full' isLoading={isFetching}>
          <TasksTableActionBar table={table} filterType={filterType} />
          <DataTableToolbar table={table}>
            <TasksTypeFilter
              filterType={filterType}
              onTypeChange={handleTypeChange}
            />
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
