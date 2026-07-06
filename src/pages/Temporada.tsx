import { Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { useApp } from '../store/AppContext'
import { formatXP, getRangoInfo, getProgresoRango, getTemporadaActual, getXPTemporada, getProgresoTemporada, RANGOS } from '../utils/xp'
import { formatearFecha } from '../utils/formatters'
import { Reveal } from '../components/ui/Reveal'

export function Temporada() {
  const { state } = useApp()

  const temporada = getTemporadaActual()
  const xpTotal = state.xp.total
  const xpTemporada = getXPTemporada(state.xp, temporada)
  const progreso = getProgresoRango(xpTotal)
  const progresoTemporada = getProgresoTemporada(temporada)
  const rangoActual = getRangoInfo(xpTotal)

  const historialReciente = [...state.xp.historial].reverse().slice(0, 15)

  return (
    <AppLayout titulo="Temporada & Rango">
      <div className="space-y-4 max-w-5xl animate-fade-in">

        {/* Top row: Season + Current rank side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Season card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">Temporada actual</p>
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                  <span className="text-3xl">{temporada.emoji}</span>
                  {temporada.nombre}
                </h2>
                <p className="text-zinc-500 text-xs">
                  {formatearFecha(temporada.inicio)} → {formatearFecha(temporada.fin)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-zinc-500 text-xs mb-0.5">XP ganado</p>
                <p className="text-2xl font-bold text-emerald-400">{formatXP(xpTemporada)}</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                <span>Progreso de la temporada</span>
                <span className="font-semibold text-zinc-300">{progresoTemporada}%</span>
              </div>
              <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                  style={{ width: `${progresoTemporada}%` }}
                />
              </div>
              <p className="text-zinc-600 text-xs mt-1.5">Termina el {formatearFecha(temporada.fin)}</p>
            </div>
          </div>

          {/* Current rank card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">Tu rango</p>
            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `${rangoActual.color}18`, border: `2px solid ${rangoActual.color}50` }}
              >
                {rangoActual.emoji}
              </div>
              <div className="min-w-0">
                <h3 className="text-2xl font-bold truncate" style={{ color: rangoActual.color }}>
                  {rangoActual.rango}
                </h3>
                <p className="text-zinc-400 text-sm">{formatXP(xpTotal)} XP total</p>
              </div>
            </div>
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
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${progreso.porcentaje}%`, background: `linear-gradient(90deg, ${rangoActual.color}88, ${rangoActual.color})` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">{formatXP(progreso.xpEnRango)} XP en rango</span>
                  <span className="text-zinc-400">
                    Faltan <span style={{ color: rangoActual.color }} className="font-semibold">{formatXP(progreso.xpParaSiguiente!)}</span> para {progreso.siguiente.rango}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-3 bg-[#ffd60008] border border-[#ffd60030] rounded-xl">
                <p className="text-[#ffd600] font-semibold">Rango máximo alcanzado 👑</p>
                <p className="text-zinc-500 text-xs mt-1">Sos de la élite de CIMA</p>
              </div>
            )}
          </div>
        </div>

        {/* All ranks grid */}
        <Reveal>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-4">Todos los rangos</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RANGOS.map(r => {
              const esCurrent = r.rango === rangoActual.rango
              const yaAlcanzado = xpTotal >= r.minXP
              return (
                <div
                  key={r.rango}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    esCurrent ? '' : yaAlcanzado ? 'border-zinc-700 bg-zinc-800/30' : 'border-zinc-800/40 opacity-35'
                  }`}
                  style={esCurrent ? { borderColor: `${r.color}50`, background: `${r.color}0e` } : {}}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={esCurrent
                      ? { background: `${r.color}20`, border: `1.5px solid ${r.color}50` }
                      : { background: '#27272a' }}
                  >
                    {r.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate" style={{ color: esCurrent ? r.color : yaAlcanzado ? '#e4e4e7' : '#52525b' }}>
                        {r.rango}
                      </p>
                      {esCurrent && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${r.color}20`, color: r.color }}>
                          actual
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-600 text-xs">
                      {r.maxXP ? `${formatXP(r.minXP)} – ${formatXP(r.maxXP)} XP` : `${formatXP(r.minXP)}+ XP`}
                    </p>
                  </div>
                  {yaAlcanzado && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: esCurrent ? `${r.color}20` : '#18181b', border: `1px solid ${esCurrent ? r.color : '#3f3f46'}` }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: esCurrent ? r.color : '#10b981' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        </Reveal>

        {/* XP History */}
        {historialReciente.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-4">Historial de XP reciente</p>
            <div className="space-y-1">
              {historialReciente.map((e, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Zap size={12} className="text-emerald-400" />
                    </div>
                    <span className="text-zinc-300 text-sm truncate">{e.motivo}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-emerald-400 font-bold text-sm">+{e.cantidad}</span>
                    <span className="text-zinc-600 text-xs hidden sm:block">{e.fecha}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Elite merch teaser / unlock */}
        <Link to="/recompensas" className="block">
          <div className={`rounded-2xl p-5 border transition-all hover:scale-[1.01] ${
            rangoActual.rango === 'Élite'
              ? 'bg-gradient-to-br from-[#ffd600]/10 to-zinc-900 border-[#ffd600]/30'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  rangoActual.rango === 'Élite' ? 'bg-[#ffd600]/15' : 'bg-zinc-800'
                }`}>
                  {rangoActual.rango === 'Élite' ? '👑' : '🎁'}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {rangoActual.rango === 'Élite' ? '¡Merch gratis desbloqueado!' : 'Recompensas & Merch Élite'}
                  </p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {rangoActual.rango === 'Élite'
                      ? 'Reclamá tu hoodie de Mentes Millonarias'
                      : `Alcanzá Élite y recibís merch gratis · ${Math.max(0, 20000 - xpTotal).toLocaleString('es-AR')} XP restantes`}
                  </p>
                </div>
              </div>
              <span className={`text-sm flex-shrink-0 ${rangoActual.rango === 'Élite' ? 'text-[#ffd600]' : 'text-zinc-600'}`}>→</span>
            </div>
          </div>
        </Link>

      </div>
    </AppLayout>
  )
}
