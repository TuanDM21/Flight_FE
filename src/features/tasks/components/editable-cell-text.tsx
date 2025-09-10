import { useEffect, useState } from 'react'
import { CellContext } from 'node_modules/@tanstack/table-core/build/lib/core/cell'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEditing } from '../context/editing-context'

interface EditableCellTextProps<TData, TValue>
  extends CellContext<TData, TValue> {
  filterType?: string
  allowCellEditing: boolean
}

export function EditableCellText<TData, TValue>({
  getValue,
  row,
  column,
  table,
  filterType,
  allowCellEditing,
}: EditableCellTextProps<TData, TValue>) {
  const { setEditingCellId, isAnyEditing } = useEditing()
  const initialValue = getValue() as string
  const cellId = `${row.id}-${column.id}`

  const level = (row.original as { level?: number }).level ?? 0
  const isDisabled = !allowCellEditing || level > 0 || filterType === 'received'

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
            'hover:ring-ring mr-2 w-full truncate border-0 bg-transparent px-1 py-0 text-sm shadow-none hover:ring-1 focus-visible:ring-[1px]',
            isDisabled && 'cursor-not-allowed opacity-60'
          )}
          aria-label='editable-text-input'
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onClick={() => setEditingCellId(cellId)}
        />
      </TooltipTrigger>
      <TooltipContent className='max-w-xs break-words whitespace-pre-wrap'>
        {value}
      </TooltipContent>
    </Tooltip>
  )
}
