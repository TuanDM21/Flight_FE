import { TasksRoute } from '@/routes/_authenticated/tasks'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { TaskFilterTypes } from '@/features/tasks/types'

export function TasksTypeFilter() {
  const searchParams = TasksRoute.useSearch()
  const navigate = TasksRoute.useNavigate()
  const filterType = searchParams.type

  const onTypeChange = (type: TaskFilterTypes) => {
    if (type === filterType) return

    navigate({
      search: (prev: any) => ({
        ...prev,
        type: type,
      }),
    })
  }

  return (
    <div className='flex w-fit items-center gap-2 rounded-lg border pl-2'>
      <div className='flex items-center gap-2'>
        <label className='text-muted-foreground text-xs font-medium'>
          Lọc theo
        </label>
        <div className='bg-border h-8 w-px' />
      </div>
      <ToggleGroup
        type='single'
        value={filterType}
        onValueChange={onTypeChange}
        className='h-9 justify-start'
      >
        <ToggleGroupItem value='assigned' aria-label='Nhiệm vụ được giao'>
          Đã giao
        </ToggleGroupItem>
        <ToggleGroupItem value='created' aria-label='Nhiệm vụ đã tạo'>
          Đã tạo
        </ToggleGroupItem>
        <ToggleGroupItem value='received' aria-label='Nhiệm vụ đã nhận'>
          Đã nhận
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
