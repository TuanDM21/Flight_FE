import { useEffect, useState } from 'react'
import { TasksRoute } from '@/routes/_authenticated/tasks'
import { CellContext } from 'node_modules/@tanstack/table-core/build/lib/core/cell'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEditing } from '../context/editing-context'

export function EditableCellText<TData, TValue>({
  getValue,
  row,
  column,
  table,
}: CellContext<TData, TValue>) {
  const { setEditingCellId, isAnyEditing } = useEditing()
  const initialValue = getValue() as string
  const cellWidth = column.getSize()
  const cellId = `${row.id}-${column.id}`

  const level = (row.original as { level?: number }).level ?? 0
  const searchParams = TasksRoute.useSearch()
  const filterType = searchParams.type
  const isDisabled = level > 0 || filterType === 'received'

  const [isHoverOpen, setIsHoverOpen] = useState(false)
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleSave = () => {
    setEditingCellId(null)
    if (value === initialValue) return

    table.options.meta?.updateCellValue({
      column,
      row,
      value,
    })
  }

  const handleCancel = () => {
    setValue(initialValue)
    setEditingCellId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  return (
    <Tooltip
      delayDuration={400}
      open={isHoverOpen && !isAnyEditing}
      onOpenChange={(open) => {
        if (!isAnyEditing) {
          setIsHoverOpen(open)
        }
      }}
    >
      <TooltipTrigger asChild>
        <Input
          value={value}
          readOnly={isDisabled}
          className={cn(
            'hover:ring-ring w-full truncate border-0 bg-transparent px-1 py-0 text-sm shadow-none hover:ring-1 focus-visible:ring-[1px]',
            isDisabled && 'cursor-not-allowed opacity-60'
          )}
          style={{ width: cellWidth }}
          aria-label='editable-text-input'
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onClick={() => setEditingCellId(cellId)}
        />
      </TooltipTrigger>
      <TooltipContent
        className='break-words whitespace-pre-wrap'
        style={{ maxWidth: cellWidth }}
      >
        {value}
      </TooltipContent>
    </Tooltip>
  )
}
