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
    <nav className="bg-white rounded-2xl border border-slate-200 p-2">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onChange(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-light transition-all duration-200 ${
                active === item.id
                  ? 'bg-[#2C3E50] text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
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
