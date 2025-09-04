import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TaskSearchInputProps {
  isFiltering: boolean
  debounceMs: number
  className?: string
}

export function TaskSearchInput({
  isFiltering,
  debounceMs,
  className = '',
}: TaskSearchInputProps) {
  const [queryFilter, setQueryFilter] = useQueryState(
    'keyword',
    parseAsString.withDefault('')
  )

  const [inputValue, setInputValue] = useState(queryFilter)

  const debouncedSetFilter = useDebouncedCallback(setQueryFilter, debounceMs)

  const handleChange = (value: string) => {
    setInputValue(value)
    debouncedSetFilter(value)
  }

  const handleClear = () => {
    setInputValue('')
    setQueryFilter('')
  }

  return (
    <div
      className={`relative flex w-full items-center gap-2 sm:w-auto sm:max-w-[400px] sm:min-w-[280px] lg:max-w-[500px] ${className}`}
    >
      <Search
        className={`absolute top-2.5 left-3 z-10 h-4 w-4 ${
          isFiltering ? 'text-primary' : 'text-muted-foreground'
        }`}
      />
      <Input
        placeholder='Mã công việc, tên công việc...'
        className='peer px-9 placeholder:truncate [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none'
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
      />
      {inputValue && (
        <Button
          variant='ghost'
          className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 end-0 h-full rounded-s-none hover:bg-transparent'
          onClick={handleClear}
          aria-label='Xóa tìm kiếm'
        >
          <X className='h-3 w-3' />
        </Button>
      )}
    </div>
  )
}
