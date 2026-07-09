import type { Assignment, Employee } from '../types'

interface BreaksProps {
  assignments: Assignment[]
  employees: Employee[]
}

export default function Breaks({ assignments, employees }: BreaksProps) {
  const employeeMap = new Map(employees.map((e) => [e.employee_id, e]))

  // Group by employee, then by shift
  const byEmployee = new Map<string, Assignment[]>()
  for (const a of assignments) {
    if (a.break_minutes === 0) continue
    const list = byEmployee.get(a.employee_id) || []
    list.push(a)
    byEmployee.set(a.employee_id, list)
  }

  const sortedEmployeeIds = Array.from(byEmployee.keys()).sort()

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">Breaks</h3>
        <p className="text-sm text-slate-500">Each person's automatic break times.</p>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-120px)]">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-20 shadow-sm">
            <tr className="bg-[#0f172a] text-white">
              <th className="px-4 py-3 text-left font-medium">Employee</th>
              <th className="px-4 py-3 text-left font-medium">Day</th>
              <th className="px-4 py-3 text-left font-medium">Shift</th>
              <th className="px-4 py-3 text-left font-medium">Break</th>
              <th className="px-4 py-3 text-left font-medium">Duration</th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployeeIds.map((empId, empIndex) => {
              const empAssignments = byEmployee.get(empId)!
              return empAssignments.map((a, aIndex) => {
                const emp = employeeMap.get(empId)
                const breakStart = a.start_time
                  ? calculateBreakStart(a.start_time, a.end_time, a.break_minutes)
                  : ''
                const breakEnd = a.start_time
                  ? calculateBreakEnd(a.start_time, a.end_time, a.break_minutes)
                  : ''
                const rowIndex = empIndex + aIndex

                return (
                  <tr
                    key={`${empId}-${a.assignment_id}`}
                    className={rowIndex % 2 === 1 ? 'bg-[#F2F2F2]' : 'bg-white'}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {emp?.employee_name || empId}
                    </td>
                    <td className="px-4 py-3 text-slate-700 capitalize">{a.day}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {a.start_time}–{a.end_time}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {breakStart && breakEnd ? `${breakStart}–${breakEnd}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{a.break_minutes} min</td>
                  </tr>
                )
              })
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

function calculateBreakStart(start: string, end: string, breakMinutes: number): string {
  const startMin = timeToMinutes(start)
  let endMin = timeToMinutes(end)
  if (endMin < startMin) endMin += 24 * 60
  const mid = startMin + (endMin - startMin) / 2
  return minutesToTime(mid - breakMinutes / 2)
}

function calculateBreakEnd(start: string, end: string, breakMinutes: number): string {
  const startMin = timeToMinutes(start)
  let endMin = timeToMinutes(end)
  if (endMin < startMin) endMin += 24 * 60
  const mid = startMin + (endMin - startMin) / 2
  return minutesToTime(mid + breakMinutes / 2)
}
