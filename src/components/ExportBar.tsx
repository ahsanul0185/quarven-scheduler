import type { ScheduleResult } from '../types'
import { Download, AlertTriangle, FileCode, Printer } from 'lucide-react'

interface ExportBarProps {
  result: ScheduleResult | null
  onExportSchedule: () => void
  onExportProblems: () => void
  onExportReport: () => void
}

export default function ExportBar({ result, onExportSchedule, onExportProblems, onExportReport }: ExportBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-normal text-slate-800">Export center</h3>
          <p className="text-xs font-light text-slate-400 mt-0.5">
            {result ? 'Download or print the generated roster' : 'Generate a schedule to enable exports'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportSchedule}
            disabled={!result}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-light text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Download className="w-4 h-4" /> Schedule CSV
          </button>
          <button
            onClick={onExportProblems}
            disabled={!result}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-light text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            <AlertTriangle className="w-4 h-4" /> Problems CSV
          </button>
          <button
            onClick={onExportReport}
            disabled={!result}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-light text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            <FileCode className="w-4 h-4" /> Report HTML
          </button>
        </div>
      </div>
    </div>
  )
}
