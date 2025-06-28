'use client'

import { useState } from 'react'
import { useTaskDetailDrawer } from '../hooks/use-task-detail-drawer'
import { TaskDetailDrawer } from './task-detail-drawer'
import { TaskList } from './task-list'
import type { Task } from './types'

export function List() {
  // TODO: Replace with actual API call
  // const { data: taskListResponse } = useSuspenseQuery(tasksQueryOptions())
  const [tasks, setTasks] = useState<Task[]>([])

  const { isOpen, taskId, openDrawer, closeDrawer } = useTaskDetailDrawer()

  const handleTaskUpdate = (taskId: number, updates: Partial<Task>) => {
    // Update task in state
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    )
    // TODO: Implement actual API call to update the task
  }

  const handleTaskCreate = (title: string, status: Task['status'] = 'OPEN') => {
    // Create new task object
    const newTask: Task = {
      id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1, // Simple ID generation
      title,
      content: '',
      instructions: '',
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startDate: null,
      dueDate: null,
      createdByUser: {
        id: 1,
        name: 'Current User', // TODO: Get from auth context
        email: 'user@example.com',
        roleName: 'user',
        teamName: 'Default Team',
        unitName: 'Default Unit',
        roleId: 1,
        teamId: 1,
        unitId: 1,
        permissions: undefined,
      },
      assignments: [],
      status,
      priority: 'NORMAL',
      parentId: null,
      subtasks: [],
      hierarchyLevel: null,
      attachments: [],
    }

    // Add to state
    setTasks((prevTasks) => [...prevTasks, newTask])

    // TODO: Implement actual API call to create the task
  }

  return (
    <div className='flex h-full flex-1 flex-col overflow-hidden'>
      <div className='flex-1 space-y-4 overflow-y-auto p-6'>
        <TaskList
          tasks={tasks}
          onTaskClick={openDrawer}
          groupByStatus={true}
          onTaskUpdate={handleTaskUpdate}
          onTaskCreate={handleTaskCreate}
        />
        <TaskDetailDrawer
          isOpen={isOpen}
          taskId={taskId}
          onClose={closeDrawer}
        />
      </div>
    </div>
  )
}
