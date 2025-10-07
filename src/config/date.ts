export const dateFormatPatterns = {
  fullDate: 'dd/MM/yyyy',
  shortDate: 'dd/MM/yy',
  fullDateTime: "dd/MM/yyyy 'lúc' HH'h'mm",
  shortDateTime: "dd/MM/yy HH'h'mm",
  standardizedDate: 'yyyy-MM-dd',
  fullDateWithDay: "'Ngày' dd 'tháng' MM 'năm' yyyy",
  time24Hour: "HH'h'mm",
  time12Hour: "HH'h'mm",
}

// Vietnamese day names (starting from Monday)
export const vietnameseDayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

// Get Vietnamese day name from date (Monday = 0, Sunday = 6)
export const getVietnameseDayName = (date: Date): string => {
  // Convert Sunday (0) to 6, and Monday-Saturday (1-6) to 0-5
  const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1
  return vietnameseDayNames[dayIndex]
}

// Vietnamese messages
export const vietnameseMessages = {
  day: 'Ngày',
  of: 'của',
}

// Vietnamese month names
export const vietnameseMonthNames = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
]
