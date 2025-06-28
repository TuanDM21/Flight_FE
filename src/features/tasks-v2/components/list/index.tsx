'use client'

import type { ReactNode } from 'react'
import {
  DndContext,
  type DragEndEvent,
  rectIntersection,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { cn } from '@/lib/utils'

export type { DragEndEvent } from '@dnd-kit/core'

type Status = {
  id: string
  name: string
  color: string
}

type Feature = {
  id: string
  name: string
  startAt: Date
  endAt: Date
  status: Status
}

export type ListItemsProps = {
  children: ReactNode
  className?: string
}

export const ListItems = ({ children, className }: ListItemsProps) => (
  <div className={cn('flex flex-1 flex-col gap-3 p-4', className)}>
    {children}
  </div>
)

export type ListHeaderProps =
  | {
      children: ReactNode
    }
  | {
      name: Status['name']
      color: Status['color']
      className?: string
    }

export const ListHeader = (props: ListHeaderProps) =>
  'children' in props ? (
    props.children
  ) : (
    <div
      className={cn(
        'border-border/30 bg-muted/30 flex shrink-0 items-center gap-3 border-b px-4 py-3.5 backdrop-blur-sm',
        props.className
      )}
    >
      <div
        className='h-3 w-3 rounded-full shadow-sm ring-2 ring-white/20'
        style={{ backgroundColor: props.color }}
      />
      <p className='text-foreground/90 m-0 text-sm font-semibold tracking-wide'>
        {props.name}
      </p>
      <div className='bg-muted text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-xs font-medium'>
        {/* Task count will be added later */}
      </div>
    </div>
  )

export type ListGroupProps = {
  id: Status['id']
  children: ReactNode
  className?: string
}

export const ListGroup = ({ id, children, className }: ListGroupProps) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      className={cn(
        'border-border/50 bg-card rounded-xl border shadow-sm transition-all duration-200',
        isOver && 'border-primary/50 bg-primary/5 scale-[1.02] shadow-md',
        className
      )}
      ref={setNodeRef}
    >
      {children}
    </div>
  )
}

export type ListItemProps = Pick<Feature, 'id' | 'name'> & {
  readonly index: number
  readonly parent: string
  readonly children?: ReactNode
  readonly className?: string
}

export const ListItem = ({
  id,
  name,
  index,
  parent,
  children,
  className,
}: ListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { index, parent },
    })

  return (
    <div
      className={cn(
        'group border-border/40 bg-background hover:border-border hover:bg-muted/30 flex cursor-grab items-center gap-3 rounded-lg border p-3 shadow-sm transition-all duration-200 hover:shadow-md',
        isDragging && 'scale-105 rotate-2 cursor-grabbing shadow-lg',
        className
      )}
      style={{
        transform: transform
          ? `translateX(${transform.x}px) translateY(${transform.y}px)`
          : 'none',
        zIndex: isDragging ? 1000 : 'auto',
      }}
      {...listeners}
      {...attributes}
      ref={setNodeRef}
    >
      {children ?? <p className='m-0 text-sm font-medium'>{name}</p>}
    </div>
  )
}

export type ListProviderProps = {
  children: ReactNode
  onDragEnd: (event: DragEndEvent) => void
  className?: string
}

export const ListProvider = ({
  children,
  onDragEnd,
  className,
}: ListProviderProps) => (
  <DndContext
    collisionDetection={rectIntersection}
    onDragEnd={onDragEnd}
    modifiers={[restrictToVerticalAxis]}
  >
    <div className={cn('flex flex-col space-y-4', className)}>{children}</div>
  </DndContext>
)
