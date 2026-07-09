import type { ReactNode } from 'react'
import { CalendarDays, Zap, FileText } from 'lucide-react'
import Navigation from './Navigation'
import MobileNav from './MobileNav'

type View = 'overview' | 'weekly' | 'floor' | 'tasks' | 'breaks' | 'conflicts'

interface LayoutProps {
  activeView: View
  onViewChange: (view: View) => void
  result: boolean
  assignmentsCount: number
  onLoadSample: () => void
  onGenerate: () => void
  isGenerating: boolean
  children: ReactNode
}

export default function Layout({
  activeView,
  onViewChange,
  result,
  assignmentsCount,
  onLoadSample,
  onGenerate,
  isGenerating,
  children,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#eef2f5]">
      {/* Mobile Header - always rendered, hidden on lg+ */}
      <MobileNav active={activeView} onChange={onViewChange} result={result} />

      <div className="flex">
        {/* Desktop Sidebar - hidden on mobile, flex on lg+ */}
        <aside className="hidden lg:flex w-64 bg-[#1e293b] text-white flex-col shrink-0 h-screen sticky top-0">
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
            <Navigation active={activeView} onChange={onViewChange} />
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
                  {result ? `${assignmentsCount} assignments` : 'Load data to begin'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>

                <h2 className="text-xl lg:text-2xl font-light text-slate-800">Weekly scheduling</h2>
                <p className="text-sm font-light text-slate-400 mt-1">
                  Load sample files or upload your own CSVs.
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={onLoadSample}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-slate-600 border border-slate-200 rounded-lg font-light hover:bg-slate-50 disabled:opacity-40 transition-all duration-200 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Sample data</span>
                  <span className="sm:hidden">Sample</span>
                </button>
                <button
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#2C3E50] text-white rounded-lg font-light hover:bg-[#34495e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 text-sm whitespace-nowrap"
                >
                  <Zap className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 lg:py-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
