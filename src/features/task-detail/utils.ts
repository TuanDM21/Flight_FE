import { Task } from '../tasks/types'

export const getAssignmentsInfo = (task?: Task) => {
  if (!task?.assignments || task.assignments.length === 0) {
    return { count: 0, completed: 0, statuses: [] }
  }

  const completed = task.assignments.filter(
    (assignment) => assignment.status === 'DONE'
  ).length

  const statuses = [
    ...new Set(
      task.assignments
        .map((assignment) => assignment.status)
        .filter((status) => status !== undefined)
    ),
  ]

  return {
    count: task.assignments.length,
    completed,
    statuses,
  }
}
