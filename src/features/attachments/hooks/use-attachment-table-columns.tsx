import { differenceInMinutes, format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { dateFormatPatterns } from '@/config/date'
import { Calendar, FileText, HardDrive, Hash } from 'lucide-react'
import { formatFileSize } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { AttachmentRowActions } from '../components/attachment-row-actions'
import { FileExtensionCell } from '../components/file-extension-cell'
import { FileNameCell } from '../components/file-name-cell'
import { AttachmentItem } from '../types'

interface UseAttachmentTableColumnsOptions {
  showColumns?: {
    actions?: boolean
  }
}

export const useAttachmentTableColumns = (
  options: UseAttachmentTableColumnsOptions = {}
): ColumnDef<AttachmentItem>[] => {
  const {
    showColumns = {
      actions: true,
    },
  } = options

  const baseColumns: ColumnDef<AttachmentItem>[] = [
    // Always show: select, id, fileName, fileSize, uploadDate
    {
      id: 'select',
      size: 32,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
          }}
          aria-label='Chọn tất cả'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value)
          }}
          aria-label='Chọn hàng'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'id',
      accessorKey: 'id',
      size: 40,
      enableColumnFilter: true,
      meta: {
        className: '',
        label: 'Mã đính kèm',
        placeholder: 'Tìm kiếm mã đính kèm...',
        variant: 'text',
        icon: Hash,
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Mã đính kèm' />
      ),
      cell: ({ cell }) => {
        const attachmentId = cell.getValue<number>()
        return (
          <Button size='sm' className='h-auto p-0' variant='link'>
            #{attachmentId ?? 'N/A'}
          </Button>
        )
      },
    },
    {
      id: 'fileName',
      accessorKey: 'fileName',
      enableColumnFilter: true,
      meta: {
        className: '',
        label: 'Tên tệp',
        placeholder: 'Tìm kiếm tên tệp...',
        variant: 'text',
        icon: FileText,
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tên tệp' />
      ),
      cell: ({ row }) => <FileNameCell fileName={row.getValue('fileName')} />,
      minSize: 200,
    },
    {
      id: 'fileSize',
      accessorKey: 'fileSize',
      size: 40,
      meta: {
        className: '',
        label: 'Kích thước tệp',
        placeholder: 'Lọc theo kích thước tệp...',
        variant: 'number',
        icon: HardDrive,
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Kích thước' />
      ),
      cell: ({ row }) => {
        const size = row.getValue('fileSize') || 0
        return (
          <span className='text-muted-foreground text-sm'>
            {formatFileSize(size)}
          </span>
        )
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      size: 40,
      meta: {
        className: '',
        label: 'Ngày tải lên',
        placeholder: 'Lọc theo ngày tải lên...',
        variant: 'date',
        icon: Calendar,
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ngày tải lên' />
      ),
      cell: ({ row }) => {
        const dateValue = row.getValue<string>('createdAt')
        if (!dateValue) return <span className='text-muted-foreground'>-</span>

        const date = new Date(dateValue)
        const now = new Date()
        const isRecent = differenceInMinutes(now, date) <= 5

        return (
          <div className='inline-flex items-center rounded px-2 py-1 text-xs whitespace-nowrap'>
            <span
              className={`text-sm ${isRecent ? 'font-medium text-green-600' : ''}`}
            >
              {format(date, dateFormatPatterns.fullDate)}
              {isRecent && ' (Mới)'}
            </span>
          </div>
        )
      },
    },
  ]

  const optionalColumns: ColumnDef<AttachmentItem>[] = []

  optionalColumns.push({
    id: 'fileType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Loại tệp' />
    ),
    cell: ({ row }) => {
      const fileName = row.getValue('fileName')
      return <FileExtensionCell fileName={fileName} />
    },
    size: 80,
  })

  // Add actions column if enabled
  if (showColumns.actions) {
    optionalColumns.push({
      id: 'actions',
      size: 20,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Hành động' />
      ),
      cell: ({ row }) => {
        const attachment = row.original
        return <AttachmentRowActions attachment={attachment} />
      },
    })
  }

  return [...baseColumns, ...optionalColumns]
}
