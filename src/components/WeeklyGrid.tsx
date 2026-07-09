import type { Employee, Assignment, Shift } from '../types'
import { DAYS_OF_WEEK, DAY_LABELS } from '../lib/constants'
import type { DayOfWeek } from '../types'

interface WeeklyGridProps {
  employees: Employee[]
  assignments: Assignment[]
  shifts: Shift[]
}

const ROLE_COLORS: Record<string, string> = {
  cleaning: 'bg-[#ebf5fb] text-[#2980b9] border-[#aed6f1]',
  security: 'bg-[#fef9e7] text-[#b7950b] border-[#f9e79f]',
  maintenance: 'bg-[#eafaf1] text-[#239b56] border-[#a9dfbf]',
}

export default function WeeklyGrid({ employees, assignments }: WeeklyGridProps) {
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
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 sm:p-6 border-b border-slate-200 shrink-0">
        <h3 className="text-lg font-light text-slate-700">Weekly Schedule Grid</h3>
        <p className="text-sm font-light text-slate-400 mt-1">
          Employees × days. Each block shows task, floor, time, and break.
        </p>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse min-w-[800px]">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#2C3E50] text-white">
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-light sticky left-0 bg-[#2C3E50] z-30 min-w-[160px] sm:min-w-[180px] border-r border-slate-600">
                Employee
              </th>
              {DAYS_OF_WEEK.map((day) => (
                <th
                  key={day}
                  className="px-3 sm:px-4 py-3 sm:py-4 text-center font-light min-w-[120px] sm:min-w-[150px] bg-[#2C3E50]"
                >
                  {DAY_LABELS[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, rowIndex) => {
              const empAssignments = grid.get(emp.employee_id)!
              const rowBg = rowIndex % 2 === 1 ? 'bg-[#f2f4f6]' : 'bg-white'

              return (
                <tr key={emp.employee_id} className={`${rowBg} transition-colors hover:bg-slate-50`}>
                  <td
                    className={`px-4 sm:px-6 py-3 sm:py-4 font-light text-slate-700 sticky left-0 z-10 border-r border-slate-200 min-w-[160px] sm:min-w-[180px] ${rowBg}`}
                  >
                    {emp.employee_name}
                    <div className="text-xs font-light text-slate-400 capitalize">
                      {emp.role} • {emp.site}
                    </div>
                  </td>
                  {DAYS_OF_WEEK.map((day) => {
                    const dayAssignments = empAssignments.get(day) || []
                    const byShift = new Map<string, Assignment[]>()
                    for (const a of dayAssignments) {
                      const list = byShift.get(a.shift_id) || []
                      list.push(a)
                      byShift.set(a.shift_id, list)
                    }

                    return (
                      <td key={day} className="px-2 sm:px-3 py-2 sm:py-3 align-top min-w-[120px] sm:min-w-[150px]">
                        {Array.from(byShift.entries()).map(([shiftId, shiftAssignments]) => {
                          const roleClass =
                            ROLE_COLORS[emp.role] || 'bg-[#f2f4f6] text-slate-600 border-slate-200'
                          const tasks = shiftAssignments.map((a) => a.task_name).join(', ')
                          const floors = [...new Set(shiftAssignments.map((a) => a.floor))].join(', ')
                          const a = shiftAssignments[0]
                          const breakText =
                            a.break_minutes > 0 ? `Break: ${a.break_minutes}min` : 'No break'

                          return (
                            <div
                              key={shiftId}
                              className={`mb-2 rounded-xl border p-2 sm:p-3 text-xs font-light ${roleClass}`}
                            >
                              <div className="font-normal truncate">{tasks}</div>
                              <div className="truncate opacity-80">{floors}</div>
                              <div className="text-[11px] opacity-70">
                                {a.start_time}–{a.end_time}
                              </div>
                              <div className="text-[11px] opacity-70">{breakText}</div>
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
