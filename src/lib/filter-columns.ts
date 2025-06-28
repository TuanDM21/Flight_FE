import { addDays, endOfDay, startOfDay } from 'date-fns'
import type { ExtendedColumnFilter, JoinOperator } from '@/types/data-table'

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true

  if (typeof value === 'string') {
    return value.trim() === '' || value === '[]' || value === '{}'
  }

  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }

  return false
}

export function filterColumns<T>({
  filters,
  joinOperator,
}: {
  filters: ExtendedColumnFilter<T>[]
  joinOperator: JoinOperator
}): ((row: T) => boolean) | undefined {
  if (filters.length === 0) return undefined

  function checkCondition(row: T, filter: ExtendedColumnFilter<T>): boolean {
    const value = row[filter.id]

    switch (filter.operator) {
      case 'iLike': {
        if (filter.variant === 'text' && typeof filter.value === 'string') {
          if (typeof value === 'string' || typeof value === 'number') {
            return value
              .toString()
              .toLowerCase()
              .includes(filter.value.toLowerCase())
          }
          return false
        }
        return false
      }

      case 'notILike': {
        if (filter.variant === 'text' && typeof filter.value === 'string') {
          return (
            typeof value === 'string' &&
            !value.toLowerCase().includes(filter.value.toLowerCase())
          )
        }
        return false
      }

      case 'eq': {
        if (filter.variant === 'date' || filter.variant === 'dateRange') {
          if (!value) return false
          // Safe type casting since we're checking type before using
          const dateValue = new Date(value as string | number | Date)
          dateValue.setHours(0, 0, 0, 0)
          const targetDate = new Date(Number(filter.value))
          targetDate.setHours(0, 0, 0, 0)
          return dateValue.getTime() === targetDate.getTime()
        }
        return value === filter.value
      }

      case 'ne': {
        if (filter.variant === 'date' || filter.variant === 'dateRange') {
          if (!value) return true
          // Safe type casting since we're checking type before using
          const dateValue = new Date(value as string | number | Date)
          dateValue.setHours(0, 0, 0, 0)
          const targetDate = new Date(Number(filter.value))
          targetDate.setHours(0, 0, 0, 0)
          return dateValue.getTime() !== targetDate.getTime()
        }
        return value !== filter.value
      }

      case 'inArray': {
        if (Array.isArray(filter.value)) {
          // Ensure we're comparing compatible types
          return filter.value.includes(value as string)
        }
        return false
      }

      case 'notInArray': {
        if (Array.isArray(filter.value)) {
          // Ensure we're comparing compatible types
          return !filter.value.includes(value as string)
        }
        return false
      }

      case 'lt': {
        if (filter.variant === 'date' && typeof filter.value === 'string') {
          if (!value) return false
          // Safe type casting since we're checking type before using
          return (
            new Date(value as string | number | Date) <
            new Date(Number(filter.value))
          )
        }
        if (filter.variant === 'number' || filter.variant === 'range') {
          return typeof value === 'number' && value < Number(filter.value)
        }
        return false
      }

      case 'lte': {
        if (filter.variant === 'date' && typeof filter.value === 'string') {
          if (!value) return false
          // Safe type casting since we're checking type before using
          return (
            new Date(value as string | number | Date) <=
            new Date(Number(filter.value))
          )
        }
        if (filter.variant === 'number' || filter.variant === 'range') {
          return typeof value === 'number' && value <= Number(filter.value)
        }
        return false
      }

      case 'gt': {
        if (filter.variant === 'date' && typeof filter.value === 'string') {
          if (!value) return false
          // Safe type casting since we're checking type before using
          return (
            new Date(value as string | number | Date) >
            new Date(Number(filter.value))
          )
        }
        if (filter.variant === 'number' || filter.variant === 'range') {
          return typeof value === 'number' && value > Number(filter.value)
        }
        return false
      }

      case 'gte': {
        if (filter.variant === 'date' && typeof filter.value === 'string') {
          if (!value) return false
          // Safe type casting since we're checking type before using
          return (
            new Date(value as string | number | Date) >=
            new Date(Number(filter.value))
          )
        }
        if (filter.variant === 'number' || filter.variant === 'range') {
          return typeof value === 'number' && value >= Number(filter.value)
        }
        return false
      }

      case 'isBetween': {
        if (
          (filter.variant === 'date' || filter.variant === 'dateRange') &&
          Array.isArray(filter.value) &&
          filter.value.length === 2
        ) {
          if (!value) return false
          // Safe type casting since we're checking type before using
          const dateValue = new Date(value as string | number | Date)
          const startDate = filter.value[0]
            ? new Date(Number(filter.value[0]))
            : null
          const endDate = filter.value[1]
            ? new Date(Number(filter.value[1]))
            : null

          if (startDate && endDate) {
            return dateValue >= startDate && dateValue <= endDate
          }
          if (startDate) {
            return dateValue >= startDate
          }
          if (endDate) {
            return dateValue <= endDate
          }
          return false
        }
        if (
          (filter.variant === 'number' || filter.variant === 'range') &&
          Array.isArray(filter.value) &&
          filter.value.length === 2
        ) {
          const valNum = typeof value === 'number' ? value : Number.NaN
          const startNum =
            filter.value[0] === '' ? null : Number(filter.value[0])
          const endNum = filter.value[1] === '' ? null : Number(filter.value[1])

          if (startNum !== null && endNum !== null) {
            return valNum >= startNum && valNum <= endNum
          }
          if (startNum !== null) {
            return valNum >= startNum
          }
          if (endNum !== null) {
            return valNum <= endNum
          }
          return false
        }
        return false
      }

      case 'isRelativeToToday': {
        if (
          (filter.variant === 'date' || filter.variant === 'dateRange') &&
          typeof filter.value === 'string'
        ) {
          if (!value) return false
          const today = new Date()
          const [amountStr, unit] = filter.value.split(' ') ?? []
          if (!amountStr || !unit) return false

          const amount = Number.parseInt(amountStr)
          if (isNaN(amount)) return false

          let startDate: Date
          let endDate: Date

          switch (unit) {
            case 'days': {
              startDate = startOfDay(addDays(today, amount))
              endDate = endOfDay(startDate)
              break
            }
            case 'weeks': {
              startDate = startOfDay(addDays(today, amount * 7))
              endDate = endOfDay(addDays(startDate, 6))
              break
            }
            case 'months': {
              startDate = startOfDay(addDays(today, amount * 30))
              endDate = endOfDay(addDays(startDate, 29))
              break
            }
            default: {
              return false
            }
          }

          // Safe type casting since we're checking type before using
          const dateValue = new Date(value as string | number | Date)
          return dateValue >= startDate && dateValue <= endDate
        }
        return false
      }

      case 'isEmpty': {
        return isEmpty(value)
      }

      case 'isNotEmpty': {
        return !isEmpty(value)
      }

      default: {
        throw new Error(`Unsupported operator: ${filter.operator}`)
      }
    }
  }

  return (row: T) => {
    const results = filters.map((filter) => checkCondition(row, filter))
    if (joinOperator === 'and') {
      return results.every(Boolean)
    }
    if (joinOperator === 'or') {
      return results.some(Boolean)
    }
    return false
  }
}
