import { useState } from 'react'

interface UseTaskDetailDrawerOptions {
  taskId?: number
}

export function useTaskDetailDrawer(options?: UseTaskDetailDrawerOptions) {
  const [isOpen, setIsOpen] = useState(false)
  const [taskId, setTaskId] = useState<number | undefined>(options?.taskId)

  const openDrawer = (id: number) => {
    setTaskId(id)
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    // Keep taskId for potential animation purposes
    setTimeout(() => {
      setTaskId(undefined)
    }, 300)
  }

  return {
    isOpen,
    taskId,
    openDrawer,
    closeDrawer,
  }
}
