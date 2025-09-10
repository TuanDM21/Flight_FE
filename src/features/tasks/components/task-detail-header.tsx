import { Link } from '@tanstack/react-router'
import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TaskDetailHeaderProps {
  taskId: number
  onDelete: () => void
}

export function TaskDetailHeader({ taskId, onDelete }: TaskDetailHeaderProps) {
  return (
    <div className='mb-4 flex items-center justify-between'>
      <div className='flex items-center space-x-4'>
        <div>
          <h1 className='text-2xl font-bold'>Công việc #{taskId}</h1>
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        <Button variant='outline' asChild className='space-x-1'>
          <Link
            to='/tasks/$task-id/edit'
            params={{
              'task-id': taskId.toString(),
            }}
          >
            <Edit className='mr-2 h-4 w-4' />
            Chỉnh sửa
          </Link>
        </Button>
        <Button variant='destructive' className='space-x-1' onClick={onDelete}>
          <Trash2 className='mr-2 h-4 w-4' />
          Xóa
        </Button>
      </div>
    </div>
  )
}
