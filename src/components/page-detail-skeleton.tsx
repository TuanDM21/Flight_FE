export default function PageDetailSkeleton() {
  return (
    <div className='px-4 py-2'>
      <div className='animate-pulse space-y-4'>
        <div className='bg-muted h-6 w-1/3 rounded'></div>
        <div className='bg-muted h-4 w-1/4 rounded'></div>
        <div className='bg-muted h-4 w-1/2 rounded'></div>
        <div className='bg-muted h-4 w-full rounded'></div>
        <div className='bg-muted h-4 w-full rounded'></div>
      </div>
    </div>
  )
}
