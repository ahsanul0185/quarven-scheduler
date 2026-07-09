import type { Conflict } from '../types'
import { CONFLICT_TYPE_LABELS } from '../lib/constants'

interface ConflictsProps {
  conflicts: Conflict[]
}

const TYPE_STYLES: Record<string, string> = {
  understaffed: 'bg-rose-50 text-[#e74c3c]',
  rest_violation: 'bg-orange-50 text-[#e67e22]',
  weekly_hours_exceeded: 'bg-amber-50 text-[#d4ac0d]',
  consecutive_days_exceeded: 'bg-purple-50 text-[#8e44ad]',
}

export default function Conflicts({ conflicts }: ConflictsProps) {
  if (conflicts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        <h3 className="text-lg font-light text-slate-700 mb-2">Problems</h3>
        <p className="text-[#27ae60] font-light">No conflicts found. Schedule is clean.</p>
      </div>
    )
  }

  const sorted = [...conflicts].sort((a, b) => {
    const typeOrder = [
      'understaffed',
      'rest_violation',
      'weekly_hours_exceeded',
      'consecutive_days_exceeded',
    ]
    const typeDiff = typeOrder.indexOf(a.conflict_type) - typeOrder.indexOf(b.conflict_type)
    if (typeDiff !== 0) return typeDiff
    return a.shift_id.localeCompare(b.shift_id)
  })

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <h3 className="text-lg font-light text-slate-700">Problems</h3>
        <p className="text-sm font-light text-slate-400 mt-1">Anything that could not be scheduled.</p>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse min-w-[500px]">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#2C3E50] text-white">
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-light">Type</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-light">Shift</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-light">Site / Role</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-light">Day</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-light">Detail</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((conflict, index) => (
              <tr
                key={index}
                className={`${index % 2 === 1 ? 'bg-[#f2f4f6]' : 'bg-white'} transition-colors hover:bg-slate-50`}
              >
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <span
                    className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-light ${
                      TYPE_STYLES[conflict.conflict_type] || 'bg-[#f2f4f6] text-slate-500'
                    }`}
                  >
                    {CONFLICT_TYPE_LABELS[conflict.conflict_type] || conflict.conflict_type}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 font-light">{conflict.shift_id}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 font-light">
                  {conflict.site} / <span className="capitalize">{conflict.role}</span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 font-light capitalize">{conflict.day}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 font-light">{conflict.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
