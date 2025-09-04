declare module '@tanstack/table-core' {
  export interface CoreOptions<TData extends RowData> {
    enableBordered?: boolean
    enableHeaderPinning?: boolean
  }
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateCellValue: <TData extends RowData, TValue>({
      rowIndex,
      column,
      value,
    }: {
      column: Column<TData, TValue>
      row: Row<TData>
      value: string | number
    }) => void
  }

  export interface ColumnFiltersColumnDef<TData extends RowData> {
    isFilterVisibleOnly?: boolean
  }
}

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidatesQuery?: QueryKey
    }
  }
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export {}
