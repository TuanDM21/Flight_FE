import type { ExtendedColumnSort } from '@/types/data-table'

type SortDirection = 'asc' | 'desc'

// Helper function for string comparison
function compareStrings(
  a: string,
  b: string,
  direction: SortDirection
): number {
  return direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
}

// Helper function for number comparison
function compareNumbers(
  a: number,
  b: number,
  direction: SortDirection
): number {
  return direction === 'asc' ? a - b : b - a
}

// Helper function for date comparison
function compareDates(a: Date, b: Date, direction: SortDirection): number {
  return direction === 'asc'
    ? a.getTime() - b.getTime()
    : b.getTime() - a.getTime()
}

/**
 * Sorts an array of items based on the provided sort configuration
 * @param data The array of data to sort
 * @param sortConfig The sort configuration
 * @returns A new sorted array
 */
export function sortColumns<T>(
  data: T[],
  sortConfig: ExtendedColumnSort<T>[]
): T[] {
  if (sortConfig.length === 0 || data.length === 0) {
    return [...data]
  }

  return [...data].sort((a, b) => {
    // Iterate through each sort criterion in order
    for (const sort of sortConfig) {
      const { id, desc } = sort
      const direction = desc ? 'desc' : 'asc'

      const valueA = a[id]
      const valueB = b[id]

      // Handle null/undefined values
      if (valueA == null && valueB == null) continue
      if (valueA == null) return direction === 'asc' ? -1 : 1
      if (valueB == null) return direction === 'asc' ? 1 : -1

      // Compare values based on their type
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        // Try to parse as dates first if they look like dates
        try {
          const dateA = new Date(valueA)
          const dateB = new Date(valueB)
          if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            const result = compareDates(dateA, dateB, direction)
            if (result !== 0) return result
          } else {
            // Regular string comparison
            const result = compareStrings(valueA, valueB, direction)
            if (result !== 0) return result
          }
        } catch {
          // If parsing fails, compare as strings
          const result = compareStrings(valueA, valueB, direction)
          if (result !== 0) return result
        }
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        const result = compareNumbers(valueA, valueB, direction)
        if (result !== 0) return result
      } else if (valueA instanceof Date && valueB instanceof Date) {
        const result = compareDates(valueA, valueB, direction)
        if (result !== 0) return result
      } else {
        // For other types, convert to string and compare
        const result = compareStrings(String(valueA), String(valueB), direction)
        if (result !== 0) return result
      }
    }

    // If all comparisons result in equal values, maintain original order
    return 0
  })
}
