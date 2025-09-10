import { FunnelIcon } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { TaskFilterTypes } from '@/features/tasks/types'

interface TasksTypeFilterProps {
  filterType: TaskFilterTypes
  onTypeChange: (type: TaskFilterTypes) => void
}

export function TasksTypeFilter({
  filterType,
  onTypeChange,
}: TasksTypeFilterProps) {
  const handleTypeChange = (type: TaskFilterTypes) => {
    if (type === filterType) return
    onTypeChange(type)
  }

  return (
    <div className='flex w-fit items-center gap-2 rounded-lg border pl-2'>
      <div className='flex items-center gap-2'>
        <FunnelIcon
          className='text-muted-foreground h-4 w-4'
          aria-label='Lọc theo loại công việc'
        />
        <div className='bg-border h-6 w-px' />
      </div>
      <ToggleGroup
        type='single'
        variant='outline'
        value={filterType}
        onValueChange={handleTypeChange}
      >
        <ToggleGroupItem value='assigned' aria-label='Công việc được giao'>
          Đã giao
        </ToggleGroupItem>
        <ToggleGroupItem value='created' aria-label='Công việc đã tạo'>
          Chưa giao
        </ToggleGroupItem>
        <ToggleGroupItem value='received' aria-label='Công việc đã nhận'>
          Đã nhận
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
