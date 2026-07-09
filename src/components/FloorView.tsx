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
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-lg text-slate-700 mb-1">Floor View</h3>
      <p className="text-sm font-light text-slate-400 mb-6">Who is on each floor, by day.</p>
      <div className="space-y-6">
        {floors.map((floor) => {
          const days = byFloor.get(floor)!
          return (
            <div key={floor} className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-[#2C3E50] text-white px-6 py-3 font-light text-sm">{floor}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
                {Array.from(days.entries()).map(([day, entries]) => (
                  <div key={day} className="bg-[#f2f4f6] rounded-xl p-4">
                    <div className="text-xs font-light uppercase text-slate-500 mb-3 tracking-wide">
                      {DAY_LABELS[day as keyof typeof DAY_LABELS]}
                    </div>
                    <ul className="space-y-2">
                      {entries.map((entry, idx) => (
                        <li key={idx} className="text-sm font-light">
                          <span className="font-normal text-slate-700">{entry.employeeName}</span>
                          <span className="text-slate-400"> • {entry.taskName}</span>
                          <span className="text-xs text-slate-400 block mt-0.5">{entry.time}</span>
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
