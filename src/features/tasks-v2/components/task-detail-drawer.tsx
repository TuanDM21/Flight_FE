import { useEffect, useState } from 'react'
import { MessageSquare, Paperclip, Users, GitBranch, Info } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskAssignments } from './task-assignments'
import { TaskAttachments } from './task-attachments'
import { TaskComments } from './task-comments'
import { TaskOverview } from './task-overview'
import { TaskSubtasks } from './task-subtasks'
import type { Task } from './types'

interface TaskDetailDrawerProps {
  isOpen: boolean
  taskId?: number
  onClose: () => void
}

// Mock function to get task by ID - replace with real API call
const getTaskById = async (taskId: number): Promise<Task | null> => {
  // TODO: Replace with actual API call
  // For now, return mock data
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    id: taskId,
    title: `Task ${taskId}`,
    content: 'This is a mock content for the task.',
    instructions: 'Mock instructions',
    notes: null,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12',
    startDate: '2024-08-04',
    dueDate: '2024-08-10',
    createdByUser: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      roleName: 'admin',
      teamName: 'Team A',
      unitName: 'Unit 1',
      roleId: 1,
      teamId: 1,
      unitId: 1,
      permissions: [],
    },
    assignments: [
      {
        assignmentId: 33,
        taskId: 201,
        recipientType: 'user',
        assignedAt: '2025-07-28T00:41:38.440+07:00',
        dueAt: null,
        completedAt: null,
        status: 'WORKING',
        note: 'Giao Task B riêng biệt',
        assignedByUser: {
          id: 1,
          name: 'DO MINH TUAN',
          email: 'domtuan21@gmail.com',
          roleName: 'admin',
          teamName: 'Đội Kỹ Thuật',
          unitName: 'Tổ Kỷ Thuật Nhà Ga',
          roleId: 1,
          teamId: 1,
          unitId: 1,
          permissions: null,
        },
        completedByUser: null,
        recipientUser: {
          id: 2,
          name: 'DO Minh TUan',
          email: 'domtuan22@gmail.com',
          roleName: 'MEMBER',
          teamName: 'Đội Kỹ Thuật',
          unitName: 'Tổ Kỷ Thuật Nhà Ga',
          roleId: 2,
          teamId: 1,
          unitId: 1,
          permissions: null,
        },
        recipientId: 2,
      },
    ],
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    parentId: null,
    subtasks: [
      {
        id: 201,
        title: 'Task B - Subtask của A',
        content: 'Đây là subtask của Task A',
        instructions: 'Task này cũng sẽ có subtask',
        notes: null,
        createdAt: '2025-07-28T00:41:28.200719+07:00',
        updatedAt: '2025-07-28T00:41:39.135883+07:00',
        createdByUser: {
          id: 1,
          name: 'DO MINH TUAN',
          email: 'domtuan21@gmail.com',
          roleName: 'admin',
          teamName: 'Đội Kỹ Thuật',
          unitName: 'Tổ Kỷ Thuật Nhà Ga',
          roleId: 1,
          teamId: 1,
          unitId: 1,
          permissions: null,
        },
        assignments: [
          {
            assignmentId: 33,
            taskId: 201,
            recipientType: 'user',
            assignedAt: '2025-07-28T00:41:38.440+07:00',
            dueAt: null,
            completedAt: null,
            status: 'WORKING',
            note: 'Giao Task B riêng biệt',
            assignedByUser: {
              id: 1,
              name: 'DO MINH TUAN',
              email: 'domtuan21@gmail.com',
              roleName: 'admin',
              teamName: 'Đội Kỹ Thuật',
              unitName: 'Tổ Kỷ Thuật Nhà Ga',
              roleId: 1,
              teamId: 1,
              unitId: 1,
              permissions: null,
            },
            completedByUser: null,
            recipientUser: {
              id: 2,
              name: 'DO Minh TUan',
              email: 'domtuan22@gmail.com',
              roleName: 'MEMBER',
              teamName: 'Đội Kỹ Thuật',
              unitName: 'Tổ Kỷ Thuật Nhà Ga',
              roleId: 2,
              teamId: 1,
              unitId: 1,
              permissions: null,
            },
            recipientId: 2,
          },
        ],
        status: 'IN_PROGRESS',
        priority: 'NORMAL',
        parentId: 200,
        subtasks: [
          {
            id: 202,
            title: 'Task C - Subtask của B',
            content: 'Đây là subtask của Task B',
            instructions: 'Task cuối cùng trong hierarchy',
            notes: null,
            createdAt: '2025-07-28T00:41:28.974386+07:00',
            updatedAt: '2025-07-28T00:41:28.974667+07:00',
            createdByUser: {
              id: 1,
              name: 'DO MINH TUAN',
              email: 'domtuan21@gmail.com',
              roleName: 'admin',
              teamName: 'Đội Kỹ Thuật',
              unitName: 'Tổ Kỷ Thuật Nhà Ga',
              roleId: 1,
              teamId: 1,
              unitId: 1,
              permissions: null,
            },
            assignments: [],
            status: 'OPEN',
            priority: 'LOW',
            parentId: 201,
            subtasks: [
              {
                id: 198,
                title: 'Test Task for My Tasks API',
                content: 'Đây là task test cho API /my',
                instructions: 'Thực hiện các bước test',
                notes: null,
                createdAt: '2025-07-28T00:01:37.086862+07:00',
                updatedAt: '2025-07-28T00:01:38.81376+07:00',
                createdByUser: {
                  id: 1,
                  name: 'DO MINH TUAN',
                  email: 'domtuan21@gmail.com',
                  roleName: 'admin',
                  teamName: 'Đội Kỹ Thuật',
                  unitName: 'Tổ Kỷ Thuật Nhà Ga',
                  roleId: 1,
                  teamId: 1,
                  unitId: 1,
                  permissions: null,
                },
                assignments: [],
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                parentId: 202,
                subtasks: [],
                hierarchyLevel: null,
                attachments: [],
              },
            ],
            hierarchyLevel: null,
            attachments: [],
          },
        ],
        hierarchyLevel: null,
        attachments: [],
      },
    ],
    hierarchyLevel: null,
    attachments: [
      {
        id: 187,
        filePath:
          'https://filedonghoiairport.blob.core.windows.net/donghoiairportfile/bb6e4a46-515b-495b-aebb-8f44819b0f33_1753629912843_image_1753629903253.jpg',
        fileName: 'image_1753629903253.jpg',
        fileSize: 1_544_416,
        createdAt: '2025-07-28T05:25:12.897412+07:00',
        uploadedBy: {
          id: 53,
          name: 'director_example',
          email: 'director@example.com',
          roleName: 'DIRECTOR',
          teamName: 'Team A',
          unitName: 'Unit 1',
          roleId: 9,
          teamId: 1,
          unitId: 1,
          permissions: [],
        },
        sharedCount: null,
      },
    ],
  }
}

