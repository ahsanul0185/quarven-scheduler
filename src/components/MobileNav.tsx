import { useState, useEffect } from 'react'
import {
  LayoutGrid,
  CalendarDays,
  Building2,
  Users,
  Coffee,
  AlertTriangle,
  X,
  Menu,
  CalendarDays as LogoIcon,
} from 'lucide-react'

type View = 'overview' | 'weekly' | 'floor' | 'tasks' | 'breaks' | 'conflicts'

interface MobileNavProps {
  active: View
  onChange: (view: View) => void
  result: boolean
}

const items: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'weekly', label: 'Weekly', icon: CalendarDays },
  { id: 'floor', label: 'Floor', icon: Building2 },
  { id: 'tasks', label: 'Tasks', icon: Users },
  { id: 'breaks', label: 'Breaks', icon: Coffee },
  { id: 'conflicts', label: 'Problems', icon: AlertTriangle },
]

export default function MobileNav({ active, onChange, result }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (open) {
      setAnimating(true)
    }
  }, [open])

  const handleClose = () => {
    setAnimating(false)
    setTimeout(() => setOpen(false), 300)
  }

  const handleItemClick = (view: View) => {
    onChange(view)
    handleClose()
  }

  return (
    <>
      {/* Mobile Top Bar - sticky on mobile */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <LogoIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-normal tracking-tight">Quarven</h1>
            <p className="text-[10px] font-light text-slate-400">Workforce Scheduler</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              animating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleClose}
          />
          {/* Drawer panel */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-64 bg-[#1e293b] text-white flex flex-col transition-transform duration-300 ease-out ${
              animating ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <span className="text-sm font-light">Menu</span>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3">
              <ul className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center gap-3 text-left px-3 py-3 rounded-lg text-sm font-light transition-all duration-200 ${
                          active === item.id
                            ? 'bg-white text-[#1e293b] font-normal'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${result ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                <div>
                  <p className="text-sm font-light">
                    {result ? 'Schedule ready' : 'Setup required'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
