import type { Assignment, Conflict, Employee, ScheduleResult } from '../types'

export function exportScheduleCsv(assignments: Assignment[], employees: Employee[]): void {
  // Placeholder - implemented in step 6
  console.log('Export schedule CSV', assignments.length, employees.length)
}

export function exportProblemsCsv(conflicts: Conflict[]): void {
  // Placeholder - implemented in step 6
  console.log('Export problems CSV', conflicts.length)
}

export function exportReportHtml(result: ScheduleResult, employees: Employee[]): void {
  // Placeholder - implemented in step 6
  console.log('Export report HTML', result.assignments.length, employees.length)
}
