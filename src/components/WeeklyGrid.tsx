import type { Employee, Assignment, Shift } from '../types'
import { DAYS_OF_WEEK, DAY_LABELS } from '../lib/constants'
import type { DayOfWeek } from '../types'

interface WeeklyGridProps {
  employees: Employee[]
  assignments: Assignment[]
  shifts: Shift[]
}

const ROLE_COLORS: Record<string, string> = {
  cleaning: 'bg-blue-100 text-blue-900 border-blue-300',
  security: 'bg-amber-100 text-amber-900 border-amber-300',
  maintenance: 'bg-emerald-100 text-emerald-900 border-emerald-300',
}

export default function WeeklyGrid({ employees, assignments }: WeeklyGridProps) {
  // Group assignments by employee_id and day
  const grid = new Map<string, Map<DayOfWeek, Assignment[]>>()

  for (const emp of employees) {
    grid.set(emp.employee_id, new Map())
    for (const day of DAYS_OF_WEEK) {
      grid.get(emp.employee_id)!.set(day, [])
    }
  }

  for (const a of assignments) {
    const empAssignments = grid.get(a.employee_id)
    if (empAssignments) {
      empAssignments.get(a.day)!.push(a)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 shrink-0">
        <h3 className="text-lg font-semibold text-slate-800">Weekly Schedule Grid</h3>
        <p className="text-sm text-slate-500">
          Employees × days. Each block shows task, floor, time, and break.
        </p>
      </div>
      <div className="overflow-auto h-[calc(100vh-120px)]">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#2C3E50] text-white">
              <th className="px-4 py-3 text-left font-medium sticky left-0 bg-[#2C3E50] z-30 min-w-[160px] border-r border-slate-600">
                Employee
              </th>
              {DAYS_OF_WEEK.map((day) => (
                <th
                  key={day}
                  className="px-3 py-3 text-center font-medium min-w-[150px] bg-[#2C3E50]"
                >
                  {DAY_LABELS[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, rowIndex) => {
              const empAssignments = grid.get(emp.employee_id)!
              const rowBg = rowIndex % 2 === 1 ? 'bg-[#F2F2F2]' : 'bg-white'

              return (
                <tr key={emp.employee_id} className={rowBg}>
                  <td
                    className={`px-4 py-3 font-medium text-slate-800 sticky left-0 z-10 border-r border-slate-200 min-w-[160px] ${rowBg}`}
                  >
                    {emp.employee_name}
                    <div className="text-xs text-slate-500 font-normal capitalize">
                      {emp.role} • {emp.site}
                    </div>
                  </td>
                  {DAYS_OF_WEEK.map((day) => {
                    const dayAssignments = empAssignments.get(day) || []
                    // Merge assignments that share the same shift
                    const byShift = new Map<string, Assignment[]>()
                    for (const a of dayAssignments) {
                      const list = byShift.get(a.shift_id) || []
                      list.push(a)
                      byShift.set(a.shift_id, list)
                    }

                    return (
                      <td key={day} className="px-2 py-2 align-top min-w-[150px]">
                        {Array.from(byShift.entries()).map(([shiftId, shiftAssignments]) => {
                          const roleClass =
                            ROLE_COLORS[emp.role] || 'bg-slate-100 text-slate-800 border-slate-300'
                          const tasks = shiftAssignments.map((a) => a.task_name).join(', ')
                          const floors = [...new Set(shiftAssignments.map((a) => a.floor))].join(', ')
                          const a = shiftAssignments[0]
                          const breakText =
                            a.break_minutes > 0 ? `Break: ${a.break_minutes}min` : 'No break'

                          return (
                            <div
                              key={shiftId}
                              className={`mb-1.5 rounded border p-2 text-xs ${roleClass}`}
                            >
                              <div className="font-semibold truncate">{tasks}</div>
                              <div className="truncate">{floors}</div>
                              <div className="text-[11px] opacity-90">
                                {a.start_time}–{a.end_time}
                              </div>
                              <div className="text-[11px] opacity-90">{breakText}</div>
                            </div>
                          )
                        })}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
