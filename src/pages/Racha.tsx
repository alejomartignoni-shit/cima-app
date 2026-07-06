import { AppLayout } from '../components/layout/AppLayout'
import { Trophy, Calendar, Check, Flame } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { calcularRacha, calcularRachaMaxima, obtenerUltimos30Dias, checkInHechoHoy, esDiaActivo } from '../utils/streakLogic'
import { hoy } from '../utils/formatters'
import { StreakFlame } from '../components/game/StreakFlame'
import { JuicyButton } from '../components/game/JuicyButton'
import { celebrate } from '../components/game/Celebration'
import { Reveal } from '../components/ui/Reveal'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

export function Racha() {
  const { state, dispatch } = useApp()
  const racha = calcularRacha(state.diasActivos, state.transacciones)
  const rachaMaxima = calcularRachaMaxima(state.diasActivos, state.transacciones)
  const ultimos30 = obtenerUltimos30Dias(state.diasActivos, state.transacciones)
  const checkInHecho = checkInHechoHoy(state.ultimoCheckIn)

  const diasTotales = new Set([
    ...state.diasActivos.map(d => d.fecha),
    ...state.transacciones.map(t => t.fecha),
  ]).size

  // Últimos 7 días terminando hoy (estilo semana Duolingo)
  const semana = Array.from({ length: 7 }, (_, i) => {
    const fecha = subDays(new Date(), 6 - i)
    const iso = format(fecha, 'yyyy-MM-dd')
    return {
      iso,
      inicial: format(fecha, 'EEEEE', { locale: es }).toUpperCase(),
      activo: esDiaActivo(iso, state.diasActivos, state.transacciones),
      esHoy: i === 6,
    }
  })

  function handleCheckIn() {
    if (checkInHecho) return
    dispatch({ type: 'CHECKIN_HOY', payload: hoy() })
    celebrate({ pieces: 90 })
  }

  return (
    <AppLayout titulo="Racha">
      <div className="max-w-lg mx-auto space-y-5 animate-fade-in">

        {/* ── Hero de llama ─────────────────────────────────────────────── */}
        <div className="card-hero-flame rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="flex justify-center mb-2">
            <StreakFlame size={120} activa={racha > 0} />
          </div>

          <div className={`text-7xl font-black tracking-tight leading-none ${racha > 0 ? 'text-fire' : 'text-zinc-600'}`}>
            {racha}
          </div>
          <p className="text-zinc-400 text-base font-semibold mt-2">
            {racha === 0 ? 'Encendé tu racha hoy' : racha === 1 ? 'día de racha' : 'días de racha'}
          </p>

          {/* Semana Duolingo */}
          <div className="flex items-center justify-between gap-1.5 mt-7 px-1">
            {semana.map(d => (
              <div key={d.iso} className="flex flex-col items-center gap-1.5 flex-1">
                <span className={`text-[10px] font-black ${d.esHoy ? 'text-[#ffd600]' : 'text-zinc-600'}`}>
                  {d.inicial}
                </span>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    d.activo
                      ? 'animate-pop'
                      : d.esHoy
                        ? 'border-2 border-dashed border-[#ffd600]/50'
                        : 'border-2 border-zinc-800'
                  }`}
                  style={d.activo ? { background: 'linear-gradient(160deg, #ffd600, #ff9500)' } : {}}
                >
                  {d.activo
                    ? <Check size={18} strokeWidth={3.5} className="text-zinc-950" />
                    : d.esHoy
                      ? <Flame size={15} className="text-[#ffd600]/60" />
                      : null
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Check-in ──────────────────────────────────────────────────── */}
        <JuicyButton
          variant="gold"
          fullWidth
          disabled={checkInHecho}
          onClick={handleCheckIn}
          className="!py-4 text-base"
        >
          {checkInHecho ? '✓ Check-in completado — volvé mañana' : '🔥 Hacer check-in del día · +5 XP'}
        </JuicyButton>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <Reveal>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-[#ffd600]/10 border border-[#ffd600]/25 flex items-center justify-center">
              <Trophy size={18} className="text-[#ffd600]" />
            </div>
            <div className="text-3xl font-black text-white">{rachaMaxima}</div>
            <p className="text-zinc-500 text-xs font-semibold mt-1">Racha máxima</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-[#7c5cfc]/10 border border-[#7c5cfc]/25 flex items-center justify-center">
              <Calendar size={18} className="text-[#ab9ff2]" />
            </div>
            <div className="text-3xl font-black text-white">{diasTotales}</div>
            <p className="text-zinc-500 text-xs font-semibold mt-1">Días activos totales</p>
          </div>
        </div>
        </Reveal>

        {/* ── Últimos 30 días ───────────────────────────────────────────── */}
        <Reveal delay={80}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <h3 className="text-white font-bold text-sm mb-4">Últimos 30 días</h3>
          <div className="grid grid-cols-10 gap-1.5">
            {ultimos30.map(({ fecha, activo }) => (
              <div
                key={fecha}
                title={fecha}
                className={`aspect-square rounded-lg transition-all ${activo ? '' : 'bg-zinc-800'}`}
                style={activo ? { background: 'linear-gradient(160deg, #ffd600, #ff9500)' } : {}}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-3 h-3 rounded" style={{ background: 'linear-gradient(160deg, #ffd600, #ff9500)' }} />
            <span className="text-zinc-500 text-xs">Día activo</span>
            <div className="w-3 h-3 rounded bg-zinc-800 ml-2" />
            <span className="text-zinc-500 text-xs">Sin actividad</span>
          </div>
        </div>
        </Reveal>

        {/* Cómo funciona */}
        <p className="text-zinc-600 text-xs text-center px-4 pb-2">
          Un día cuenta como activo si registrás una transacción o hacés tu check-in.
          No rompas la cadena. 🔗
        </p>
      </div>
    </AppLayout>
  )
}
