import { NavLink } from 'react-router-dom'
import { Home, ArrowLeftRight, CalendarDays, CheckSquare, ListChecks } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Inicio', exact: true },
  { to: '/transacciones', icon: ArrowLeftRight, label: 'Finanzas' },
  { to: '/habitos', icon: CheckSquare, label: 'Hábitos' },
  { to: '/tareas', icon: ListChecks, label: 'Tareas' },
  { to: '/semanal', icon: CalendarDays, label: 'Semana' },
]

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t border-zinc-800">
      <div className="flex items-center justify-around h-16 px-1 safe-area-pb">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 flex-1 py-2 transition-colors ${
                isActive ? 'text-emerald-400' : 'text-zinc-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-emerald-400' : ''} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
