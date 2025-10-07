'use client'

import { ActivitiesRoute } from '@/routes/_authenticated/activities'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type FilterType = 'my' | 'company'

interface FilterCalendarProps {
  defaultFilter?: FilterType
  onFilterChange?: (filter: FilterType) => void
}

const getFilterFromType = (
  type: string,
  defaultFilter: FilterType
): FilterType => (type === 'my' || type === 'company' ? type : defaultFilter)

export function FilterCalendar({
  onFilterChange,
  defaultFilter = 'my',
}: FilterCalendarProps) {
  const navigate = ActivitiesRoute.useNavigate()
  const searchParams = ActivitiesRoute.useSearch()

  const selectedFilter = getFilterFromType(
    searchParams.type || 'company',
    defaultFilter
  )

  const handleFilterChange = (filter: FilterType) => {
    void navigate({
      search: (prev: any) => {
        const { keyword, ...rest } = prev
        return { ...rest, type: filter }
      },
    })
    onFilterChange?.(filter)
  }

  const filterOptions = [
    {
      value: 'my' as const,
      label: 'Của tôi',
      color: ' border-blue-500  data-[state=checked]:border-blue-500',
    },
    {
      value: 'company' as const,
      label: 'Công ty',
      color: ' border-green-500  data-[state=checked]:border-green-500',
    },
  ]

  return (
    <RadioGroup
      value={selectedFilter}
      onValueChange={handleFilterChange}
      className='flex items-center gap-4'
    >
      {filterOptions.map((option) => (
        <div key={option.value} className='flex items-center space-x-2'>
          <RadioGroupItem
            id={`filter-${option.value}`}
            value={option.value}
            className={option.color}
          />
          <Label
            htmlFor={`filter-${option.value}`}
            className='cursor-pointer text-sm font-medium'
          >
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}

export default FilterCalendar
