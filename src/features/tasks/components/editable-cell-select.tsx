import { TasksRoute } from '@/routes/_authenticated/tasks'
import { Option } from '@/types/data-table'
import { CellContext } from 'node_modules/@tanstack/table-core/build/lib/core/cell'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EditableCellSelectProps<TData, TValue>
  extends CellContext<TData, TValue> {
  options: Option[]
}

export function EditableCellSelect<TData, TValue>({
  getValue,
  row,
  column,
  table,
  options,
}: EditableCellSelectProps<TData, TValue>) {
  const initialValue = getValue() as string
  const cellWidth = column.getSize()
  const level = (row.original as { level?: number }).level ?? 0
  const searchParams = TasksRoute.useSearch()
  const filterType = searchParams.type
  const isDisabled = level > 0 || filterType === 'received'

  const handleValueChange = (newValue: string) => {
    table.options.meta?.updateCellValue({
      column,
      row,
      value: newValue,
    })
  }

  return (
    <Select
      value={initialValue}
      onValueChange={handleValueChange}
      disabled={isDisabled}
    >
      <SelectTrigger
        className={cn(
          'hover:ring-ring w-full truncate border-0 bg-transparent px-1 py-0 text-left text-sm shadow-none hover:ring-1 focus:ring-0 focus-visible:ring-0',
          isDisabled && 'cursor-not-allowed opacity-50'
        )}
        aria-label={`select-status-${column.id}`}
        style={{ width: cellWidth }}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className='flex flex-col gap-2'>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={cn('cursor-pointer', option.className)}
          >
            <div className='flex items-center gap-2'>
              {option.icon && (
                <option.icon className={cn('h-3 w-3 bg-transparent')} />
              )}
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
