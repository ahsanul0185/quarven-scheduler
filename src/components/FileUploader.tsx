import { useRef, useState } from 'react'

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
}

interface FileState {
  employees?: File
  shifts?: File
  tasks?: File
  config?: File
}

export default function FileUploader({
  onFilesSelected,
  onLoadSample,
  onGenerate,
  onClear,
  isGenerating,
  hasData,
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

  const handleLoadSample = () => {
    clearInputs()
    onLoadSample()
  }

  const handleClear = () => {
    clearInputs()
    onClear()
  }

  const clearInputs = () => {
    setFiles({})
    Object.values(refs).forEach((ref) => {
      if (ref.current) {
        ref.current.value = ''
      }
    })
  }

  const labels: Record<keyof FileState, string> = {
    employees: 'Employees (CSV or JSON)',
    shifts: 'Shifts (CSV or JSON)',
    tasks: 'Tasks (CSV or JSON)',
    config: 'Config (JSON or CSV)',
  }

  const anyFileSelected = Object.values(files).some(Boolean)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Upload files</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {(Object.keys(labels) as Array<keyof FileState>).map((key) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600">{labels[key]}</label>
            <input
              ref={refs[key]}
              type="file"
              accept=".csv,.json"
              onChange={(e) => handleFileChange(key, e.target.files?.[0])}
              className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            {files[key] && (
              <span className="text-xs text-emerald-600 truncate">{files[key]!.name}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-[#0f172a] text-white rounded-lg font-medium hover:bg-[#1e293b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate Schedule'}
        </button>
        <button
          onClick={handleLoadSample}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-white text-[#0f172a] border border-[#0f172a] rounded-lg font-medium hover:bg-slate-50 disabled:opacity-60 transition-colors"
        >
          Load sample files
        </button>
        <button
          onClick={handleClear}
          disabled={isGenerating || (!anyFileSelected && !hasData)}
          className="px-5 py-2.5 bg-white text-rose-600 border border-rose-200 rounded-lg font-medium hover:bg-rose-50 disabled:opacity-40 transition-colors"
        >
          Clear
        </button>
      </div>
      {hasData && (
        <p className="mt-3 text-sm text-emerald-600">Files loaded. Ready to generate.</p>
      )}
    </div>
  )
}
