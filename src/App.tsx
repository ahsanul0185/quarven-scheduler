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
import KPIs from './components/KPIs'
import ExportBar from './components/ExportBar'
import { exportScheduleCsv, exportProblemsCsv, exportReportHtml } from './lib/export'
import { CalendarDays, Zap, FileText } from 'lucide-react'

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
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-base font-light">Upload files and click Generate Schedule to see results.</p>
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
    <div className="min-h-screen bg-[#eef2f5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col shrink-0 h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-normal tracking-tight">Quarven</h1>
              <p className="text-xs font-light text-slate-400">Workforce Scheduler</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-3 py-4 flex-1">
          <p className="px-3 text-[10px] font-light uppercase tracking-wider text-slate-500 mb-3">
            Workspace
          </p>
          <Navigation active={activeView} onChange={setActiveView} />
        </div>

        {/* Status */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${result ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <div>
              <p className="text-sm font-light">
                {result ? 'Schedule ready' : 'Setup required'}
              </p>
              <p className="text-xs font-light text-slate-400">
                {result ? `${result.assignments.length} assignments` : 'Load data to begin'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-light uppercase tracking-wider text-slate-400 mb-1">
                Operations Workspace
              </p>
              <h2 className="text-2xl font-light text-slate-800">Weekly scheduling</h2>
              <p className="text-sm font-light text-slate-400 mt-1">
                Load sample files or upload your own CSVs.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleLoadSample}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-lg font-light hover:bg-slate-50 disabled:opacity-40 transition-all duration-200"
              >
                <FileText className="w-4 h-4" /> Sample data
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C3E50] text-white rounded-lg font-light hover:bg-[#34495e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Zap className="w-4 h-4" /> {isGenerating ? 'Generating...' : 'Generate schedule'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-8 py-6 overflow-auto">
          {/* Data Sources */}
          <div className="mb-6">
            <FileUploader
              onFilesSelected={handleFilesSelected}
              onLoadSample={handleLoadSample}
              onGenerate={handleGenerate}
              onClear={handleClear}
              isGenerating={isGenerating}
              hasData={employees.length > 0 && shifts.length > 0 && tasks.length > 0}
              employeesCount={employees.length}
              shiftsCount={shifts.length}
              tasksCount={tasks.length}
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 font-light">
              {error}
            </div>
          )}

          {/* KPIs */}
          <div className="mb-6">
            <KPIs stats={result?.stats || null} />
          </div>

          {/* Export Bar */}
          <div className="mb-6">
            <ExportBar
              result={result}
              onExportSchedule={handleExportSchedule}
              onExportProblems={handleExportProblems}
              onExportReport={handleExportReport}
            />
          </div>

          {/* View Content */}
          <div className="min-w-0">{renderView()}</div>
        </div>
      </main>
    </div>
  )
}
