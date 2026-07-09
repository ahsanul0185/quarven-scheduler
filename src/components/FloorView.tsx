import type { Assignment, Employee } from '../types'
import { DAY_LABELS } from '../lib/constants'

interface FloorViewProps {
  assignments: Assignment[]
  employees: Employee[]
}

export default function FloorView({ assignments, employees }: FloorViewProps) {
  const employeeMap = new Map(employees.map((e) => [e.employee_id, e]))

  // Group by floor, then day, then task
  const byFloor = new Map<string, Map<string, { taskName: string; employeeName: string; time: string }[]>>()

  for (const a of assignments) {
    const floorKey = `${a.floor}`
    const dayKey = `${a.day}`
    const taskKey = `${a.task_name}`

    if (!byFloor.has(floorKey)) byFloor.set(floorKey, new Map())
    const floorDays = byFloor.get(floorKey)!
    if (!floorDays.has(dayKey)) floorDays.set(dayKey, [])
    const emp = employeeMap.get(a.employee_id)
    floorDays.get(dayKey)!.push({
      taskName: taskKey,
      employeeName: emp?.employee_name || a.employee_id,
      time: `${a.start_time}–${a.end_time}`,
    })
  }

  const floors = Array.from(byFloor.keys()).sort()

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-1">Floor View</h3>
      <p className="text-sm text-slate-500 mb-4">Who is on each floor, by day.</p>
      <div className="space-y-4">
        {floors.map((floor) => {
          const days = byFloor.get(floor)!
          return (
            <div key={floor} className="border border-slate-200 rounded-md overflow-hidden">
              <div className="bg-[#0f172a] text-white px-4 py-2 font-medium">{floor}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3">
                {Array.from(days.entries()).map(([day, entries]) => (
                  <div key={day} className="bg-slate-50 rounded p-3">
                    <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
                      {DAY_LABELS[day as keyof typeof DAY_LABELS]}
                    </div>
                    <ul className="space-y-1.5">
                      {entries.map((entry, idx) => (
                        <li key={idx} className="text-sm">
                          <span className="font-medium text-slate-800">{entry.employeeName}</span>
                          <span className="text-slate-500"> • {entry.taskName}</span>
                          <span className="text-xs text-slate-400 block">{entry.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
