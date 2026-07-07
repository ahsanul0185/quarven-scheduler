export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type AvailabilityStatus = 'available' | 'unavailable' | 'partial'

export type Role = 'cleaning' | 'security' | 'maintenance'

export type ConflictType =
  | 'understaffed'
  | 'rest_violation'
  | 'weekly_hours_exceeded'
  | 'consecutive_days_exceeded'

export interface Employee {
  employee_id: string
  employee_name: string
  site: string
  role: Role
  skills: string[]
  availability: Record<DayOfWeek, AvailabilityStatus>
}

export interface Shift {
  shift_id: string
  site: string
  role: Role
  day: DayOfWeek
  start_time: string // HH:mm
  end_time: string // HH:mm
  min_staff: number
  max_staff: number
}

export interface Task {
  task_id: string
  shift_id: string
  task_name: string
  floor: string
  required_role: Role
  required_skill: string | null
  required_headcount: number
}

export interface SchedulerConfig {
  min_rest_hours: number
  max_weekly_hours: number
  max_consecutive_days: number
  break_threshold_hours: number
  break_duration_minutes: number
  partial_day_max_hours: number
}

export interface Assignment {
  assignment_id: string
  employee_id: string
  shift_id: string
  task_id: string
  day: DayOfWeek
  start_time: string
  end_time: string
  duration_hours: number
  break_minutes: number
  floor: string
  task_name: string
}

export interface Conflict {
  conflict_type: ConflictType
  shift_id: string
  site: string
  role: Role
  day: DayOfWeek
  detail: string
}

export interface ScheduleStats {
  total_shifts: number
  staffed_shifts: number
  understaffed_shifts: number
  coverage_percent: number
  total_conflicts: number
  total_assigned_hours: number
}

export interface ScheduleResult {
  assignments: Assignment[]
  conflicts: Conflict[]
  stats: ScheduleStats
  generated_at: string
}

export interface ParsedInput {
  employees: Employee[]
  shifts: Shift[]
  tasks: Task[]
  config: SchedulerConfig
}

export interface ShiftAssignments {
  shift_id: string
  assignments: Assignment[]
}
