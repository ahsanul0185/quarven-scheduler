import Papa from 'papaparse'
import type {
  DayOfWeek,
  Employee,
  Shift,
  Task,
  SchedulerConfig,
  Role,
  AvailabilityStatus,
} from '../types'
import { DEFAULT_CONFIG } from './config'
import { DAYS_OF_WEEK } from './constants'

const VALID_ROLES: Role[] = ['cleaning', 'security', 'maintenance']
const VALID_AVAILABILITY: AvailabilityStatus[] = ['available', 'unavailable', 'partial']

function assertRole(value: string): Role {
  const normalized = value.toLowerCase().trim()
  if (!VALID_ROLES.includes(normalized as Role)) {
    throw new Error(`Invalid role: "${value}". Expected one of: ${VALID_ROLES.join(', ')}`)
  }
  return normalized as Role
}

function assertAvailability(value: string): AvailabilityStatus {
  const normalized = value.toLowerCase().trim()
  if (!VALID_AVAILABILITY.includes(normalized as AvailabilityStatus)) {
    throw new Error(`Invalid availability: "${value}". Expected one of: ${VALID_AVAILABILITY.join(', ')}`)
  }
  return normalized as AvailabilityStatus
}

function parseNumber(value: string, field: string): number {
  const num = Number(value)
  if (Number.isNaN(num)) {
    throw new Error(`Invalid number for ${field}: "${value}"`)
  }
  return num
}

export function parseEmployeesCsv(csv: string): Employee[] {
  const result = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transform: (value) => value.trim(),
  })

  if (result.errors.length > 0) {
    throw new Error(`Failed to parse employees CSV: ${result.errors[0].message}`)
  }

  return result.data.map((row, index) => {
    const availability: Record<DayOfWeek, AvailabilityStatus> = {
      monday: 'unavailable',
      tuesday: 'unavailable',
      wednesday: 'unavailable',
      thursday: 'unavailable',
      friday: 'unavailable',
      saturday: 'unavailable',
      sunday: 'unavailable',
    }

    for (const day of DAYS_OF_WEEK) {
      const value = row[day]
      if (value === undefined || value === '') {
        availability[day] = 'unavailable'
      } else {
        availability[day] = assertAvailability(value)
      }
    }

    if (!row.employee_id) {
      throw new Error(`Missing employee_id at row ${index + 2}`)
    }

    return {
      employee_id: row.employee_id,
      employee_name: row.employee_name || row.employee_id,
      site: row.site || '',
      role: assertRole(row.role),
      skills: row.skills
        ? row.skills
            .split(';')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
        : [],
      availability,
    }
  })
}

export function parseShiftsCsv(csv: string): Shift[] {
  const result = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transform: (value) => value.trim(),
  })

  if (result.errors.length > 0) {
    throw new Error(`Failed to parse shifts CSV: ${result.errors[0].message}`)
  }

  return result.data.map((row, index) => {
    if (!row.shift_id) {
      throw new Error(`Missing shift_id at row ${index + 2}`)
    }

    return {
      shift_id: row.shift_id,
      site: row.site || '',
      role: assertRole(row.role),
      day: assertDay(row.day),
      start_time: row.start_time,
      end_time: row.end_time,
      min_staff: parseNumber(row.min_staff, 'min_staff'),
      max_staff: parseNumber(row.max_staff, 'max_staff'),
    }
  })
}

function assertDay(value: string): DayOfWeek {
  const normalized = value.toLowerCase().trim() as DayOfWeek
  if (!DAYS_OF_WEEK.includes(normalized)) {
    throw new Error(`Invalid day: "${value}"`)
  }
  return normalized
}

export function parseTasksCsv(csv: string): Task[] {
  const result = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transform: (value) => value.trim(),
  })

  if (result.errors.length > 0) {
    throw new Error(`Failed to parse tasks CSV: ${result.errors[0].message}`)
  }

  return result.data.map((row, index) => {
    if (!row.task_id) {
      throw new Error(`Missing task_id at row ${index + 2}`)
    }

    const skill = row.required_skill ? row.required_skill.toLowerCase().trim() : ''

    return {
      task_id: row.task_id,
      shift_id: row.shift_id,
      task_name: row.task_name || '',
      floor: row.floor || '',
      required_role: assertRole(row.required_role),
      required_skill: skill || null,
      required_headcount: parseNumber(row.required_headcount, 'required_headcount'),
    }
  })
}

export function parseConfigJson(json: string): SchedulerConfig {
  let parsed: Partial<SchedulerConfig>
  try {
    parsed = JSON.parse(json) as Partial<SchedulerConfig>
  } catch {
    throw new Error('Config file is not valid JSON')
  }

  return {
    min_rest_hours: parseConfigNumber(parsed.min_rest_hours, DEFAULT_CONFIG.min_rest_hours, 'min_rest_hours'),
    max_weekly_hours: parseConfigNumber(parsed.max_weekly_hours, DEFAULT_CONFIG.max_weekly_hours, 'max_weekly_hours'),
    max_consecutive_days: parseConfigNumber(parsed.max_consecutive_days, DEFAULT_CONFIG.max_consecutive_days, 'max_consecutive_days'),
    break_threshold_hours: parseConfigNumber(parsed.break_threshold_hours, DEFAULT_CONFIG.break_threshold_hours, 'break_threshold_hours'),
    break_duration_minutes: parseConfigNumber(parsed.break_duration_minutes, DEFAULT_CONFIG.break_duration_minutes, 'break_duration_minutes'),
    partial_day_max_hours: parseConfigNumber(parsed.partial_day_max_hours, DEFAULT_CONFIG.partial_day_max_hours, 'partial_day_max_hours'),
  }
}

function parseConfigNumber(value: unknown, fallback: number, field: string): number {
  if (value === undefined || value === null || value === '') {
    return fallback
  }
  const num = Number(value)
  if (Number.isNaN(num)) {
    throw new Error(`Invalid number for config ${field}: "${value}"`)
  }
  return num
}

export function parseConfigCsv(csv: string): SchedulerConfig {
  const result = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transform: (value) => value.trim(),
  })

  if (result.errors.length > 0) {
    throw new Error(`Failed to parse config CSV: ${result.errors[0].message}`)
  }

  const partial: Partial<SchedulerConfig> = {}

  for (const row of result.data) {
    const key = row.key || row.setting || row.config_key
    const value = row.value || row.config_value
    if (key && value !== undefined) {
      ;(partial as Record<string, number | undefined>)[key] = Number(value)
    }
  }

  return parseConfigJson(JSON.stringify(partial))
}

export function detectAndParseConfig(content: string): SchedulerConfig {
  const trimmed = content.trim()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return parseConfigJson(content)
  }
  return parseConfigCsv(content)
}
