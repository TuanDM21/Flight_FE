import { useDialogs } from '@/hooks/use-dialogs'
import { CreateTaskSheet } from '../components/create-task-sheet'

export function useCreateTaskSheet() {
  const dialogs = useDialogs()

  return () => {
    dialogs.sheet(CreateTaskSheet, {})
  }
}
