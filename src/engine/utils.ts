import type { DayOfWeek, Shift, SchedulerConfig } from '../types'
import { DAYS_OF_WEEK } from '../lib/constants'

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function shiftDurationHours(shift: Shift): number {
  let start = timeToMinutes(shift.start_time)
  let end = timeToMinutes(shift.end_time)
  if (end < start) {
    end += 24 * 60
  }
  return (end - start) / 60
}

export function dayIndex(day: DayOfWeek): number {
  return DAYS_OF_WEEK.indexOf(day)
}

export function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes)
}

export function getBreakTime(
  shift: Shift,
  config: SchedulerConfig
): { break_start: string; break_end: string; break_minutes: number } {
  const duration = shiftDurationHours(shift)
  if (duration <= config.break_threshold_hours) {
    return { break_start: '', break_end: '', break_minutes: 0 }
  }

  const startMinutes = timeToMinutes(shift.start_time)
  const endMinutes = timeToMinutes(shift.end_time)
  const actualEndMinutes = endMinutes < startMinutes ? endMinutes + 24 * 60 : endMinutes
  const midMinutes = startMinutes + (actualEndMinutes - startMinutes) / 2
  const halfBreak = config.break_duration_minutes / 2

  return {
    break_start: minutesToTime(midMinutes - halfBreak),
    break_end: minutesToTime(midMinutes + halfBreak),
    break_minutes: config.break_duration_minutes,
  }
}

export function hoursBetween(endTime: string, endDay: DayOfWeek, startTime: string, startDay: DayOfWeek): number {
  const endMinutes = timeToMinutes(endTime) + dayIndex(endDay) * 24 * 60
  const startMinutes = timeToMinutes(startTime) + dayIndex(startDay) * 24 * 60
  return (startMinutes - endMinutes) / 60
}

export function sortShifts(shifts: Shift[]): Shift[] {
  return [...shifts].sort((a, b) => {
    const dayDiff = dayIndex(a.day) - dayIndex(b.day)
    if (dayDiff !== 0) return dayDiff
    const startDiff = timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
    if (startDiff !== 0) return startDiff
    if (a.site !== b.site) return a.site.localeCompare(b.site)
    return a.shift_id.localeCompare(b.shift_id)
  })
}

export function countConsecutiveDays(days: DayOfWeek[]): number {
  if (days.length === 0) return 0
  const indices = [...new Set(days.map(dayIndex))].sort((a, b) => a - b)
  let maxConsecutive = 1
  let current = 1
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === indices[i - 1] + 1) {
      current++
      maxConsecutive = Math.max(maxConsecutive, current)
    } else {
      current = 1
    }
  }
  return maxConsecutive
}

export function formatDate(date = new Date()): string {
  return date.toISOString().split('T')[0]
}
