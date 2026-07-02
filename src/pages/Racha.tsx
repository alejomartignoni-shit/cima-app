import { AppLayout } from '../components/layout/AppLayout'
import { Flame, Trophy, Calendar } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { calcularRacha, calcularRachaMaxima, obtenerUltimos30Dias, checkInHechoHoy } from '../utils/streakLogic'
import { hoy } from '../utils/formatters'
import { toast } from 'sonner'

export function Racha() {
  const { state, dispatch } = useApp()
  const racha = calcularRacha(state.diasActivos, state.transacciones)
  const rachaMaxima = calcularRachaMaxima(state.diasActivos, state.transacciones)
  const ultimos30 = obtenerUltimos30Dias(state.diasActivos, state.transacciones)
  const checkInHecho = checkInHechoHoy(state.ultimoCheckIn)

  function handleCheckIn() {
    if (checkInHecho) return
    dispatch({ type: 'CHECKIN_HOY', payload: hoy() })
    toast.success('¡Check-in del día registrado!', {
      description: 'Mantuviste tu racha activa.',
    })
  }

  return (
    <AppLayout titulo="Racha">
      <div className="space-y-6 animate-fade-in">
        {/* Main streak counter */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
              racha > 0 ? 'bg-emerald-500/20' : 'bg-zinc-800'
            }`}>
              <Flame size={40} className={racha > 0 ? 'text-emerald-400' : 'text-zinc-600'} />
            </div>
          </div>
          <div className={`text-7xl font-bold mb-2 ${racha > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>
            {racha}
          </div>
          <p className="text-zinc-400 text-lg">
            {racha === 0 ? 'Sin racha activa' : racha === 1 ? 'día de racha' : 'días de racha'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <Trophy size={20} className="text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{rachaMaxima}</div>
            <p className="text-zinc-500 text-xs mt-1">Racha máxima</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <Calendar size={20} className="text-zinc-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {state.diasActivos.length + new Set(state.transacciones.map(t => t.fecha)).size}
            </div>
            <p className="text-zinc-500 text-xs mt-1">Días activos totales</p>
          </div>
        </div>

        {/* Check-in button */}
        <button
          onClick={handleCheckIn}
          disabled={checkInHecho}
          className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${
            checkInHecho
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 active:scale-95'
          }`}
        >
          {checkInHecho ? '✓ Check-in del día completado' : '🔥 Check-in del día'}
        </button>

        {/* Last 30 days */}
        <div>
          <h3 className="text-zinc-300 font-medium mb-3">Últimos 30 días</h3>
          <div className="grid grid-cols-10 gap-1.5">
            {ultimos30.map(({ fecha, activo }) => (
              <div
                key={fecha}
                title={fecha}
                className={`aspect-square rounded-md ${
                  activo ? 'bg-emerald-500' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-zinc-500 text-xs">Día activo</span>
            <div className="w-3 h-3 rounded bg-zinc-800 ml-2" />
            <span className="text-zinc-500 text-xs">Sin actividad</span>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
