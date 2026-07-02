import { NavLink } from 'react-router-dom'
import { Home, ArrowLeftRight, Flame, PieChart, Settings, CheckSquare, ListChecks, CalendarDays, Trophy } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { calcularRacha } from '../../utils/streakLogic'
import { getRangoInfo, getProgresoRango, formatXP } from '../../utils/xp'

const navGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/', icon: Home, label: 'Inicio', exact: true },
      { to: '/transacciones', icon: ArrowLeftRight, label: 'Transacciones' },
      { to: '/presupuestos', icon: PieChart, label: 'Presupuestos & Deudas' },
    ],
  },
  {
    label: 'Productividad',
    items: [
      { to: '/habitos', icon: CheckSquare, label: 'Hábitos' },
      { to: '/tareas', icon: ListChecks, label: 'Tareas' },
      { to: '/semanal', icon: CalendarDays, label: 'Planificador semanal' },
    ],
  },
  {
    label: 'Más',
    items: [
      { to: '/racha', icon: Flame, label: 'Racha' },
      { to: '/temporada', icon: Trophy, label: 'Temporada & Rango' },
      { to: '/configuracion', icon: Settings, label: 'Configuración' },
    ],
  },
]

export function Sidebar() {
  const { state } = useApp()
  const racha = calcularRacha(state.diasActivos, state.transacciones)
  const rangoInfo = getRangoInfo(state.xp.total)
  const progreso = getProgresoRango(state.xp.total)

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-zinc-900 border-r border-zinc-800 fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Flame size={18} className="text-zinc-950" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">CIMA</span>
      </div>

      {/* Streak widget */}
      {racha > 0 && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-emerald-400" />
            <div>
              <div className="text-emerald-400 font-bold text-xl leading-none">{racha}</div>
              <div className="text-zinc-400 text-xs mt-0.5">
                {racha === 1 ? 'día de racha' : 'días de racha'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rank widget */}
      <NavLink
        to="/temporada"
        className="mx-4 mt-2 p-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors flex items-center gap-2.5"
      >
        <span className="text-xl flex-shrink-0">{rangoInfo.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: rangoInfo.color }}>
              {rangoInfo.rango}
            </span>
            <span className="text-zinc-500 text-xs">{formatXP(state.xp.total)} XP</span>
          </div>
          <div className="h-1 bg-zinc-700 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progreso.porcentaje}%`, background: rangoInfo.color }}
            />
          </div>
        </div>
      </NavLink>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest px-3 mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={isActive ? 'text-emerald-400' : ''} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-zinc-800">
        <p className="text-zinc-600 text-xs">CIMA v0.2</p>
      </div>
    </aside>
  )
}
