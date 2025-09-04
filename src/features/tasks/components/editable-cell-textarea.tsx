import { useEffect, useState } from 'react'
import { TasksRoute } from '@/routes/_authenticated/tasks'
import { CellContext } from 'node_modules/@tanstack/table-core/build/lib/core/cell'
import { cn } from '@/lib/utils'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { useEditing } from '../context/editing-context'

interface EditableCellTextareaProps<TData, TValue>
  extends CellContext<TData, TValue> {
  maxLength?: number
}

export function EditableCellTextarea<TData, TValue>({
  getValue,
  row,
  column,
  table,
  maxLength,
}: EditableCellTextareaProps<TData, TValue>) {
  const { editingCellId, setEditingCellId, isAnyEditing } = useEditing()
  const [isHoverOpen, setIsHoverOpen] = useState(false)

  const initialValue = getValue() as string
  const cellWidth = column.getSize()
  const [value, setValue] = useState(initialValue)

  const cellId = `${row.id}-${column.id}`
  const isOpen = editingCellId === cellId

  const level = (row.original as { level?: number }).level ?? 0
  const searchParams = TasksRoute.useSearch()
  const filterType = searchParams.type
  const isDisabled = level > 0 || filterType === 'received'

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    const len = textarea.value.length
    textarea.setSelectionRange(len, len)
  }

  const handleSave = () => {
    // Không cho phép save nếu disabled
    if (isDisabled) return

    if (value === initialValue) return
    table.options.meta?.updateCellValue({
      column,
      row,
      value,
    })
    setEditingCellId(null)
  }
  const handleCancel = () => {
    setValue(initialValue)
    setEditingCellId(null)
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDisabled) return

    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  return (
    <HoverCard
      openDelay={300}
      closeDelay={0}
      open={isHoverOpen && !isAnyEditing && !!value.trim()}
      onOpenChange={(open) => {
        // Only allow opening when not editing and has content
        if (!isAnyEditing && value.trim()) {
          setIsHoverOpen(open)
        }
      }}
    >
      <Popover
        open={isOpen && !isDisabled}
        onOpenChange={(open) => {
          if (!isDisabled) {
            setEditingCellId(open ? cellId : null)
          }
        }}
      >
        <HoverCardTrigger asChild>
          <PopoverTrigger asChild>
            <Input
              value={value}
              readOnly={isDisabled}
              className={cn(
                'hover:ring-ring w-full truncate border-0 bg-transparent px-1 py-0 text-left text-sm shadow-none hover:ring-1 focus-visible:ring-[1px]',
                isDisabled && 'cursor-not-allowed opacity-60'
              )}
              style={{ width: cellWidth }}
              aria-label='editable-text-input'
              onChange={(e) => !isDisabled && setValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
            />
          </PopoverTrigger>
        </HoverCardTrigger>

        {/* HoverCard Content - Shows on hover */}
        <HoverCardContent
          className={cn('max-h-60 w-80 max-w-sm overflow-y-auto p-3')}
          style={{
            width: `${cellWidth}px`,
            maxWidth: `${cellWidth}px`,
          }}
          side='top'
          align='start'
        >
          <div className='text-sm'>
            <p className='break-words whitespace-pre-wrap'>{value}</p>
          </div>
        </HoverCardContent>

        {/* Popover Content - Shows on click for editing */}
        <PopoverContent
          className={cn('h-42 min-h-42 p-0 pt-1 pr-1')}
          style={{
            width: `${cellWidth}px`,
            minWidth: `${cellWidth}px`,
            maxWidth: `${cellWidth}px`,
          }}
          align='start'
          sideOffset={-32}
        >
          <div className='flex size-full flex-col'>
            <Textarea
              value={value}
              readOnly={isDisabled}
              onChange={(e) => !isDisabled && setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleSave}
              autoFocus
              className={cn(
                'flex-grow-1 resize-none border-none px-1 pt-0 pb-1 text-sm shadow-none outline-0 focus-visible:ring-0',
                isDisabled && 'cursor-not-allowed opacity-60'
              )}
              maxLength={maxLength}
            />
            <div
              className={cn(
                'flex h-6 flex-shrink-0 items-center justify-between px-2'
              )}
            >
              {maxLength && (
                <div className='text-muted-foreground text-xs'>
                  {value?.length}/{maxLength}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </HoverCard>
  )
}
