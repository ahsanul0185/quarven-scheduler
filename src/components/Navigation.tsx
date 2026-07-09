type View = 'overview' | 'weekly' | 'floor' | 'tasks' | 'breaks' | 'conflicts'

interface NavigationProps {
  active: View
  onChange: (view: View) => void
}

const items: { id: View; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'weekly', label: 'Weekly Grid' },
  { id: 'floor', label: 'Floor View' },
  { id: 'tasks', label: 'Tasks & Teams' },
  { id: 'breaks', label: 'Breaks' },
  { id: 'conflicts', label: 'Conflicts' },
]

export default function Navigation({ active, onChange }: NavigationProps) {
  return (
    <nav className="bg-white rounded-xl border border-slate-200 p-2">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onChange(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active === item.id
                  ? 'bg-[#0f172a] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
