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
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        Generate a schedule to see the overview.
      </div>
    )
  }

  const coverageData = [
    { name: 'Staffed', value: stats.staffed_shifts },
    { name: 'Understaffed', value: stats.understaffed_shifts },
  ]

  const COLORS = ['#10b981', '#f43f5e']

  const conflictCounts = conflicts.reduce((acc, c) => {
    acc[c.conflict_type] = (acc[c.conflict_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const conflictData = Object.entries(conflictCounts).map(([type, count]) => ({
    name: type.replace(/_/g, ' '),
    count,
  }))

  return (
    <div className="space-y-6">
      <KPIs stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h4 className="text-base font-semibold text-slate-800 mb-4">Shift Coverage</h4>
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

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h4 className="text-base font-semibold text-slate-800 mb-4">Conflicts by Type</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conflictData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h4 className="text-base font-semibold text-slate-800 mb-2">Summary</h4>
        <p className="text-sm text-slate-600">
          The schedule contains <strong>{stats.total_shifts}</strong> shifts.{' '}
          <strong>{stats.staffed_shifts}</strong> are fully staffed and{' '}
          <strong>{stats.understaffed_shifts}</strong> are below minimum staffing. Total assigned
          hours: <strong>{stats.total_assigned_hours}</strong>.{' '}
          {stats.total_conflicts > 0 ? (
            <>
              There are <strong>{stats.total_conflicts}</strong> problems to review.
            </>
          ) : (
            'There are no problems to review.'
          )}
        </p>
      </div>
    </div>
  )
}
