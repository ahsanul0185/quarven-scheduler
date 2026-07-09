import type { ScheduleResult } from '../types'
import { Download, AlertTriangle, FileCode } from 'lucide-react'

interface ExportBarProps {
  result: ScheduleResult | null
  onExportSchedule: () => void
  onExportProblems: () => void
  onExportReport: () => void
}

export default function ExportBar({ result, onExportSchedule, onExportProblems, onExportReport }: ExportBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-normal text-slate-800">Export center</h3>
          <p className="text-xs font-light text-slate-400 mt-0.5">
            {result ? 'Download or print the generated roster' : 'Generate a schedule to enable exports'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportSchedule}
            disabled={!result}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-light text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Schedule CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <button
            onClick={onExportProblems}
            disabled={!result}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-light text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            <AlertTriangle className="w-4 h-4" /> <span className="hidden sm:inline">Problems CSV</span>
            <span className="sm:hidden">Problems</span>
          </button>
          <button
            onClick={onExportReport}
            disabled={!result}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-light text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            <FileCode className="w-4 h-4" /> <span className="hidden sm:inline">Report HTML</span>
            <span className="sm:hidden">Report</span>
          </button>
        </div>
      </div>
    </div>
  )
}
