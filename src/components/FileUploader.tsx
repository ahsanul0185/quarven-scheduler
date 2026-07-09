import { useRef, useState } from 'react'
import { Upload, Check, X, Users, Clock, ClipboardList, Settings } from 'lucide-react'

interface FileUploaderProps {
  onFilesSelected: (files: {
    employees?: File
    shifts?: File
    tasks?: File
    config?: File
  }) => void
  onLoadSample: () => void
  onGenerate: () => void
  onClear: () => void
  isGenerating: boolean
  hasData: boolean
  employeesCount: number
  shiftsCount: number
  tasksCount: number
}

interface FileState {
  employees?: File
  shifts?: File
  tasks?: File
  config?: File
}

export default function FileUploader({
  onFilesSelected,
  onClear,
  hasData,
  employeesCount,
  shiftsCount,
  tasksCount,
}: FileUploaderProps) {
  const [files, setFiles] = useState<FileState>({})
  const refs = {
    employees: useRef<HTMLInputElement>(null),
    shifts: useRef<HTMLInputElement>(null),
    tasks: useRef<HTMLInputElement>(null),
    config: useRef<HTMLInputElement>(null),
  }

  const handleFileChange = (key: keyof FileState, file: File | undefined) => {
    const updated = { ...files, [key]: file }
    setFiles(updated)
    onFilesSelected(updated)
  }

  const handleClear = () => {
    setFiles({})
    Object.values(refs).forEach((ref) => {
      if (ref.current) {
        ref.current.value = ''
      }
    })
    onClear()
  }

  const labels: Record<keyof FileState, { name: string; icon: React.ElementType }> = {
    employees: { name: 'Employees', icon: Users },
    shifts: { name: 'Shifts', icon: Clock },
    tasks: { name: 'Tasks', icon: ClipboardList },
    config: { name: 'Config', icon: Settings },
  }

  const anyFileSelected = Object.values(files).some(Boolean)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-normal text-slate-800">Data sources</h3>
          <p className="text-xs font-light text-slate-400 mt-0.5">CSV or JSON files</p>
        </div>
        <div className="text-xs font-light text-slate-400">
          {employeesCount} employees · {shiftsCount} shifts · {tasksCount} tasks
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {(Object.keys(labels) as Array<keyof FileState>).map((key) => {
          const Icon = labels[key].icon
          return (
            <div key={key}>
              <input
                ref={refs[key]}
                type="file"
                accept=".csv,.json"
                onChange={(e) => handleFileChange(key, e.target.files?.[0])}
                className="hidden"
                id={`file-${key}`}
              />
              <label
                htmlFor={`file-${key}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-all duration-200 ${
                  files[key]
                    ? 'border-[#27ae60] bg-[#eafaf1] text-[#239b56]'
                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-500'
                }`}
              >
                {files[key] ? (
                  <Check className="w-5 h-5 shrink-0" />
                ) : (
                  <Upload className="w-5 h-5 shrink-0" />
                )}
                <div>
                  <div className="text-sm font-light">{labels[key].name}</div>
                  {files[key] && (
                    <div className="text-[10px] font-light truncate max-w-[140px]">{files[key]!.name}</div>
                  )}
                </div>
              </label>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        {(anyFileSelected || hasData) && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-light text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200"
          >
            <X className="w-4 h-4" /> Clear all
          </button>
        )}
        {hasData && (
          <span className="text-xs font-light text-[#27ae60]">Files loaded. Ready to generate.</span>
        )}
      </div>
    </div>
  )
}
