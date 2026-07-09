import type { Assignment, Task, Employee, Shift } from '../types'

interface TasksTeamsProps {
  assignments: Assignment[]
  tasks: Task[]
  employees: Employee[]
  shifts: Shift[]
}

export default function TasksTeams({ assignments, tasks, employees, shifts }: TasksTeamsProps) {
  const employeeMap = new Map(employees.map((e) => [e.employee_id, e]))
  const shiftMap = new Map(shifts.map((s) => [s.shift_id, s]))

  const byTask = new Map<string, Assignment[]>()
  for (const a of assignments) {
    const list = byTask.get(a.task_id) || []
    list.push(a)
    byTask.set(a.task_id, list)
  }

  const sortedTasks = [...tasks].sort((a, b) => a.task_id.localeCompare(b.task_id))

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <h3 className="text-lg font-light text-slate-700">Tasks & Teams</h3>
        <p className="text-sm font-light text-slate-400 mt-1">Each task, its floor, and assigned team members.</p>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse min-w-[600px]">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#2C3E50] text-white">
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-light">Task</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-light">Shift</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-light">Floor</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-light">Team</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task, index) => {
              const taskAssignments = byTask.get(task.task_id) || []
              const shift = shiftMap.get(task.shift_id)
              const team = taskAssignments.map((a) => employeeMap.get(a.employee_id)?.employee_name || a.employee_id)

              return (
                <tr
                  key={task.task_id}
                  className={`${index % 2 === 1 ? 'bg-[#f2f4f6]' : 'bg-white'} transition-colors hover:bg-slate-50`}
                >
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="font-light text-slate-700">{task.task_name}</div>
                    <div className="text-xs font-light text-slate-400 mt-1">
                      Need {task.required_headcount} •{' '}
                      {task.required_skill || 'no skill required'}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 font-light">
                    {shift ? (
                      <>
                        {shift.day} {shift.start_time}–{shift.end_time}
                        <div className="text-xs font-light text-slate-400 mt-1">
                          {shift.site} • {shift.role}
                        </div>
                      </>
                    ) : (
                      task.shift_id
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 font-light">{task.floor}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    {team.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {team.map((name, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-light bg-[#f2f4f6] text-slate-600"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-light bg-rose-50 text-[#e74c3c]">Unstaffed</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
