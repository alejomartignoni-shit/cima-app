import { useNavigate } from 'react-router-dom'
import { Check, ArrowLeftRight, Flame, CheckSquare, Sparkles } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { hoy } from '../../utils/formatters'
import { checkInHechoHoy } from '../../utils/streakLogic'

interface Mision {
  id: string
  nombre: string
  xp: number
  icono: typeof Check
  completada: boolean
  ruta: string
}

/** Misiones del día estilo Duolingo — derivadas del estado, sin persistencia extra */
export function QuestCard() {
  const { state } = useApp()
  const navigate = useNavigate()
  const fechaHoy = hoy()

  const hayHabitos = state.habitos.some(h => h.activo)
  const misiones: Mision[] = [
    {
      id: 'transaccion',
      nombre: 'Registrá una transacción',
      xp: 5,
      icono: ArrowLeftRight,
      completada: state.transacciones.some(t => t.fecha === fechaHoy),
      ruta: '/transacciones',
    },
    {
      id: 'checkin',
      nombre: 'Hacé tu check-in diario',
      xp: 5,
      icono: Flame,
      completada: checkInHechoHoy(state.ultimoCheckIn),
      ruta: '/racha',
    },
    {
      id: 'habito',
      nombre: hayHabitos ? 'Completá un hábito' : 'Creá tu primer hábito',
      xp: 10,
      icono: CheckSquare,
      completada: hayHabitos && state.registrosHabito.some(r => r.fecha === fechaHoy),
      ruta: '/habitos',
    },
  ]

  const completadas = misiones.filter(m => m.completada).length
  const todas = completadas === misiones.length
  const pct = Math.round((completadas / misiones.length) * 100)

  return (
    <div className={`rounded-3xl p-5 border transition-all ${
      todas ? 'card-hero-flame' : 'bg-zinc-900 border-zinc-800'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#ffd600]" />
          <h3 className="text-white font-bold text-sm">Misiones de hoy</h3>
        </div>
        {todas ? (
          <span className="text-[#ffd600] text-xs font-black uppercase tracking-wide animate-pop">¡Día perfecto! 🎉</span>
        ) : (
          <span className="text-zinc-500 text-xs font-semibold">{completadas}/{misiones.length}</span>
        )}
      </div>

      {/* Barra de progreso del día */}
      <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: todas
              ? 'linear-gradient(90deg, #ffd600, #ff9500)'
              : 'linear-gradient(90deg, #7c5cfc, #ab9ff2)',
          }}
        />
      </div>

      <div className="space-y-2">
        {misiones.map(m => {
          const Icono = m.icono
          return (
            <button
              key={m.id}
              onClick={() => !m.completada && navigate(m.ruta)}
              disabled={m.completada}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                m.completada
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600 active:scale-[0.98]'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                m.completada ? 'bg-emerald-500 animate-pop' : 'bg-zinc-800 border border-zinc-700'
              }`}>
                {m.completada
                  ? <Check size={18} className="text-zinc-950" strokeWidth={3.5} />
                  : <Icono size={16} className="text-zinc-400" />
                }
              </div>
              <span className={`flex-1 text-sm font-semibold ${
                m.completada ? 'text-zinc-500 line-through' : 'text-zinc-200'
              }`}>
                {m.nombre}
              </span>
              <span className={`text-xs font-black px-2 py-1 rounded-lg flex-shrink-0 ${
                m.completada
                  ? 'text-emerald-400/60 bg-emerald-500/10'
                  : 'text-[#ffd600] bg-[#ffd600]/10 border border-[#ffd600]/20'
              }`}>
                +{m.xp} XP
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
