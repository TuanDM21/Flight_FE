import { Suspense } from 'react'
import { useDataTable } from '@/hooks/use-data-table'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar'
import { DataTableFilterMenu } from '@/components/data-table/data-table-filter-menu'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { Main } from '@/components/layout/main'
import PageTableSkeleton from '@/components/page-table-skeleton'
import { FlightSearchInput } from './components/flight-search-input'
import { FlightStatusFilter } from './components/flight-status-filter'
import { FlightsPrimaryButtons } from './components/flights-primary-buttons'
import { FlightsTableActionBar } from './components/flights-table-action-bar'
import { useFlightsSearchFilter } from './hooks/use-flights-search-filter'
import { useFlightsTableColumns } from './hooks/use-flights-table-columns'

export function FlightsPage() {
  const { filteredData, isFiltering } = useFlightsSearchFilter()
  const columns = useFlightsTableColumns()

  const { table, debounceMs, shallow, throttleMs } = useDataTable({
    data: filteredData,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: 'createdAt', desc: false }],
      columnPinning: { left: ['select'], right: ['actions'] },
    },
    getRowId: (row) => String(row.id ?? 'unknown'),
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <Main fixed>
      <div className='flex h-full flex-col px-4 py-2'>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Quản lý chuyến bay
            </h2>
          </div>
          <FlightsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-hidden py-1'>
          <Suspense fallback={<PageTableSkeleton />}>
            <DataTable table={table} className='h-full'>
              <FlightsTableActionBar table={table} />
              <DataTableAdvancedToolbar table={table}>
                <div className='flex flex-col items-start gap-2'>
                  <FlightStatusFilter />
                  <div className='flex items-center gap-2'>
                    <DataTableSortList table={table} />
                    <DataTableFilterMenu
                      table={table}
                      shallow={shallow}
                      debounceMs={debounceMs}
                      throttleMs={throttleMs}
                    />
                    <FlightSearchInput isFiltering={isFiltering} />
                  </div>
                </div>
              </DataTableAdvancedToolbar>
            </DataTable>
          </Suspense>
        </div>
      </div>
    </Main>
  )
}
