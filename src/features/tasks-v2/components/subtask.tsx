import { useState } from 'react'
import { TaskItem } from './task-item'
import type { Task } from './types'

interface SubtaskProps {
  task: Task
  level?: number
  onTaskClick?: (taskId: number) => void
}

export function Subtask({ task, level = 0, onTaskClick }: SubtaskProps) {
  const [expanded, setExpanded] = useState(false)

  const handleToggle = () => {
    setExpanded(!expanded)
  }

  return (
    <TaskItem
      task={task}
      level={level}
      expanded={expanded}
      onToggle={handleToggle}
      onTaskClick={onTaskClick}
      showSubtasks={true}
    />
  )
}
