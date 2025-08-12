import { useState, useRef } from 'react'

export type AppDialogInstance = {
  open: () => void
  close: () => void
  toggle: () => void
  isOpen: boolean
}

export function useDialogInstance(
  existingInstance?: AppDialogInstance
): AppDialogInstance {
  const [isOpen, setIsOpen] = useState(false)

  const instance = useRef<AppDialogInstance>({
    open: () => {
      setIsOpen(true)
    },
    close: () => {
      setIsOpen(false)
    },
    toggle: () => {
      setIsOpen((prev) => !prev)
    },
    isOpen,
  })

  instance.current.isOpen = isOpen
  return existingInstance ?? instance.current
}
