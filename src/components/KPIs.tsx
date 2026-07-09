import type { ScheduleStats } from '../types'

interface KPIsProps {
  stats: ScheduleStats | null
}

export default function KPIs({ stats }: KPIsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-sm font-light text-slate-400">-</div>
            <div className="text-3xl font-extralight text-slate-300 mt-2">-</div>
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
          className="bg-white rounded-2xl border border-slate-200 p-5 transition-all duration-200 hover:border-slate-300"
        >
          <div className="text-sm font-light text-slate-400">{item.label}</div>
          <div
            className={`text-3xl font-extralight mt-2 ${
              item.alert ? 'text-[#e74c3c]' : 'text-[#2C3E50]'
            }`}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
