import { format, parse } from 'date-fns'
import $queryClient from '@/api'
import { dateFormatPatterns } from '@/config/date'
import { AllTasksQueryParams } from '@/features/tasks/types'

export const allTasksQueryOptions = (queryParams: AllTasksQueryParams) => {
  const params = { ...queryParams }

  if (params.startTime) {
    const date = parse(
      params.startTime,
      dateFormatPatterns.fullDate,
      new Date()
    )
    params.startTime = format(date, dateFormatPatterns.standardizedDate)
  }
  if (params.endTime) {
    const date = parse(params.endTime, dateFormatPatterns.fullDate, new Date())
    params.endTime = format(date, dateFormatPatterns.standardizedDate)
  }

  return $queryClient.queryOptions('get', '/api/tasks/company', {
    params: {
      query: params,
    },
  })
}
