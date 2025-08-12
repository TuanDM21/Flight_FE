import { useState, useRef } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react'
import { useClickAway } from 'react-use'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AssigneePopover } from './assignee-popover'
import { DueDatePopover } from './due-date-popover'
import { PriorityPopover } from './priority-popover'
import { StatusPopover } from './status-popover'
import type { Task } from './types'

interface TaskListProps {
  tasks: Task[]
  onTaskClick?: (taskId: number) => void
  groupByStatus?: boolean
  onTaskUpdate?: (taskId: number, updates: Partial<Task>) => void
  onTaskCreate?: (title: string, status?: Task['status']) => void
}

const statusConfig = {
  COMPLETED: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: '✓',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800',
    icon: '●',
  },
  OPEN: {
    label: 'Open',
    color: 'bg-gray-100 text-gray-800',
    icon: '○',
  },
}

interface TaskTitleProps {
  title: string
  taskId: number
  onTitleSave: (value: string) => void
  onTaskClick: (taskId: number) => void
}

function TaskTitle({
  title,
  taskId,
  onTitleSave,
  onTaskClick,
}: TaskTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(title)
  const [isHovered, setIsHovered] = useState(false)
  const editRef = useRef<HTMLDivElement>(null)

  const handleSave = () => {
    if (editValue.trim() && editValue !== title) {
      onTitleSave(editValue.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(title)
    setIsEditing(false)
    setIsHovered(false)
  }

  useClickAway(editRef, () => {
    if (isEditing) {
      handleCancel()
    }
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div ref={editRef} className='flex items-center gap-2'>
        <Input
          type='text'
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          className='flex-1 rounded border border-blue-500 px-2 py-1 leading-normal font-medium focus:border-blue-500 focus:outline-none'
          autoFocus
        />
        <div className='h-6 w-6' />
      </div>
    )
  }

  return (
    <div
      className='flex items-center gap-2'
      onMouseEnter={() => {
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
      }}
    >
      <span
        onClick={() => {
          setIsEditing(true)
        }}
        className={`flex-1 cursor-pointer rounded border px-2 py-1 text-left leading-normal font-medium transition-all ${
          isHovered ? 'border-gray-300 bg-gray-50' : 'border-transparent'
        }`}
      >
        {title}
      </span>
      <Button
        variant='secondary'
        size='icon'
        onClick={() => {
          onTaskClick(taskId)
        }}
        className={`size-4 rounded transition-all ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <ExternalLink />
      </Button>
    </div>
  )
}

interface AddTaskInputProps {
  onTaskCreate: (title: string) => void
  onCancel: () => void
}

function AddTaskInput({ onTaskCreate, onCancel }: AddTaskInputProps) {
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    if (title.trim()) {
      onTaskCreate(title.trim())
      setTitle('')
    }
  }

  const handleCancel = () => {
    setTitle('')
    onCancel()
  }

  useClickAway(inputRef, handleCancel)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  return (
    <div ref={inputRef} className='flex items-center gap-2 px-4 py-3'>
      <div className='flex-1'>
        <Input
          type='text'
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          placeholder='Enter task title...'
          className='rounded border border-blue-500 px-2 py-1 leading-normal font-medium focus:border-blue-500 focus:outline-none'
          autoFocus
        />
      </div>
      <div className='h-6 w-6' />
    </div>
  )
}

interface TaskRowProps {
  task: Task
  onTaskClick?: (taskId: number) => void
  onTaskUpdate?: (taskId: number, updates: Partial<Task>) => void
}

function TaskRow({ task, onTaskClick, onTaskUpdate }: TaskRowProps) {
  const assignee = task.assignments?.[0]?.recipientUser
  const dueDate = task.dueDate || task.assignments?.[0]?.dueAt

  const handleTitleSave = (value: string) => {
    onTaskUpdate?.(task.id, { title: value })
  }

  const handlePriorityChange = (priority: Task['priority'] | null) => {
    if (priority !== null) {
      onTaskUpdate?.(task.id, { priority })
    }
  }

  const handleStatusChange = (status: Task['status']) => {
    onTaskUpdate?.(task.id, { status })
  }

  const handleDueDateChange = (dueDate: string | null) => {
    // Update both task.dueDate and assignments dueAt
    const updatedAssignments = task.assignments.map((assignment) => ({
      ...assignment,
      dueAt: dueDate,
    }))
    onTaskUpdate?.(task.id, {
      dueDate,
      assignments: updatedAssignments,
    })
  }

  const handleAssigneesChange = (assignees: string[]) => {
    // Create mock assignments based on selected assignee names
    // Note: This is simplified - in real app you'd need full user data and API call
    if (assignees.length > 0) {
      const mockAssignment = {
        assignmentId: Date.now(), // Simple ID generation
        taskId: task.id,
        recipientType: 'user',
        assignedAt: new Date().toISOString(),
        dueAt: task.dueDate || task.assignments?.[0]?.dueAt || null,
        completedAt: null,
        status: 'WORKING',
        note: 'Auto-assigned via UI',
        assignedByUser: {
          id: 1,
          name: 'Current User',
          email: 'user@example.com',
          roleName: 'user',
          teamName: 'Default Team',
          unitName: 'Default Unit',
          roleId: 1,
          teamId: 1,
          unitId: 1,
          permissions: undefined,
        },
        completedByUser: null,
        recipientUser: {
          id: 999, // Mock ID
          name: assignees[0], // Use first assignee name
          email: 'assignee@example.com',
          roleName: 'user',
          teamName: 'Default Team',
          unitName: 'Default Unit',
          roleId: 2,
          teamId: 1,
          unitId: 1,
          permissions: undefined,
        },
        recipientId: 999,
      }
      
      onTaskUpdate?.(task.id, { assignments: [mockAssignment] })
    } else {
      // No assignees selected, clear assignments
      onTaskUpdate?.(task.id, { assignments: [] })
    }
  }

  return (
    <tr className='border-b border-gray-200 hover:bg-gray-50'>
      <td className='px-4 py-3'>
        <div className='flex w-full items-center'>
          <span
            className={`mr-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusConfig[task.status].color}`}
          >
            {statusConfig[task.status].icon}
          </span>
          <div className='flex-1'>
            <TaskTitle
              title={task.title}
              taskId={task.id}
              onTitleSave={handleTitleSave}
              onTaskClick={onTaskClick || (() => {})}
            />
          </div>
        </div>
      </td>
      <td className='px-4 py-3'>
        <AssigneePopover
          taskId={task.id.toString()}
          currentAssignees={assignee ? [assignee.name] : []}
          onAssigneesChange={handleAssigneesChange}
        />
      </td>
      <td className='px-4 py-3'>
        <DueDatePopover
          taskId={task.id.toString()}
          currentDueDate={dueDate}
          onDueDateChange={handleDueDateChange}
        />
      </td>
      <td className='px-4 py-3'>
        <PriorityPopover
          taskId={task.id}
          currentPriority={task.priority}
          onPriorityChange={handlePriorityChange}
        />
      </td>
      <td className='px-4 py-3'>
        <StatusPopover
          taskId={task.id}
          currentStatus={task.status}
          onStatusChange={handleStatusChange}
        />
      </td>
      <td className='px-4 py-3'>
        <button className='rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'>
          <MoreHorizontal className='h-4 w-4' />
        </button>
      </td>
    </tr>
  )
}

interface StatusGroupProps {
  status: keyof typeof statusConfig
  tasks: Task[]
  onTaskClick?: (taskId: number) => void
  onTaskUpdate?: (taskId: number, updates: Partial<Task>) => void
  onTaskCreate?: (title: string, status?: Task['status']) => void
}

function StatusGroup({
  status,
  tasks,
  onTaskClick,
  onTaskUpdate,
  onTaskCreate,
}: StatusGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showAddInput, setShowAddInput] = useState(false)

  return (
    <div className='mb-8'>
      <div className='mb-4 flex items-center justify-between'>
        <button
          onClick={() => {
            setIsCollapsed(!isCollapsed)
          }}
          className='flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900'
        >
          {isCollapsed ? (
            <ChevronRight className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusConfig[status].color}`}
          >
            {statusConfig[status].icon} {statusConfig[status].label}
          </span>
          <span className='text-gray-500'>{tasks.length}</span>
        </button>
      </div>

      {!isCollapsed && (
        <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Name
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Assignee
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Due date
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Priority
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Status
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  <span className='sr-only'>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                  onTaskUpdate={onTaskUpdate}
                />
              ))}
              {showAddInput ? (
                <tr>
                  <td colSpan={7}>
                    <AddTaskInput
                      onTaskCreate={(title) => {
                        onTaskCreate?.(title, status)
                        setShowAddInput(false)
                      }}
                      onCancel={() => {
                        setShowAddInput(false)
                      }}
                    />
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={7} className='px-4 py-3'>
                    <button
                      onClick={() => {
                        setShowAddInput(true)
                      }}
                      className='flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700'
                    >
                      <Plus className='h-4 w-4' />
                      <span>Add Task</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Flatten all tasks including subtasks
function getAllTasks(tasks: Task[]): Task[] {
  const allTasks: Task[] = []

  const flattenTasks = (taskList: Task[]) => {
    for (const task of taskList) {
      allTasks.push(task)
      if (task.subtasks && task.subtasks.length > 0) {
        flattenTasks(task.subtasks)
      }
    }
  }

  flattenTasks(tasks)
  return allTasks
}

export function TaskList({
  tasks,
  onTaskClick,
  groupByStatus = true,
  onTaskUpdate,
  onTaskCreate,
}: TaskListProps) {
  // Flatten all tasks including subtasks
  const allTasks = getAllTasks(tasks)
  const [showAddInput, setShowAddInput] = useState(false)

  if (groupByStatus) {
    // Group tasks by status with defined order
    const statusOrder: (keyof typeof statusConfig)[] = [
      'COMPLETED',
      'IN_PROGRESS',
      'OPEN',
    ]
    const groupedTasks = allTasks.reduce<Record<string, Task[]>>(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = []
        }
        acc[task.status].push(task)
        return acc
      },
      {}
    )

    return (
      <div className='space-y-6'>
        {statusOrder.map((status) => {
          const statusTasks = groupedTasks[status] || []
          return (
            <StatusGroup
              key={status}
              status={status}
              tasks={statusTasks}
              onTaskClick={onTaskClick}
              onTaskUpdate={onTaskUpdate}
              onTaskCreate={onTaskCreate}
            />
          )
        })}
      </div>
    )
  }

  // Simple table view without grouping
  return (
    <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Title
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Assignee
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Due date
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Priority
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Status
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              <span className='sr-only'>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white'>
          {allTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
              onTaskUpdate={onTaskUpdate}
            />
          ))}
          {showAddInput ? (
            <tr>
              <td colSpan={6}>
                <AddTaskInput
                  onTaskCreate={(title) => {
                    onTaskCreate?.(title, 'OPEN')
                    setShowAddInput(false)
                  }}
                  onCancel={() => {
                    setShowAddInput(false)
                  }}
                />
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan={6} className='px-4 py-3'>
                <button
                  onClick={() => {
                    setShowAddInput(true)
                  }}
                  className='flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700'
                >
                  <Plus className='h-4 w-4' />
                  <span>Add Task</span>
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
