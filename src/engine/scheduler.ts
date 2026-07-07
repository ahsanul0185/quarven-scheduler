import type {
  Employee,
  Shift,
  Task,
  SchedulerConfig,
  Assignment,
  Conflict,
  ConflictType,
  ScheduleResult,
  ScheduleStats,
  DayOfWeek,
} from '../types'
import {
  shiftDurationHours,
  shiftCrossesMidnight,
  sortShifts,
  countConsecutiveDays,
  getBreakTime,
  getShiftEndDay,
  hoursBetween,
} from './utils'

interface EmployeeState {
  weeklyHours: number
  workedDays: DayOfWeek[]
  lastShiftEnd: { day: DayOfWeek; time: string } | null
}

interface CandidateCheck {
  employee_id: string
  available: boolean
  conflict_type?: ConflictType
  detail?: string
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

  const shiftsWithTaskConflict = new Set<string>()

  for (const shift of sortedShifts) {
    const shiftTasks = tasksByShift.get(shift.shift_id) || []
    const shiftDuration = shiftDurationHours(shift)
    const assignedEmployeeIds = new Set<string>()
    const taskAssignments = new Map<string, string[]>() // task_id -> employee_ids

    // Step 1: assign each task its required headcount
    for (const task of shiftTasks) {
      const assigned: string[] = []
      const candidateChecks = getCandidateChecksForTask(
        task,
        shift,
        employees,
        employeeStates,
        assignedEmployeeIds,
        config,
        shiftDuration
      )

      let firstBlock: CandidateCheck | null = null

      for (const check of candidateChecks) {
        if (assigned.length >= task.required_headcount) break

        if (!check.available) {
          if (check.conflict_type && !firstBlock) {
            firstBlock = check
          }
          continue
        }

        const candidateId = check.employee_id
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
        const conflict = buildTaskConflict(
          task,
          shift,
          assigned.length,
          firstBlock,
          employees
        )
        conflicts.push(conflict)
        shiftsWithTaskConflict.add(shift.shift_id)
      }
    }

    // Step 2: check shift minimum staffing after task assignments
    // Only add a shift-level conflict if task-level conflicts did not already report the issue.
    if (!shiftsWithTaskConflict.has(shift.shift_id) && assignedEmployeeIds.size < shift.min_staff) {
      // Collect reasons from any matching employee not already on shift
      const candidateChecks = getGeneralCandidateChecks(
        shift,
        employees,
        employeeStates,
        assignedEmployeeIds,
        config,
        shiftDuration
      )

      let firstBlock: CandidateCheck | null = null
      for (const check of candidateChecks) {
        if (check.conflict_type && !firstBlock) {
          firstBlock = check
          break
        }
      }

      const conflict = buildShiftConflict(
        shift,
        assignedEmployeeIds.size,
        firstBlock,
        employees
      )
      conflicts.push(conflict)
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

function getCandidateChecksForTask(
  task: Task,
  shift: Shift,
  employees: Employee[],
  employeeStates: Map<string, EmployeeState>,
  alreadyAssigned: Set<string>,
  config: SchedulerConfig,
  shiftDuration: number
): CandidateCheck[] {
  // Employees already assigned to this shift are always valid for another task in the same shift
  const alreadyOnShift = employees
    .filter(
      (emp) =>
        alreadyAssigned.has(emp.employee_id) &&
        emp.site === shift.site &&
        emp.role === task.required_role &&
        (!task.required_skill || emp.skills.includes(task.required_skill))
    )
    .map((emp) => ({ employee_id: emp.employee_id, available: true }))
    .sort((a, b) => a.employee_id.localeCompare(b.employee_id))

  const notOnShift = employees
    .filter((emp) => {
      if (emp.site !== shift.site) return false
      if (emp.role !== task.required_role) return false
      if (task.required_skill && !emp.skills.includes(task.required_skill)) return false
      return !alreadyAssigned.has(emp.employee_id)
    })
    .map((emp) =>
      checkEmployeeAvailability(emp, shift, employeeStates, config, shiftDuration)
    )
    .sort((a, b) => a.employee_id.localeCompare(b.employee_id))

  // Prefer new employees when we are still below min_staff to spread work across the team
  if (alreadyAssigned.size < shift.min_staff) {
    return [...notOnShift, ...alreadyOnShift]
  }

  return [...alreadyOnShift, ...notOnShift]
}

function getGeneralCandidateChecks(
  shift: Shift,
  employees: Employee[],
  employeeStates: Map<string, EmployeeState>,
  alreadyAssigned: Set<string>,
  config: SchedulerConfig,
  shiftDuration: number
): CandidateCheck[] {
  return employees
    .filter((emp) => {
      if (emp.site !== shift.site) return false
      if (emp.role !== shift.role) return false
      return !alreadyAssigned.has(emp.employee_id)
    })
    .map((emp) =>
      checkEmployeeAvailability(emp, shift, employeeStates, config, shiftDuration)
    )
    .sort((a, b) => a.employee_id.localeCompare(b.employee_id))
}

function checkEmployeeAvailability(
  emp: Employee,
  shift: Shift,
  employeeStates: Map<string, EmployeeState>,
  config: SchedulerConfig,
  shiftDuration: number
): CandidateCheck {
  const availability = emp.availability[shift.day]
  if (availability === 'unavailable') {
    return {
      employee_id: emp.employee_id,
      available: false,
    }
  }

  if (availability === 'partial' && shiftDuration > config.partial_day_max_hours) {
    return {
      employee_id: emp.employee_id,
      available: false,
    }
  }

  const state = employeeStates.get(emp.employee_id)
  if (!state) {
    return {
      employee_id: emp.employee_id,
      available: false,
      conflict_type: 'understaffed',
      detail: `Employee ${emp.employee_id} state not found.`,
    }
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
      return {
        employee_id: emp.employee_id,
        available: false,
        conflict_type: 'rest_violation',
        detail: `Employee ${emp.employee_id} has less than ${config.min_rest_hours} hours rest between the end of their previous shift and the start of shift ${shift.shift_id}.`,
      }
    }
  }

  // Weekly hours
  if (state.weeklyHours + shiftDuration > config.max_weekly_hours) {
    const projected = Math.round((state.weeklyHours + shiftDuration) * 10) / 10
    return {
      employee_id: emp.employee_id,
      available: false,
      conflict_type: 'weekly_hours_exceeded',
      detail: `Assigning employee ${emp.employee_id} to shift ${shift.shift_id} would bring their weekly total to ${projected} hours which exceeds the ${config.max_weekly_hours} hour limit.`,
    }
  }

  // Consecutive days
  const projectedDays = [...state.workedDays, shift.day]
  if (countConsecutiveDays(projectedDays) > config.max_consecutive_days) {
    return {
      employee_id: emp.employee_id,
      available: false,
      conflict_type: 'consecutive_days_exceeded',
      detail: `Employee ${emp.employee_id} has already been assigned shifts on ${config.max_consecutive_days} consecutive days and cannot be assigned to shift ${shift.shift_id} on day ${projectedDays.length}.`,
    }
  }

  return { employee_id: emp.employee_id, available: true }
}

function buildTaskConflict(
  task: Task,
  shift: Shift,
  assignedCount: number,
  firstBlock: CandidateCheck | null,
  employees: Employee[]
): Conflict {
  if (firstBlock?.conflict_type && firstBlock.detail) {
    const emp = employees.find((e) => e.employee_id === firstBlock.employee_id)
    const detail = firstBlock.detail.replace(
      firstBlock.employee_id,
      emp?.employee_name || firstBlock.employee_id
    )
    return {
      conflict_type: firstBlock.conflict_type,
      shift_id: shift.shift_id,
      site: shift.site,
      role: task.required_role,
      day: shift.day,
      detail,
    }
  }

  return {
    conflict_type: 'understaffed',
    shift_id: shift.shift_id,
    site: shift.site,
    role: task.required_role,
    day: shift.day,
    detail: `Task ${task.task_id} on ${task.floor} has ${assignedCount} assigned staff but requires a team of ${task.required_headcount}.`,
  }
}

function buildShiftConflict(
  shift: Shift,
  assignedCount: number,
  firstBlock: CandidateCheck | null,
  employees: Employee[]
): Conflict {
  if (firstBlock?.conflict_type && firstBlock.detail) {
    const emp = employees.find((e) => e.employee_id === firstBlock.employee_id)
    const detail = firstBlock.detail.replace(
      firstBlock.employee_id,
      emp?.employee_name || firstBlock.employee_id
    )
    return {
      conflict_type: firstBlock.conflict_type,
      shift_id: shift.shift_id,
      site: shift.site,
      role: shift.role,
      day: shift.day,
      detail,
    }
  }

  return {
    conflict_type: 'understaffed',
    shift_id: shift.shift_id,
    site: shift.site,
    role: shift.role,
    day: shift.day,
    detail: `Shift ${shift.shift_id} has ${assignedCount} assigned staff but requires a minimum of ${shift.min_staff}.`,
  }
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

  // Overnight shifts also touch the next calendar day
  if (shiftCrossesMidnight(shift)) {
    const endDay = getShiftEndDay(shift)
    if (!state.workedDays.includes(endDay)) {
      state.workedDays.push(endDay)
    }
  }

  state.lastShiftEnd = { day: getShiftEndDay(shift), time: shift.end_time }
}

function computeStats(
  shifts: Shift[],
  assignments: Assignment[],
  conflicts: Conflict[]
): ScheduleStats {
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

  const totalAssignedHours = assignments.reduce((sum, a) => sum + a.duration_hours, 0)
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
