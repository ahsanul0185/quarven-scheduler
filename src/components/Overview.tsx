import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { ScheduleStats, Conflict } from '../types'
import KPIs from './KPIs'

interface OverviewProps {
  stats: ScheduleStats | null
  conflicts: Conflict[]
}

export default function Overview({ stats, conflicts }: OverviewProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <div className="text-5xl mb-4 opacity-30">📊</div>
        <p className="text-base font-light">Generate a schedule to see the overview.</p>
      </div>
    )
  }

  const coverageData = [
    { name: 'Staffed', value: stats.staffed_shifts },
    { name: 'Understaffed', value: stats.understaffed_shifts },
  ]

  const COLORS = ['#27ae60', '#e74c3c']

  const conflictCounts = conflicts.reduce((acc, c) => {
    acc[c.conflict_type] = (acc[c.conflict_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const conflictData = Object.entries(conflictCounts).map(([type, count]) => ({
    name: type.replace(/_/g, ' '),
    count,
  }))

  return (
    <div className="space-y-8">
      <KPIs stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h4 className="text-base font-light text-slate-600 mb-6">Shift Coverage</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={coverageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {coverageData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h4 className="text-base font-light text-slate-600 mb-6">Conflicts by Type</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conflictData}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 300 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontWeight: 300 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#e74c3c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h4 className="text-base font-light text-slate-600 mb-3">Summary</h4>
        <p className="text-sm font-light text-slate-500 leading-relaxed">
          The schedule contains <span className="font-normal text-slate-700">{stats.total_shifts}</span> shifts.{' '}
          <span className="font-normal text-slate-700">{stats.staffed_shifts}</span> are fully staffed and{' '}
          <span className="font-normal text-slate-700">{stats.understaffed_shifts}</span> are below minimum staffing. Total assigned
          hours: <span className="font-normal text-slate-700">{stats.total_assigned_hours}</span>.{' '}
          {stats.total_conflicts > 0 ? (
            <>
              There are <span className="font-normal text-rose-600">{stats.total_conflicts}</span> problems to review.
            </>
          ) : (
            'There are no problems to review.'
          )}
        </p>
      </div>
    </div>
  )
}
