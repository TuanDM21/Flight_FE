import type * as React from 'react'
import { type Table as TanstackTable, flexRender } from '@tanstack/react-table'
import { LoaderIcon } from 'lucide-react'
import { getCommonPinningStyles } from '@/lib/data-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { EditingProvider } from '../context/editing-context'

interface TasksDataTableProps<TData> extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>
  actionBar?: React.ReactNode
  isLoading?: boolean
}

export function TasksDataTable<TData>({
  table,
  actionBar,
  children,
  className,
  isLoading = false,
  ...props
}: TasksDataTableProps<TData>) {
  return (
    <EditingProvider>
      <div
        className={cn(
          'relative flex h-full w-full flex-col gap-2.5',
          className
        )}
        {...props}
      >
        {children}
        <div className='overflow-hidden rounded-md border'>
          <div className='max-h-full overflow-y-auto'>
            <Table
              className='min-w-full table-fixed'
              style={{
                width: table.getCenterTotalSize(),
              }}
            >
              <TableHeader
                className={cn('bg-background', {
                  'sticky top-0 z-4': table.options.enableHeaderPinning,
                  'shadow-[0_2px_8px_rgba(0,0,0,0.06)]':
                    table.options.enableHeaderPinning,
                  'border-border/50 border-b':
                    table.options.enableHeaderPinning,
                })}
              >
                {table.getHeaderGroups().map((headerGroup) => {
                  return (
                    <TableRow
                      key={headerGroup.id}
                      className={cn({
                        'border-b last:border-r-0':
                          table.options.enableBordered,
                      })}
                    >
                      {headerGroup.headers.map((header) => {
                        const isPinned = header.column.getIsPinned()
                        const {
                          columnDef: { isFilterVisibleOnly = false },
                        } = header.column
                        if (isFilterVisibleOnly) return null

                        const isLastLeftPinned =
                          isPinned === 'left' &&
                          header.column.getIsLastColumn('left')
                        const isFirstRightPinned =
                          isPinned === 'right' &&
                          header.column.getIsFirstColumn('right')

                        return (
                          <TableHead
                            key={header.id}
                            colSpan={header.colSpan}
                            className={cn(
                              'group/head relative select-none last:[&>.cursor-col-resize]:opacity-0',
                              {
                                'border-r':
                                  table.options.enableBordered &&
                                  (!isPinned || isLastLeftPinned),
                                'border-l':
                                  table.options.enableBordered &&
                                  isFirstRightPinned,
                              }
                            )}
                            style={{
                              ...getCommonPinningStyles({
                                column: header.column,
                              }),
                              width: header.getSize(),
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                            {header.column.getCanResize() && (
                              <div
                                {...{
                                  onDoubleClick: () =>
                                    header.column.resetSize(),
                                  onMouseDown: header.getResizeHandler(),
                                  onTouchStart: header.getResizeHandler(),
                                  className: cn(
                                    'group-last/head:hidden absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -right-2 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:bg-border before:translate-x-px hover:before:bg-primary hover:before:w-0.5 transition-all duration-200',
                                    header.column.getIsResizing() &&
                                      'before:!bg-primary before:!w-0.5'
                                  ),
                                }}
                              />
                            )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  )
                })}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => {
                    const task = row.original as any
                    const level = ('level' in task && task.level) || 0

                    return (
                      <TableRow
                        key={row.id}
                        data-state={
                          row.getIsSelected() && level === 0 && 'selected'
                        }
                        className={cn(
                          'min-h-[48px]',
                          level > 0 && 'hover:bg-accent'
                        )}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const {
                            columnDef: { isFilterVisibleOnly = false },
                          } = cell.column
                          if (isFilterVisibleOnly) return null

                          const isPinned = cell.column.getIsPinned()
                          const isLastLeftPinned =
                            isPinned === 'left' &&
                            cell.column.getIsLastColumn('left')
                          const isFirstRightPinned =
                            isPinned === 'right' &&
                            cell.column.getIsFirstColumn('right')

                          return (
                            <TableCell
                              key={cell.id}
                              className={cn('relative', {
                                'border-r':
                                  table.options.enableBordered &&
                                  (!isPinned || isLastLeftPinned),
                                'border-l':
                                  table.options.enableBordered &&
                                  isFirstRightPinned,
                                'pr-4': cell.column.getCanResize(),
                              })}
                              style={{
                                ...getCommonPinningStyles({
                                  column: cell.column,
                                }),
                                width: cell.column.getSize(),
                              }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={
                        table
                          .getVisibleFlatColumns()
                          .filter((col) => !col.columnDef.isFilterVisibleOnly)
                          .length
                      }
                      className='h-24 text-center'
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Loading overlay */}
          {isLoading && (
            <>
              {/* Overlay background */}
              <div className='bg-background/50 absolute inset-0 z-40' />

              {/* Loading indicator */}
              <div className='absolute inset-0 z-50 flex items-center justify-center'>
                <div className='bg-background flex items-center gap-2 rounded-lg border px-4 py-2 shadow-lg'>
                  <LoaderIcon className='animate-spin' />
                  <span className='text-muted-foreground text-sm'>
                    Đang tải...
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className='flex flex-col gap-2.5'>
          <DataTablePagination table={table} />
          {actionBar &&
            table.getFilteredSelectedRowModel().rows.length > 0 &&
            actionBar}
        </div>
      </div>
    </EditingProvider>
  )
}
