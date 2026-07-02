import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Zap } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatXP, getRangoInfo, getProgresoRango, getTemporadaActual, getXPTemporada, getProgresoTemporada, RANGOS } from '../utils/xp'
import { formatearFecha } from '../utils/formatters'

export function Temporada() {
  const { state } = useApp()
  const navigate = useNavigate()

  const temporada = getTemporadaActual()
  const xpTotal = state.xp.total
  const xpTemporada = getXPTemporada(state.xp, temporada)
  const progreso = getProgresoRango(xpTotal)
  const progresoTemporada = getProgresoTemporada(temporada)
  const rangoActual = getRangoInfo(xpTotal)

  const historialReciente = [...state.xp.historial].reverse().slice(0, 20)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft size={20} className="text-zinc-400" />
        </button>
        <h1 className="text-white font-semibold">Temporada & Rango</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">

        {/* ─── Season card ──────────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-zinc-500 text-xs mb-1">Temporada actual</p>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{temporada.emoji}</span>
                {temporada.nombre}
              </h2>
              <p className="text-zinc-500 text-xs mt-1">
                {formatearFecha(temporada.inicio)} → {formatearFecha(temporada.fin)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-zinc-500 text-xs">XP esta temporada</p>
              <p className="text-2xl font-bold text-emerald-400">{formatXP(xpTemporada)}</p>
            </div>
          </div>

          {/* Season progress bar */}
          <div>
            <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
              <span>Progreso de la temporada</span>
              <span>{progresoTemporada}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                style={{ width: `${progresoTemporada}%` }}
              />
            </div>
            <p className="text-zinc-600 text-xs mt-1.5">La temporada termina el {formatearFecha(temporada.fin)}</p>
          </div>
        </div>

        {/* ─── Rank card ────────────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-500 text-xs mb-3">Tu rango</p>
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `${rangoActual.color}18`, border: `2px solid ${rangoActual.color}40` }}
            >
              {rangoActual.emoji}
            </div>
            <div>
              <h3 className="text-2xl font-bold" style={{ color: rangoActual.color }}>
                {rangoActual.rango}
              </h3>
              <p className="text-zinc-400 text-sm">{formatXP(xpTotal)} XP total</p>
            </div>
          </div>

          {/* XP bar to next rank */}
          {progreso.siguiente ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{rangoActual.emoji}</span>
                  <span className="text-zinc-400 text-xs">{rangoActual.rango}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 text-xs">{progreso.siguiente.rango}</span>
                  <span className="text-base">{progreso.siguiente.emoji}</span>
                </div>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progreso.porcentaje}%`,
                    background: `linear-gradient(90deg, ${rangoActual.color}88, ${rangoActual.color})`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1.5">
                <span className="text-zinc-500">{formatXP(progreso.xpEnRango)} XP en rango</span>
                <span className="text-zinc-400">
                  Faltan <span style={{ color: rangoActual.color }} className="font-semibold">
                    {formatXP(progreso.xpParaSiguiente!)}
                  </span> para {progreso.siguiente.rango}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-emerald-400 font-semibold text-sm">Rango máximo alcanzado 👑</p>
              <p className="text-zinc-500 text-xs mt-1">Sos de la élite de CIMA</p>
            </div>
          )}
        </div>

        {/* ─── All ranks ────────────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-500 text-xs mb-3">Todos los rangos</p>
          <div className="space-y-2">
            {RANGOS.map(r => {
              const esCurrent = r.rango === rangoActual.rango
              const yaAlcanzado = xpTotal >= r.minXP
              return (
                <div
                  key={r.rango}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    esCurrent
                      ? 'border-opacity-60'
                      : yaAlcanzado
                      ? 'border-zinc-700 bg-zinc-800/40'
                      : 'border-zinc-800/50 opacity-40'
                  }`}
                  style={esCurrent ? { borderColor: `${r.color}60`, background: `${r.color}10` } : {}}
                >
                  <span className="text-xl">{r.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: esCurrent ? r.color : yaAlcanzado ? '#e4e4e7' : '#71717a' }}>
                      {r.rango}
                      {esCurrent && <span className="ml-2 text-xs font-normal text-zinc-500">← actual</span>}
                    </p>
                    <p className="text-zinc-600 text-xs">
                      {r.maxXP ? `${formatXP(r.minXP)} – ${formatXP(r.maxXP)} XP` : `${formatXP(r.minXP)}+ XP`}
                    </p>
                  </div>
                  {yaAlcanzado && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── Recent XP events ─────────────────────────────────────── */}
        {historialReciente.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <p className="text-zinc-500 text-xs mb-3">Historial de XP reciente</p>
            <div className="space-y-2">
              {historialReciente.map((e, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <Zap size={13} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-zinc-300 text-sm">{e.motivo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold text-sm">+{e.cantidad}</span>
                    <span className="text-zinc-600 text-xs">{e.fecha}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
