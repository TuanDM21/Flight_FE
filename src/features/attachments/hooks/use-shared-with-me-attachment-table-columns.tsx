import { differenceInMinutes, format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { dateFormatPatterns } from '@/config/date'
import {
  Clock,
  Users,
  Hash,
  FileText,
  Calendar,
  User,
  BarChart3,
  HardDrive,
} from 'lucide-react'
import { formatFileSize } from '@/lib/format'
import { useFileIconType } from '@/hooks/use-file-icon-type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { SharedWithMeAttachmentItem } from '../types'
import {
  getBadgeClasses,
  getIconSize,
  getTooltipText,
} from '../utils/attachments'

function FileNameCell({ fileName }: { fileName: string | undefined }) {
  const { getFileIcon } = useFileIconType()

  return (
    <div className='flex w-full items-center gap-2'>
      {fileName ? getFileIcon(fileName) : <div className='h-4 w-4' />}
      <span className='flex-1 truncate font-medium'>
        {fileName || 'Tệp không xác định'}
      </span>
    </div>
  )
}

function FileExtensionCell({ fileName }: { fileName: string | undefined }) {
  if (!fileName) {
    return <span className='text-muted-foreground'>-</span>
  }

  const extension = fileName.split('.').pop()?.toLowerCase() || ''

  if (!extension) {
    return <span className='text-muted-foreground'>-</span>
  }

  return (
    <span className='inline-flex h-6 min-w-[44px] items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 uppercase'>
      {extension}
    </span>
  )
}
const getInitialCharacter = (name: string) => {
  return name ? name.charAt(0).toUpperCase() : 'U'
}

function SharedByCell({
  sharedBy,
}: {
  sharedBy?: SharedWithMeAttachmentItem['sharedBy']
}) {
  if (!sharedBy) {
    return <span className='text-muted-foreground'>Không xác định</span>
  }

  return (
    <div className='flex items-center gap-2'>
      <Avatar className='h-6 w-6'>
        <AvatarImage src='' alt={sharedBy.name} />
        <AvatarFallback className='text-xs'>
          {getInitialCharacter(sharedBy.name)}
        </AvatarFallback>
      </Avatar>
      <div className='min-w-0 flex-1'>
        <div className='truncate text-sm font-medium'>{sharedBy.name}</div>
        <div className='text-muted-foreground truncate text-xs'>
          {sharedBy.email}
        </div>
      </div>
    </div>
  )
}

function SharedCountCell({ sharedCount }: { sharedCount?: number }) {
  const count = sharedCount || 0

  return (
    <div className='flex items-center justify-center'>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={getBadgeClasses(count)}
            aria-label={getTooltipText(count)}
          >
            <Users className={getIconSize(count)} />
            <span>{count}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side='top' className='font-medium'>
          <p>{getTooltipText(count)}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export const useSharedWithMeAttachmentTableColumns =
  (): ColumnDef<SharedWithMeAttachmentItem>[] => {
    const baseColumns: ColumnDef<SharedWithMeAttachmentItem>[] = [
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
          return <span className='h-auto p-0'>#{attachmentId ?? 'N/A'}</span>
        },
      },
      {
        id: 'fileName',
        accessorKey: 'fileName',
        enableColumnFilter: true,
        meta: {
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
          label: 'Kích thước tệp',
          placeholder: 'Lọc theo kích thước tệp...',
          variant: 'number',
          icon: HardDrive,
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Kích thước' />
        ),
        cell: ({ row }) => {
          const size = row.getValue<number>('fileSize') || 0
          return (
            <span className='text-muted-foreground text-sm'>
              {formatFileSize(size)}
            </span>
          )
        },
      },
      {
        id: 'sharedAt',
        accessorKey: 'sharedAt',
        size: 40,
        meta: {
          label: 'Ngày chia sẻ',
          placeholder: 'Lọc theo ngày chia sẻ...',
          variant: 'date',
          icon: Calendar,
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Ngày chia sẻ' />
        ),
        cell: ({ row }) => {
          const dateValue = row.getValue<string>('sharedAt')
          if (!dateValue)
            return <span className='text-muted-foreground'>-</span>

          const date = new Date(dateValue)
          const now = new Date()
          const isRecent = differenceInMinutes(now, date) <= 5

          return (
            <div className='bg-muted inline-flex items-center rounded px-2 py-1 text-xs whitespace-nowrap'>
              <span
                className={`text-sm ${isRecent ? 'font-medium text-green-600' : ''}`}
              >
                {isRecent && <Clock className='mr-1 inline-block h-4 w-4' />}
                {format(date, dateFormatPatterns.fullDate)}
                {isRecent && ' (Mới)'}
              </span>
            </div>
          )
        },
      },
    ]

    const optionalColumns: ColumnDef<SharedWithMeAttachmentItem>[] = [
      // File type column
      {
        id: 'fileType',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Loại tệp' />
        ),
        cell: ({ row }) => {
          const fileName = row.getValue<string>('fileName')
          return <FileExtensionCell fileName={fileName} />
        },
        size: 80,
      },
      // Shared by column
      {
        id: 'sharedBy',
        accessorKey: 'sharedBy',
        size: 150,
        enableColumnFilter: true,
        meta: {
          label: 'Người chia sẻ',
          placeholder: 'Tìm kiếm theo người...',
          variant: 'text',
          icon: User,
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Được chia sẻ bởi' />
        ),
        cell: ({ row }) => {
          const sharedBy = row.original.sharedBy
          return <SharedByCell sharedBy={sharedBy} />
        },
      },
      // Shared count column
      {
        id: 'sharedCount',
        accessorKey: 'sharedCount',
        size: 50,
        meta: {
          label: 'Số lượng chia sẻ',
          placeholder: 'Lọc theo số lượng chia sẻ...',
          variant: 'number',
          icon: BarChart3,
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Số lượng chia sẻ' />
        ),
        cell: ({ row }) => {
          const sharedCount = row.original.sharedCount
          return <SharedCountCell sharedCount={sharedCount} />
        },
      },
    ]

    return [...baseColumns, ...optionalColumns]
  }
