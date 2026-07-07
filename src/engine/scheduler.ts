import type {
  Employee,
  Shift,
  Task,
  SchedulerConfig,
  Assignment,
  Conflict,
  ScheduleResult,
  ScheduleStats,
  DayOfWeek,
} from '../types'
import {
  shiftDurationHours,
  sortShifts,
  countConsecutiveDays,
  getBreakTime,
  hoursBetween,
} from './utils'

interface EmployeeState {
  weeklyHours: number
  workedDays: DayOfWeek[]
  lastShiftEnd: { day: DayOfWeek; time: string } | null
}

export function generateSchedule(
  employees: Employee[],
  shifts: Shift[],
  tasks: Task[],
  config: SchedulerConfig
): ScheduleResult {
  const sortedShifts = sortShifts(shifts)
  const tasksByShift = new Map<string, Task[]>()

  for (const task of tasks) {
    const list = tasksByShift.get(task.shift_id) || []
    list.push(task)
    tasksByShift.set(task.shift_id, list)
  }

  const employeeStates = new Map<string, EmployeeState>()
  for (const emp of employees) {
    employeeStates.set(emp.employee_id, {
      weeklyHours: 0,
      workedDays: [],
      lastShiftEnd: null,
    })
  }

  const assignments: Assignment[] = []
  const conflicts: Conflict[] = []
  const employeeLookup = new Map(employees.map((e) => [e.employee_id, e]))
  const assignmentIdCounter = { value: 1 }

  for (const shift of sortedShifts) {
    const shiftTasks = tasksByShift.get(shift.shift_id) || []
    const shiftDuration = shiftDurationHours(shift)
    const assignedEmployeeIds = new Set<string>()
    const taskAssignments = new Map<string, string[]>() // task_id -> employee_ids

    // Step 1: assign each task its required headcount
    for (const task of shiftTasks) {
      const assigned: string[] = []
      const candidates = getCandidatesForTask(
        task,
        shift,
        employees,
        employeeStates,
        assignedEmployeeIds,
        config,
        shiftDuration
      )

      for (const candidateId of candidates) {
        if (assigned.length >= task.required_headcount) break
        if (assignedEmployeeIds.has(candidateId)) {
          assigned.push(candidateId)
          continue
        }
        if (assignedEmployeeIds.size >= shift.max_staff) break

        assigned.push(candidateId)
        assignedEmployeeIds.add(candidateId)
        updateEmployeeState(candidateId, shift, shiftDuration, employeeStates)
      }

      taskAssignments.set(task.task_id, assigned)

      if (assigned.length < task.required_headcount) {
        conflicts.push({
          conflict_type: 'understaffed',
          shift_id: shift.shift_id,
          site: shift.site,
          role: task.required_role,
          day: shift.day,
          detail: `Task ${task.task_id} on ${task.floor} has ${assigned.length} assigned staff but requires a team of ${task.required_headcount}.`,
        })
      }
    }

    // Step 2: ensure shift minimum staffing (add general staff of shift role if needed)
    if (assignedEmployeeIds.size < shift.min_staff) {
      const generalCandidates = getGeneralCandidates(
        shift,
        employees,
        employeeStates,
        assignedEmployeeIds,
        config,
        shiftDuration
      )

      for (const candidateId of generalCandidates) {
        if (assignedEmployeeIds.size >= shift.min_staff) break
        if (assignedEmployeeIds.has(candidateId)) continue

        assignedEmployeeIds.add(candidateId)
        updateEmployeeState(candidateId, shift, shiftDuration, employeeStates)
      }

      if (assignedEmployeeIds.size < shift.min_staff) {
        conflicts.push({
          conflict_type: 'understaffed',
          shift_id: shift.shift_id,
          site: shift.site,
          role: shift.role,
          day: shift.day,
          detail: `Shift ${shift.shift_id} has ${assignedEmployeeIds.size} assigned staff but requires a minimum of ${shift.min_staff}.`,
        })
      }
    }

    // Step 3: create Assignment records for each task based on who ended up assigned
    const breakInfo = getBreakTime(shift, config)
    for (const task of shiftTasks) {
      const taskEmployeeIds = taskAssignments.get(task.task_id) || []
      for (const employeeId of taskEmployeeIds) {
        const emp = employeeLookup.get(employeeId)
        if (!emp) continue
        assignments.push({
          assignment_id: `A-${(assignmentIdCounter.value++).toString().padStart(5, '0')}`,
          employee_id: employeeId,
          shift_id: shift.shift_id,
          task_id: task.task_id,
          day: shift.day,
          start_time: shift.start_time,
          end_time: shift.end_time,
          duration_hours: shiftDuration,
          break_minutes: breakInfo.break_minutes,
          floor: task.floor,
          task_name: task.task_name,
        })
      }
    }
  }

  const stats = computeStats(shifts, assignments, conflicts)

  return {
    assignments,
    conflicts,
    stats,
    generated_at: new Date().toISOString(),
  }
}

