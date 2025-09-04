import { Suspense, useCallback, useMemo, useState } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { TasksRoute } from '@/routes/_authenticated/tasks'
import { toast } from 'sonner'
import { useDataTable } from '@/hooks/use-data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { TaskSearchInput } from './components/task-search-input'
import { TasksDataTable } from './components/tasks-data-table'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksTableActionBar } from './components/tasks-table-action-bar'
import { TasksTypeFilter } from './components/tasks-type-filter'
import { subtasksQueryOptions } from './hooks/use-subtasks'
import { tasksQueryOptions } from './hooks/use-tasks'
import { useTasksTableColumns } from './hooks/use-tasks-table-columns'
import { useUpdateTask } from './hooks/use-update-task'
import { HierarchicalTask, Task } from './types'

export function TasksPage() {
  const searchParams = TasksRoute.useSearch()
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

  const { data: tasksResponse } = useSuspenseQuery(
    tasksQueryOptions(searchParams)
  )

  const handleToggleSubtasks = useCallback(
    async (taskId: number) => {
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
              const currentMainTasks = tasksResponse.data?.tasks ?? []
              const allLoadedSubtasks = Array.from(current.values()).flat()
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
    [queryClient, calculateLevel, tasksResponse.data?.tasks]
  )
  const tasks = useMemo(() => {
    return (tasksResponse.data?.tasks ?? []).flatMap((task) => {
      const subtasks = loadedSubtasks.get(task.id!)
      const hierarchicalTask: HierarchicalTask = {
        ...task,
        level: 0,
        isLastChild: false,
      }
      return subtasks ? [hierarchicalTask, ...subtasks] : [hierarchicalTask]
    })
  }, [tasksResponse.data, loadedSubtasks])

  const columns = useTasksTableColumns({
    onToggleSubtasks: handleToggleSubtasks,
  })

  const { table, debounceMs } = useDataTable<HierarchicalTask>({
    data: tasks,
    columns,
    pageCount: tasksResponse.data?.pagination?.totalPages ?? 1,
    initialState: {
      columnVisibility: {
        content: false,
        instructions: false,
        notes: false,
      },
      sorting: [{ id: 'createdAt', desc: true }],
      columnPinning: { left: ['select', 'id'] },
      pagination: {
        pageIndex: tasksResponse.data?.pagination?.currentPage ?? 1,
        pageSize: tasksResponse.data?.pagination?.pageSize ?? 20,
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

  return (
    <Main fixed>
      <div className='flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Quản lý công việc
          </h2>
        </div>
        <TasksPrimaryButtons />
      </div>
      <div className='flex-1 overflow-hidden py-2'>
        <Suspense fallback={<div>Loading...</div>}>
          <TasksDataTable key={filterType} table={table} className='h-full'>
            <TasksTableActionBar table={table} />
            <DataTableToolbar table={table}>
              <TasksTypeFilter />
              <TaskSearchInput
                isFiltering={isFiltering}
                debounceMs={debounceMs}
              />
            </DataTableToolbar>
          </TasksDataTable>
        </Suspense>
      </div>
    </Main>
  )
}
