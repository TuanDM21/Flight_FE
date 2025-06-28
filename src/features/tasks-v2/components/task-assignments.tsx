import { Badge } from '@/components/ui/badge'
import type { Task } from './types'

interface TaskAssignmentsProps {
  task: Task
  onTaskUpdate: (updates: Partial<Task>) => void
}

export function TaskAssignments({ task, onTaskUpdate }: TaskAssignmentsProps) {
  void onTaskUpdate

  return (
    <div className='space-y-4 p-6'>
      <div className='space-y-4'>
        {task.assignments && task.assignments.length > 0 ? (
          <div className='space-y-3'>
            {task.assignments.map((assignment) => (
              <div key={assignment.assignmentId} className='rounded border p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
                      <span className='text-sm font-medium text-blue-700'>
                        {assignment.recipientUser?.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className='font-medium'>
                        {assignment.recipientUser?.name}
                      </div>
                      <div className='text-muted-foreground text-sm'>
                        {assignment.recipientUser?.email}
                      </div>
                    </div>
                  </div>
                  <Badge variant='outline'>{assignment.status}</Badge>
                </div>

                {assignment.dueAt && (
                  <div className='text-muted-foreground mt-2 text-sm'>
                    Due: {new Date(assignment.dueAt).toLocaleDateString()}
                  </div>
                )}

                {assignment.note && (
                  <div className='mt-2 text-sm'>
                    <span className='font-medium'>Note:</span> {assignment.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className='text-muted-foreground py-8 text-center'>
            No assignments for this task
          </div>
        )}
      </div>
    </div>
  )
}