export function TaskDetailDrawer({
  isOpen,
  taskId,
  onClose,
}: TaskDetailDrawerProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && taskId) {
      setLoading(true)
      void getTaskById(taskId)
        .then(setTask)
        .catch(() => {
          setTask(null)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isOpen, taskId])

  const handleTaskUpdate = (updates: Partial<Task>) => {
    setTask((prev) => (prev ? { ...prev, ...updates } : null))
  }

  if (!taskId) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='h-full w-full sm:max-w-2xl'>
        <SheetHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div>
                <SheetTitle className='text-left'>
                  {loading
                    ? 'Đang tải...'
                    : task?.title || 'Task không tìm thấy'}
                </SheetTitle>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div
          className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto'
          style={{ maxHeight: 'calc(100dvh - 64px)' }}
        >
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-muted-foreground'>
                Đang tải chi tiết task...
              </div>
            </div>
          ) : task ? (
            <Tabs defaultValue='overview' className='h-full'>
              <TabsList className='grid w-full grid-cols-5'>
                <TabsTrigger
                  value='overview'
                  className='flex items-center gap-2'
                >
                  <Info className='h-4 w-4' />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value='comments'
                  className='flex items-center gap-2'
                >
                  <MessageSquare className='h-4 w-4' />
                  Comments
                </TabsTrigger>
                <TabsTrigger
                  value='attachments'
                  className='flex items-center gap-2'
                >
                  <Paperclip className='h-4 w-4' />
                  Attachments
                </TabsTrigger>
                <TabsTrigger
                  value='assignments'
                  className='flex items-center gap-2'
                >
                  <Users className='h-4 w-4' />
                  Assignments
                </TabsTrigger>
                <TabsTrigger
                  value='subtasks'
                  className='flex items-center gap-2'
                >
                  <GitBranch className='h-4 w-4' />
                  Subtasks
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value='overview'>
                <TaskOverview task={task} onTaskUpdate={handleTaskUpdate} />
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value='comments'>
                <TaskComments task={task} onTaskUpdate={handleTaskUpdate} />
              </TabsContent>

              {/* Attachments Tab */}
              <TabsContent value='attachments'>
                <TaskAttachments task={task} onTaskUpdate={handleTaskUpdate} />
              </TabsContent>

              {/* Assignments Tab */}
              <TabsContent value='assignments'>
                <TaskAssignments task={task} onTaskUpdate={handleTaskUpdate} />
              </TabsContent>

              {/* Subtasks Tab */}
              <TabsContent value='subtasks'>
                <TaskSubtasks task={task} onTaskUpdate={handleTaskUpdate} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className='flex items-center justify-center py-8'>
              <div className='text-muted-foreground'>
                Không tìm thấy task với ID: {taskId}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
