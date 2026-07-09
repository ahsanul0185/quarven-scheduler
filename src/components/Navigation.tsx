import {
  LayoutGrid,
  CalendarDays,
  Building2,
  Users,
  Coffee,
  AlertTriangle,
} from 'lucide-react'

type View = 'overview' | 'weekly' | 'floor' | 'tasks' | 'breaks' | 'conflicts'

interface NavigationProps {
  active: View
  onChange: (view: View) => void
}

const items: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'weekly', label: 'Weekly Grid', icon: CalendarDays },
  { id: 'floor', label: 'Floor View', icon: Building2 },
  { id: 'tasks', label: 'Tasks & Teams', icon: Users },
  { id: 'breaks', label: 'Breaks', icon: Coffee },
  { id: 'conflicts', label: 'Problems', icon: AlertTriangle },
]

export default function Navigation({ active, onChange }: NavigationProps) {
  return (
    <nav>
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id}>
              <button
                onClick={() => onChange(item.id)}
                className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm font-light transition-all duration-200 ${
                  active === item.id
                    ? 'bg-white text-[#1e293b] font-normal'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
