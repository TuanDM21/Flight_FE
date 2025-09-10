import { Building, FileText, Mail } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Task } from '@/features/tasks/types'

interface TaskInformationCardProps {
  task: Task
}

export function TaskInformationCard({ task }: TaskInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <FileText className='h-5 w-5' />
          <span>Thông tin công việc</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div>
          <h3 className='text-muted-foreground mb-2 text-sm font-medium'>
            Nội dung
          </h3>
          <div className='bg-muted/50 rounded-md p-4'>
            <p className='text-sm whitespace-pre-wrap'>
              {task.content || 'Không có nội dung được cung cấp'}
            </p>
          </div>
        </div>

        {task.instructions && (
          <>
            <Separator />
            <div>
              <h3 className='text-muted-foreground mb-2 text-sm font-medium'>
                Hướng dẫn
              </h3>
              <div className='bg-muted/50 rounded-md p-4'>
                <p className='text-sm whitespace-pre-wrap'>
                  {task.instructions}
                </p>
              </div>
            </div>
          </>
        )}

        {task.notes && (
          <>
            <Separator />
            <div>
              <h3 className='text-muted-foreground mb-2 text-sm font-medium'>
                Ghi chú
              </h3>
              <div className='bg-muted/50 rounded-md p-4'>
                <p className='text-sm whitespace-pre-wrap'>{task.notes}</p>
              </div>
            </div>
          </>
        )}

        {task.createdByUser && (
          <>
            <Separator />
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <div>
                <h3 className='text-muted-foreground mb-2 text-sm font-medium'>
                  Được tạo bởi
                </h3>
                <div className='flex items-center space-x-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback>
                      {task.createdByUser.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='text-sm font-medium'>
                      {task.createdByUser.name}
                    </p>
                    <div className='text-muted-foreground flex items-center space-x-2 text-xs'>
                      <Mail className='h-3 w-3' />
                      <span>{task.createdByUser.email}</span>
                      {task.createdByUser.roleName && (
                        <>
                          <span>•</span>
                          <span>{task.createdByUser.roleName}</span>
                        </>
                      )}
                      {task.createdByUser.teamName && (
                        <>
                          <span>•</span>
                          <Building className='h-3 w-3' />
                          <span>{task.createdByUser.teamName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='text-muted-foreground mb-2 text-sm font-medium'>
                  Ngày tạo
                </h3>
                <div className='rounded-md p-3'>
                  <p className='text-sm'>
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleString()
                      : 'Không có sẵn'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
