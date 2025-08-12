import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { dateFormatPatterns } from '@/config/date'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

const task = {
  comments: [
    {
      id: 1,
      user: { name: 'Alice', email: 'alice@example.com' },
      createdAt: new Date(),
      comment: 'This is a comment from Alice',
    },
    {
      id: 2,
      user: { name: 'Bob', email: 'bob@example.com' },
      createdAt: new Date(),
      comment: 'This is a comment from Bob',
    },
  ],
}

export function TaskComments() {
  const [comments, setComments] = useState(task.comments || [])
  const [commentMessage, setCommentMessage] = useState('')
  const lastCommentRef = useRef<HTMLDivElement>(null)

  const hasComments = task.comments && task.comments.length > 0

  // Scroll to bottom when first loading comments
  useEffect(() => {
    if (hasComments) {
      const timer = setTimeout(() => {
        if (lastCommentRef.current) {
          lastCommentRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
          })
        }
      }, 200)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [hasComments])

  const handleReply = async () => {
    if (!commentMessage.trim()) return

    const messageToSend = commentMessage
    setCommentMessage('')
    if (lastCommentRef.current)
      lastCommentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })

    // try {
    //   await createTaskAssignmentCommentMutation.mutateAsync({
    //     body: {
    //       comment: messageToSend,
    //     },
    //     params: {
    //       path: {
    //         id: assignmentId,
    //       },
    //     },
    //   })
    // } catch {
    //   setCommentMessage(messageToSend)
    // }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleReply()
    }
  }

  return (
    <div className='space-y-4 p-6'>
      <div className='flex min-h-0 flex-1 flex-col gap-4 p-4'>
        <div className='min-h-0 flex-1 space-y-2 overflow-y-auto scroll-smooth'>
          {false ? (
            <div className='space-y-4'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-4 w-1/2' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
            </div>
          ) : (
            <>
              {hasComments ? (
                comments.map((comment, index) => (
                  <Card
                    key={comment.id}
                    ref={index === comments.length - 1 ? lastCommentRef : null}
                    className='flex flex-col space-y-1 rounded-lg border p-4 shadow-sm'
                  >
                    <CardHeader className='flex items-center justify-between p-0'>
                      <CardTitle className='text-base font-semibold'>
                        {comment.user?.name}
                      </CardTitle>
                      <CardDescription className='text-sm text-gray-400'>
                        {comment.createdAt &&
                          format(
                            new Date(comment.createdAt),
                            dateFormatPatterns.shortDateTime
                          )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='p-0'>
                      <p className='text-gray-700'>{comment.comment}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className='flex h-full flex-col items-center justify-center space-y-4 py-8'>
                  <div className='bg-muted rounded-full p-4'>
                    <MessageCircle className='text-muted-foreground h-8 w-8' />
                  </div>
                  <div className='space-y-2 text-center'>
                    <h3 className='text-muted-foreground text-lg font-medium'>
                      Chưa có bình luận nào
                    </h3>
                    <p className='text-muted-foreground max-w-sm text-sm'>
                      Hãy là người đầu tiên để lại bình luận cho phân công này.
                      Bắt đầu cuộc trò chuyện bên dưới!
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className='flex-shrink-0'>
          <div className='relative'>
            <Textarea
              className='max-h-[200px] min-h-[80px] w-full resize-none rounded border p-2 pr-20'
              value={commentMessage}
              onChange={(e) => {
                setCommentMessage(e.target.value)
              }}
              onKeyDown={handleKeyDown}
            />
            <Button
              className='absolute right-2 bottom-2 h-8 rounded bg-blue-500 px-3 text-sm text-white hover:bg-blue-600'
              onClick={() => void handleReply()}
              disabled={!commentMessage.trim()}
            >
              Trả lời
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
