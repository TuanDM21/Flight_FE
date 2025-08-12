import { useState } from 'react'
import { Paperclip } from 'lucide-react'
import { Attachments } from './attachments'
import type { Task } from './types'

interface TaskAttachmentsProps {
  task: Task
  onTaskUpdate: (updates: Partial<Task>) => void
}

export function TaskAttachments({ task, onTaskUpdate }: TaskAttachmentsProps) {
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])

  void onTaskUpdate

  return (
    <div className='space-y-4 p-6'>
      <div className='space-y-3'>
        {/* Existing Attachments */}
        {task.attachments && task.attachments.length > 0 && (
          <div className='space-y-2'>
            <h4 className='text-muted-foreground text-sm font-medium'>
              Existing Attachments
            </h4>
            <div className='space-y-2'>
              {task.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className='flex items-center justify-between rounded border p-3'
                >
                  <div className='flex items-center gap-2'>
                    <Paperclip className='text-muted-foreground h-4 w-4' />
                    <div>
                      <div className='text-sm font-medium'>
                        {attachment.fileName}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                        {' • '}
                        Uploaded by {attachment.uploadedBy.name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(attachment.filePath, '_blank')}
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload New Attachments */}
        <div className='space-y-2'>
          <h4 className='text-muted-foreground text-sm font-medium'>
            Upload New Files
          </h4>
          <Attachments
            value={attachmentFiles}
            onChange={setAttachmentFiles}
            onFileReject={(file, message) => {
              void file
              void message
            }}
            onUpload={async (files, callbacks) => {
              for (const file of files) {
                try {
                  callbacks.onProgress(file, 50)
                  await new Promise((resolve) => setTimeout(resolve, 1000))
                  callbacks.onSuccess(file)
                } catch (error) {
                  callbacks.onError(file, error as Error)
                }
              }
            }}
            onOpenPreview={(file) => {
              void file
            }}
          />
        </div>
      </div>
    </div>
  )
}
