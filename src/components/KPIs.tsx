import type { ScheduleStats } from '../types'

interface KPIsProps {
  stats: ScheduleStats | null
}

export default function KPIs({ stats }: KPIsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="text-sm text-slate-500">-</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">-</div>
          </div>
        ))}
      </div>
    )
  }

  const items = [
    { label: 'Total Shifts', value: stats.total_shifts },
    { label: 'Staffed', value: stats.staffed_shifts },
    { label: 'Understaffed', value: stats.understaffed_shifts, alert: stats.understaffed_shifts > 0 },
    { label: 'Coverage %', value: `${stats.coverage_percent}%` },
    { label: 'Conflicts', value: stats.total_conflicts, alert: stats.total_conflicts > 0 },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
        >
          <div className="text-sm text-slate-500">{item.label}</div>
          <div
            className={`text-2xl font-bold mt-1 ${
              item.alert ? 'text-rose-600' : 'text-slate-800'
            }`}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
