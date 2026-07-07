import type { DayOfWeek } from '../types'

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
}

export const CONFLICT_TYPE_LABELS: Record<string, string> = {
  understaffed: 'Understaffed',
  rest_violation: 'Not enough rest',
  weekly_hours_exceeded: 'Too many weekly hours',
  consecutive_days_exceeded: 'Too many days in a row',
}
