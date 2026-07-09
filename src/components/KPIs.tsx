import type { ScheduleStats } from '../types'

interface KPIsProps {
  stats: ScheduleStats | null
}

export default function KPIs({ stats }: KPIsProps) {
  const items = [
    { label: 'Total shifts', value: stats?.total_shifts ?? 0 },
    { label: 'Staffed', value: stats?.staffed_shifts ?? 0 },
    { label: 'Understaffed', value: stats?.understaffed_shifts ?? 0, alert: (stats?.understaffed_shifts ?? 0) > 0 },
    { label: 'Coverage', value: stats ? `${stats.coverage_percent}%` : '0%' },
    { label: 'Problems', value: stats?.total_conflicts ?? 0, alert: (stats?.total_conflicts ?? 0) > 0 },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 transition-all duration-200 hover:border-slate-300"
        >
          <div className="text-xs sm:text-sm font-light text-slate-500">{item.label}</div>
          <div
            className={`text-2xl sm:text-3xl font-extralight mt-1 sm:mt-2 ${
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
