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

  // Group assignments by task_id
  const byTask = new Map<string, Assignment[]>()
  for (const a of assignments) {
    const list = byTask.get(a.task_id) || []
    list.push(a)
    byTask.set(a.task_id, list)
  }

  const sortedTasks = [...tasks].sort((a, b) => a.task_id.localeCompare(b.task_id))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">Tasks & Teams</h3>
        <p className="text-sm text-slate-500">Each task, its floor, and assigned team members.</p>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-120px)]">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-20 shadow-sm">
            <tr className="bg-[#2C3E50] text-white">
              <th className="px-4 py-3 text-left font-medium">Task</th>
              <th className="px-4 py-3 text-left font-medium">Shift</th>
              <th className="px-4 py-3 text-left font-medium">Floor</th>
              <th className="px-4 py-3 text-left font-medium">Team</th>
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
                  className={index % 2 === 1 ? 'bg-[#F2F2F2]' : 'bg-white'}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{task.task_name}</div>
                    <div className="text-xs text-slate-500">
                      Need {task.required_headcount} •{' '}
                      {task.required_skill || 'no skill required'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {shift ? (
                      <>
                        {shift.day} {shift.start_time}–{shift.end_time}
                        <div className="text-xs text-slate-500">
                          {shift.site} • {shift.role}
                        </div>
                      </>
                    ) : (
                      task.shift_id
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{task.floor}</td>
                  <td className="px-4 py-3">
                    {team.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {team.map((name, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-rose-600 text-xs font-medium">Unstaffed</span>
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
