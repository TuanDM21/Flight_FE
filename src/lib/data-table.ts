import type { Column } from '@tanstack/react-table'
import { dataTableConfig } from '@/config/data-table'
import type {
  ExtendedColumnFilter,
  FilterOperator,
  FilterVariant,
} from '@/types/data-table'

export function getCommonPinningStyles<TData>({
  column,
}: {
  column: Column<TData>
}): React.CSSProperties {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn =
    isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinnedColumn =
    isPinned === 'right' && column.getIsFirstColumn('right')

  return {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    background: isPinned ? 'var(--background)' : undefined,
    width: `${column.getSize()}px`,
    minWidth: `${column.columnDef.minSize || 50}px`,
    maxWidth: `${column.columnDef.maxSize || 1000}px`,
    zIndex: isPinned ? 2 : 0,
    ...(isLastLeftPinnedColumn
      ? {
          filter: 'drop-shadow(4px 0 8px hsl(0 0% 0% / 0.06))',
          WebkitFilter: 'drop-shadow(4px 0 8px hsl(0 0% 0% / 0.06))',
        }
      : isFirstRightPinnedColumn
        ? {
            filter: 'drop-shadow(-4px 0 8px hsl(0 0% 0% / 0.06))',
            WebkitFilter: 'drop-shadow(-4px 0 8px hsl(0 0% 0% / 0.06))',
          }
        : {}),
  }
}

export function getFilterOperators(filterVariant: FilterVariant) {
  const operatorMap: Record<
    FilterVariant,
    { label: string; value: FilterOperator }[]
  > = {
    text: dataTableConfig.textOperators,
    number: dataTableConfig.numericOperators,
    range: dataTableConfig.numericOperators,
    date: dataTableConfig.dateOperators,
    dateRange: dataTableConfig.dateOperators,
    boolean: dataTableConfig.booleanOperators,
    select: dataTableConfig.selectOperators,
    multiSelect: dataTableConfig.multiSelectOperators,
  }

  return operatorMap[filterVariant] ?? dataTableConfig.textOperators
}

export function getDefaultFilterOperator(filterVariant: FilterVariant) {
  const operators = getFilterOperators(filterVariant)

  return operators[0]?.value ?? (filterVariant === 'text' ? 'iLike' : 'eq')
}

export function getValidFilters<TData>(
  filters: ExtendedColumnFilter<TData>[]
): ExtendedColumnFilter<TData>[] {
  return filters.filter(
    (filter) =>
      filter.operator === 'isEmpty' ||
      filter.operator === 'isNotEmpty' ||
      (Array.isArray(filter.value)
        ? filter.value.length > 0
        : filter.value !== '' &&
          filter.value !== null &&
          filter.value !== undefined)
  )
}
