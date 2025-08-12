import { TaskDetailDrawer, TaskRowWithDrag, type Task } from '../components'
import { useTaskDetailDrawer } from '../hooks'

// Example component showing how to use TaskDetailDrawer with TaskRow
export function TasksExample() {
  const { isOpen, taskId, openDrawer, closeDrawer } = useTaskDetailDrawer()

  // Mock tasks data
  const tasks: Task[] = [
    {
      id: '1',
      name: 'Setup project structure',
      status: 'COMPLETE',
      assignees: ['John Doe'],
      dueDate: '2024-01-15',
      priority: 'HIGH',
      comments: 2,
      description:
        'Initialize the project with proper folder structure and dependencies.',
      tags: ['Setup', 'Backend'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-05',
    },
    {
      id: '2',
      name: 'Implement authentication',
      status: 'IN_PROGRESS',
      assignees: ['Jane Smith', 'Bob Wilson'],
      dueDate: '2024-01-20',
      priority: 'MEDIUM',
      comments: 5,
      description:
        'Add user authentication with JWT tokens and role-based access control.',
      tags: ['Auth', 'Security'],
      createdAt: '2024-01-02',
      updatedAt: '2024-01-10',
    },
    {
      id: '3',
      name: 'Design user interface',
      status: 'TO_DO',
      assignees: [],
      priority: 'LOW',
      comments: 0,
      description: 'Create wireframes and mockups for the main user interface.',
      tags: ['Design', 'UI/UX'],
      createdAt: '2024-01-03',
    },
  ]

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        {tasks.map((task) => (
          <TaskRowWithDrag key={task.id} task={task} onTaskClick={openDrawer} />
        ))}
      </div>

      <TaskDetailDrawer isOpen={isOpen} taskId={taskId} onClose={closeDrawer} />
    </div>
  )
}
