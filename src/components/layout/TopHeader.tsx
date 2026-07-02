import { Flame } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { calcularRacha } from '../../utils/streakLogic'
import { formatearFechaLarga, hoy } from '../../utils/formatters'

interface TopHeaderProps {
  titulo: string
}

export function TopHeader({ titulo }: TopHeaderProps) {
  const { state } = useApp()
  const racha = calcularRacha(state.diasActivos, state.transacciones)

  return (
    <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
      <div>
        <h1 className="text-white font-semibold text-lg">{titulo}</h1>
        <p className="text-zinc-500 text-sm capitalize">{formatearFechaLarga(hoy())}</p>
      </div>

      <div className="flex items-center gap-4">
        {racha > 0 ? (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <Flame size={16} className="text-emerald-400" />
            <span className="text-emerald-400 font-bold text-sm">
              {racha} {racha === 1 ? 'día' : 'días'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full">
            <Flame size={16} className="text-zinc-500" />
            <span className="text-zinc-500 text-sm">Sin racha</span>
          </div>
        )}
      </div>
    </header>
  )
}