function getCandidatesForTask(
  task: Task,
  shift: Shift,
  employees: Employee[],
  employeeStates: Map<string, EmployeeState>,
  alreadyAssigned: Set<string>,
  config: SchedulerConfig,
  shiftDuration: number
): string[] {
  const candidates = employees
    .filter((emp) => {
      if (emp.site !== shift.site) return false
      if (emp.role !== task.required_role) return false
      if (task.required_skill && !emp.skills.includes(task.required_skill)) return false
      return isEmployeeAvailableForShift(emp, shift, employeeStates, config, shiftDuration)
    })
    .map((emp) => emp.employee_id)
    .sort()

  // Prioritize employees already assigned to this shift (can cover multiple tasks)
  const alreadyOnShift = candidates.filter((id) => alreadyAssigned.has(id))
  const notOnShift = candidates.filter((id) => !alreadyAssigned.has(id))
  return [...alreadyOnShift, ...notOnShift]
}

function getGeneralCandidates(
  shift: Shift,
  employees: Employee[],
  employeeStates: Map<string, EmployeeState>,
  alreadyAssigned: Set<string>,
  config: SchedulerConfig,
  shiftDuration: number
): string[] {
  return employees
    .filter((emp) => {
      if (emp.site !== shift.site) return false
      if (emp.role !== shift.role) return false
      if (alreadyAssigned.has(emp.employee_id)) return false
      return isEmployeeAvailableForShift(emp, shift, employeeStates, config, shiftDuration)
    })
    .map((emp) => emp.employee_id)
    .sort()
}

function isEmployeeAvailableForShift(
  emp: Employee,
  shift: Shift,
  employeeStates: Map<string, EmployeeState>,
  config: SchedulerConfig,
  shiftDuration: number
): boolean {
  const availability = emp.availability[shift.day]
  if (availability === 'unavailable') return false
  if (availability === 'partial' && shiftDuration > config.partial_day_max_hours) return false

  const state = employeeStates.get(emp.employee_id)
  if (!state) return false

  // Weekly hours
  if (state.weeklyHours + shiftDuration > config.max_weekly_hours) {
    return false
  }

  // Rest between shifts
  if (state.lastShiftEnd) {
    const restHours = hoursBetween(
      state.lastShiftEnd.time,
      state.lastShiftEnd.day,
      shift.start_time,
      shift.day
    )
    if (restHours < config.min_rest_hours) {
      return false
    }
  }

  // Consecutive days
  const projectedDays = [...state.workedDays, shift.day]
  if (countConsecutiveDays(projectedDays) > config.max_consecutive_days) {
    return false
  }

  return true
}

function updateEmployeeState(
  employeeId: string,
  shift: Shift,
  shiftDuration: number,
  employeeStates: Map<string, EmployeeState>
): void {
  const state = employeeStates.get(employeeId)
  if (!state) return

  state.weeklyHours += shiftDuration
  if (!state.workedDays.includes(shift.day)) {
    state.workedDays.push(shift.day)
  }
  state.lastShiftEnd = { day: shift.day, time: shift.end_time }
}

function computeStats(
  shifts: Shift[],
  assignments: Assignment[],
  conflicts: Conflict[]
): ScheduleStats {
  const assignmentsByShift = new Map<string, number>()
  for (const a of assignments) {
    assignmentsByShift.set(a.shift_id, (assignmentsByShift.get(a.shift_id) || 0) + 1)
  }

  // A shift is "staffed" if it has at least min_staff unique employees
  const staffedShifts = new Set<string>()
  const understaffedShifts = new Set<string>()

  for (const shift of shifts) {
    const uniqueEmployees = new Set(
      assignments.filter((a) => a.shift_id === shift.shift_id).map((a) => a.employee_id)
    )
    if (uniqueEmployees.size >= shift.min_staff) {
      staffedShifts.add(shift.shift_id)
    } else {
      understaffedShifts.add(shift.shift_id)
    }
  }

  const totalAssignedHours = assignments.reduce(
    (sum, a) => sum + a.duration_hours,
    0
  )

  const coveragePercent = shifts.length > 0 ? (staffedShifts.size / shifts.length) * 100 : 0

  return {
    total_shifts: shifts.length,
    staffed_shifts: staffedShifts.size,
    understaffed_shifts: understaffedShifts.size,
    coverage_percent: Math.round(coveragePercent * 10) / 10,
    total_conflicts: conflicts.length,
    total_assigned_hours: Math.round(totalAssignedHours * 10) / 10,
  }
}
