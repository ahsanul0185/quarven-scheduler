import type { Conflict } from '../types'
import { CONFLICT_TYPE_LABELS } from '../lib/constants'

interface ConflictsProps {
  conflicts: Conflict[]
}

const TYPE_STYLES: Record<string, string> = {
  understaffed: 'bg-rose-100 text-rose-800',
  rest_violation: 'bg-orange-100 text-orange-800',
  weekly_hours_exceeded: 'bg-amber-100 text-amber-800',
  consecutive_days_exceeded: 'bg-purple-100 text-purple-800',
}

export default function Conflicts({ conflicts }: ConflictsProps) {
  if (conflicts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Problems</h3>
        <p className="text-emerald-600 font-medium">No conflicts found. Schedule is clean.</p>
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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">Problems</h3>
        <p className="text-sm text-slate-500">Anything that could not be scheduled.</p>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-120px)]">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-20 shadow-sm">
            <tr className="bg-[#2C3E50] text-white">
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Shift</th>
              <th className="px-4 py-3 text-left font-medium">Site / Role</th>
              <th className="px-4 py-3 text-left font-medium">Day</th>
              <th className="px-4 py-3 text-left font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((conflict, index) => (
              <tr
                key={index}
                className={index % 2 === 1 ? 'bg-[#F2F2F2]' : 'bg-white'}
              >
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      TYPE_STYLES[conflict.conflict_type] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {CONFLICT_TYPE_LABELS[conflict.conflict_type] || conflict.conflict_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700 font-medium">{conflict.shift_id}</td>
                <td className="px-4 py-3 text-slate-700">
                  {conflict.site} / <span className="capitalize">{conflict.role}</span>
                </td>
                <td className="px-4 py-3 text-slate-700 capitalize">{conflict.day}</td>
                <td className="px-4 py-3 text-slate-700">{conflict.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
