import { Flame, Sun, Moon } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { useTheme } from '../../store/ThemeContext'
import { calcularRacha } from '../../utils/streakLogic'
import { formatearFechaLarga, hoy } from '../../utils/formatters'
import { getRangoInfo, formatXP } from '../../utils/xp'

interface TopHeaderProps {
  titulo: string
}

export function TopHeader({ titulo }: TopHeaderProps) {
  const { state } = useApp()
  const { theme, toggleTheme } = useTheme()
  const racha = calcularRacha(state.diasActivos, state.transacciones)
  const rangoInfo = getRangoInfo(state.xp.total)

  return (
    <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
      <div>
        <h1 className="text-white font-semibold text-lg">{titulo}</h1>
        <p className="text-zinc-500 text-sm capitalize">{formatearFechaLarga(hoy())}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Rango + XP */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
          style={{ borderColor: `${rangoInfo.color}40`, background: `${rangoInfo.color}10` }}
        >
          <span className="text-sm leading-none">{rangoInfo.emoji}</span>
          <span className="text-xs font-bold" style={{ color: rangoInfo.color }}>
            {formatXP(state.xp.total)} XP
          </span>
        </div>

        {racha > 0 ? (
          <div className="flex items-center gap-2 bg-[#ffd600]/10 border border-[#ffd600]/30 px-3 py-1.5 rounded-full">
            <Flame size={16} className="text-[#ffd600]" />
            <span className="text-[#ffd600] font-bold text-sm">
              {racha} {racha === 1 ? 'día' : 'días'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full">
            <Flame size={16} className="text-zinc-500" />
            <span className="text-zinc-500 text-sm">Sin racha</span>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-700 transition-all"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark'
            ? <Sun size={16} className="text-zinc-400" />
            : <Moon size={16} className="text-zinc-400" />
          }
        </button>
      </div>
    </header>
  )
}
