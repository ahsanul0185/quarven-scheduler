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
    <div className="bg-white rounded-2xl border border-slate-200 p-8">
      <h2 className="text-lg text-slate-600 mb-6">Upload files</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {(Object.keys(labels) as Array<keyof FileState>).map((key) => (
          <div key={key} className="flex flex-col gap-2">
            <label className="text-sm font-light text-slate-400">{labels[key]}</label>
            <input
              ref={refs[key]}
              type="file"
              accept=".csv,.json"
              onChange={(e) => handleFileChange(key, e.target.files?.[0])}
              className="block w-full text-sm font-light text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-light file:bg-[#f2f4f6] file:text-[#2C3E50] hover:file:bg-slate-200 transition-colors"
            />
            {files[key] && (
              <span className="text-xs font-light text-[#27ae60] truncate">{files[key]!.name}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-6 py-2.5 bg-[#2C3E50] text-white rounded-full font-light hover:bg-[#34495e] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isGenerating ? 'Generating...' : 'Generate Schedule'}
        </button>
        <button
          onClick={handleLoadSample}
          disabled={isGenerating}
          className="px-6 py-2.5 bg-white text-[#2C3E50] border border-slate-200 rounded-full font-light hover:bg-[#f2f4f6] hover:border-slate-300 disabled:opacity-40 transition-all duration-200"
        >
          Load sample files
        </button>
        <button
          onClick={handleClear}
          disabled={isGenerating || (!anyFileSelected && !hasData)}
          className="px-6 py-2.5 bg-white text-[#e74c3c] border border-rose-100 rounded-full font-light hover:bg-rose-50 disabled:opacity-30 transition-all duration-200"
        >
          Clear
        </button>
      </div>
      {hasData && (
        <p className="mt-4 text-sm font-light text-[#27ae60]">Files loaded. Ready to generate.</p>
      )}
    </div>
  )
}
