import type * as React from 'react'
import { type Table as TanstackTable, flexRender } from '@tanstack/react-table'
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
}

export function TasksDataTable<TData>({
  table,
  actionBar,
  children,
  className,
  ...props
}: TasksDataTableProps<TData>) {
  return (
    <EditingProvider>
      <div
        className={cn('flex h-full w-full flex-col gap-2.5', className)}
        {...props}
      >
        {children}
        <div className='overflow-hidden rounded-md border'>
          <div className='max-h-full overflow-y-auto'>
            <Table className='w-full'>
              <TableHeader
                className={cn('bg-background', {
                  'sticky top-0 z-4': table.options.enableHeaderPinning,
                  // Add subtle bottom shadow for sticky header
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
                            className={cn({
                              'border-r':
                                table.options.enableBordered &&
                                (!isPinned || isLastLeftPinned),
                              'border-l':
                                table.options.enableBordered &&
                                isFirstRightPinned,
                            })}
                            style={{
                              ...getCommonPinningStyles({
                                column: header.column,
                              }),
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
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
                          level > 0 &&
                            'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
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
                              className={cn('px-2 py-1', {
                                'border-r':
                                  table.options.enableBordered &&
                                  (!isPinned || isLastLeftPinned),
                                'border-l':
                                  table.options.enableBordered &&
                                  isFirstRightPinned,
                              })}
                              style={{
                                ...getCommonPinningStyles({
                                  column: cell.column,
                                }),
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
                      colSpan={table.getAllColumns().length}
                      className='h-24 text-center'
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
