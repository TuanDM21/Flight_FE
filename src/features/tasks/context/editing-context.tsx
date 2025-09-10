import { createContext, useContext, useState, ReactNode } from 'react'

interface EditingContextType {
  editingCellId: string | null
  setEditingCellId: (id: string | null) => void
  isAnyEditing: boolean
}

const EditingContext = createContext<EditingContextType | undefined>(undefined)

export function EditingProvider({ children }: { children: ReactNode }) {
  const [editingCellId, setEditingCellId] = useState<string | null>(null)

  const value = {
    editingCellId,
    setEditingCellId,
    isAnyEditing: editingCellId !== null,
  }

  return (
    <EditingContext.Provider value={value}>{children}</EditingContext.Provider>
  )
}

export function useEditing() {
  const context = useContext(EditingContext)
  if (context === undefined) {
    throw new Error('useEditing must be used within an EditingProvider')
  }
  return context
}
