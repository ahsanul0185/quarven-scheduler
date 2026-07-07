import type { SchedulerConfig } from '../types'

export const DEFAULT_CONFIG: SchedulerConfig = {
  min_rest_hours: 10,
  max_weekly_hours: 48,
  max_consecutive_days: 5,
  break_threshold_hours: 6,
  break_duration_minutes: 30,
  partial_day_max_hours: 6,
}

export function mergeConfig(partial: Partial<SchedulerConfig>): SchedulerConfig {
  return {
    min_rest_hours: partial.min_rest_hours ?? DEFAULT_CONFIG.min_rest_hours,
    max_weekly_hours: partial.max_weekly_hours ?? DEFAULT_CONFIG.max_weekly_hours,
    max_consecutive_days: partial.max_consecutive_days ?? DEFAULT_CONFIG.max_consecutive_days,
    break_threshold_hours: partial.break_threshold_hours ?? DEFAULT_CONFIG.break_threshold_hours,
    break_duration_minutes: partial.break_duration_minutes ?? DEFAULT_CONFIG.break_duration_minutes,
    partial_day_max_hours: partial.partial_day_max_hours ?? DEFAULT_CONFIG.partial_day_max_hours,
  }
}
