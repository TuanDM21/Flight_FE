import { Badge } from '@/components/ui/badge'
import type { Task } from './types'

interface TaskSubtasksProps {
  task: Task
  onTaskUpdate: (updates: Partial<Task>) => void
}

export function TaskSubtasks({ task, onTaskUpdate }: TaskSubtasksProps) {
  const handleSubtaskStatusChange = (subtaskId: number, checked: boolean) => {
    const updatedSubtasks = task.subtasks.map((sub) =>
      sub.id === subtaskId
        ? {
            ...sub,
            status: (checked ? 'COMPLETED' : 'OPEN') as Task['status'],
          }
        : sub
    )
    onTaskUpdate({ subtasks: updatedSubtasks })
  }

  return (
    <div className='space-y-4 p-6'>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-medium'>Subtasks</h3>
          <button className='text-sm text-blue-600 hover:text-blue-800'>
            + Add Subtask
          </button>
        </div>

        {task.subtasks && task.subtasks.length > 0 ? (
          <div className='space-y-3'>
            {task.subtasks.map((subtask) => (
              <div key={subtask.id} className='rounded border p-4'>
                <div className='flex items-start gap-3'>
                  <input
                    type='checkbox'
                    checked={subtask.status === 'COMPLETED'}
                    onChange={(e) => {
                      handleSubtaskStatusChange(subtask.id, e.target.checked)
                    }}
                    className='mt-1 h-4 w-4'
                  />
                  <div className='flex-1'>
                    <div
                      className={`font-medium ${
                        subtask.status === 'COMPLETED'
                          ? 'text-muted-foreground line-through'
                          : ''
                      }`}
                    >
                      {subtask.title}
                    </div>
                    {subtask.content && (
                      <div className='text-muted-foreground mt-1 text-sm'>
                        {subtask.content}
                      </div>
                    )}
                    <div className='mt-2 flex items-center gap-2'>
                      <Badge variant='outline' className='text-xs'>
                        {subtask.status}
                      </Badge>
                      <Badge variant='secondary' className='text-xs'>
                        {subtask.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-muted-foreground py-8 text-center'>
            No subtasks for this task
          </div>
        )}
      </div>
    </div>
  )
}
