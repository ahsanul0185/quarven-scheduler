import { useState, useCallback } from 'react'
import type { Employee, Shift, Task, SchedulerConfig, ScheduleResult } from './types'
import { generateSchedule } from './engine/scheduler'
import { loadFromFiles, loadSampleFiles } from './lib/fileLoader'
import FileUploader from './components/FileUploader'
import Navigation from './components/Navigation'
import Overview from './components/Overview'
import WeeklyGrid from './components/WeeklyGrid'
import FloorView from './components/FloorView'
import TasksTeams from './components/TasksTeams'
import Breaks from './components/Breaks'
import Conflicts from './components/Conflicts'
import { exportScheduleCsv, exportProblemsCsv, exportReportHtml } from './lib/export'

type View = 'overview' | 'weekly' | 'floor' | 'tasks' | 'breaks' | 'conflicts'

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [config, setConfig] = useState<SchedulerConfig | null>(null)
  const [result, setResult] = useState<ScheduleResult | null>(null)
  const [activeView, setActiveView] = useState<View>('overview')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFilesSelected = useCallback(async (files: {
    employees?: File
    shifts?: File
    tasks?: File
    config?: File
  }) => {
    if (!files.employees || !files.shifts || !files.tasks) return

    setIsGenerating(true)
    setError(null)
    try {
      const data = await loadFromFiles(files)
      setEmployees(data.employees)
      setShifts(data.shifts)
      setTasks(data.tasks)
      setConfig(data.config)
      setResult(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const handleLoadSample = useCallback(async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const data = await loadSampleFiles()
      setEmployees(data.employees)
      setShifts(data.shifts)
      setTasks(data.tasks)
      setConfig(data.config)
      setResult(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sample files')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const handleGenerate = useCallback(() => {
    if (employees.length === 0 || shifts.length === 0 || tasks.length === 0) {
      setError('Please upload employees, shifts, and tasks files first')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const schedule = generateSchedule(
        employees,
        shifts,
        tasks,
        config || {
          min_rest_hours: 10,
          max_weekly_hours: 48,
          max_consecutive_days: 5,
          break_threshold_hours: 6,
          break_duration_minutes: 30,
          partial_day_max_hours: 6,
        }
      )
      setResult(schedule)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate schedule')
    } finally {
      setIsGenerating(false)
    }
  }, [employees, shifts, tasks, config])

  const handleExportSchedule = () => {
    if (!result) return
    exportScheduleCsv(result.assignments, employees)
  }

  const handleExportProblems = () => {
    if (!result) return
    exportProblemsCsv(result.conflicts)
  }

  const handleExportReport = () => {
    if (!result) return
    exportReportHtml(result, employees)
  }

  const handleClear = useCallback(() => {
    setEmployees([])
    setShifts([])
    setTasks([])
    setConfig(null)
    setResult(null)
    setError(null)
    setActiveView('overview')
  }, [])

  const renderView = () => {
    if (!result) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          Upload files and click Generate Schedule to see results.
        </div>
      )
    }

    switch (activeView) {
      case 'overview':
        return <Overview stats={result.stats} conflicts={result.conflicts} />
      case 'weekly':
        return <WeeklyGrid employees={employees} assignments={result.assignments} shifts={shifts} />
      case 'floor':
        return <FloorView assignments={result.assignments} employees={employees} />
      case 'tasks':
        return <TasksTeams assignments={result.assignments} tasks={tasks} employees={employees} shifts={shifts} />
      case 'breaks':
        return <Breaks assignments={result.assignments} employees={employees} />
      case 'conflicts':
        return <Conflicts conflicts={result.conflicts} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-[#0f172a] text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl font-bold">Quarven Scheduler</h1>
            <div className="flex flex-wrap items-center gap-2">
              {result && (
                <>
                  <button
                    onClick={handleExportSchedule}
                    className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={handleExportProblems}
                    className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                  >
                    Export Problems
                  </button>
                  <button
                    onClick={handleExportReport}
                    className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                  >
                    Export Report
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <FileUploader
            onFilesSelected={handleFilesSelected}
            onLoadSample={handleLoadSample}
            onGenerate={handleGenerate}
            onClear={handleClear}
            isGenerating={isGenerating}
            hasData={employees.length > 0 && shifts.length > 0 && tasks.length > 0}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6">
          <aside className="hidden lg:block">
            <Navigation active={activeView} onChange={setActiveView} />
          </aside>
          <div className="lg:hidden mb-4">
            <Navigation active={activeView} onChange={setActiveView} />
          </div>
          <section className="min-w-0">{renderView()}</section>
        </div>
      </main>
    </div>
  )
}
