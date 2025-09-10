import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { createTaskSchema } from '@/features/tasks/schema'

interface UseCreateTaskFormProps {
  open: boolean
  onReset?: () => void
}

export const useCreateTaskForm = ({
  open,
  onReset,
}: UseCreateTaskFormProps) => {
  const form = useForm({
    resolver: standardSchemaResolver(createTaskSchema),
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        content: '',
        instructions: '',
        notes: '',
        assignments: [],
        attachmentIds: [],
        files: [],
      })
    }

    return () => {
      onReset?.()
    }
  }, [open, onReset])

  return { form }
}
