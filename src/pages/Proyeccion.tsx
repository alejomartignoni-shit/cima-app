import { useState, useMemo } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Target, TrendingUp, Crown, Zap, Calendar, ChevronDown } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatearMonto, mesActual } from '../utils/formatters'
import { getRangoInfo, RANGOS, formatXP } from '../utils/xp'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { format, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

const METAS = [
  { label: '$1,000,000', value: 1_000_000 },
  { label: '$5,000,000', value: 5_000_000 },
  { label: '$10,000,000', value: 10_000_000 },
  { label: '$50,000,000', value: 50_000_000 },
  { label: '$100,000,000', value: 100_000_000 },
]

const TASA_INTERES_MENSUAL = 0.005 // 0.5% mensual ~ 6% anual (inversión conservadora)

function proyectarPatrimonio(
  ahorroMensual: number,
  tasaMensual: number,
  meses: number
): number[] {
  const pts: number[] = [0]
  let acc = 0
  for (let m = 1; m <= meses; m++) {
    acc = (acc + ahorroMensual) * (1 + tasaMensual)
    pts.push(Math.round(acc))
  }
  return pts
}

function mesesHastaMeta(ahorroMensual: number, tasaMensual: number, meta: number): number | null {
  if (ahorroMensual <= 0) return null
  let acc = 0
  for (let m = 1; m <= 600; m++) {
    acc = (acc + ahorroMensual) * (1 + tasaMensual)
    if (acc >= meta) return m
  }
  return null
}

function formatMesLabel(offset: number): string {
  return format(addMonths(new Date(), offset), 'MMM yy', { locale: es })
}

function formatMillones(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${n}`
}

export function Proyeccion() {
  const { state } = useApp()
  const [metaIdx, setMetaIdx] = useState(0)
  const [mostrarSelector, setMostrarSelector] = useState(false)

  const mes = mesActual()
  const txDelMesCurrent = state.transacciones.filter(t => t.fecha.startsWith(mes))
  // Fall back to previous month when current month has < 5 transactions
  const mesPrevStr = format(subMonths(new Date(), 1), 'yyyy-MM')
  const txDelMes = txDelMesCurrent.length >= 5
    ? txDelMesCurrent
    : state.transacciones.filter(t => t.fecha.startsWith(mesPrevStr))
  const ingresos = txDelMes.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const gastos = txDelMes.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const ahorroNeto = Math.max(0, ingresos - gastos)
  const tasaAhorro = ingresos > 0 ? Math.round((ahorroNeto / ingresos) * 100) : 0

  const metaActual = METAS[metaIdx]

  const MESES_PROYECCION = 60

  // 3 scenarios
  const escenarioConservador = useMemo(() =>
    proyectarPatrimonio(ahorroNeto * 0.6, 0, MESES_PROYECCION), [ahorroNeto])
  const escenarioActual = useMemo(() =>
    proyectarPatrimonio(ahorroNeto, TASA_INTERES_MENSUAL, MESES_PROYECCION), [ahorroNeto])
  const escenarioAgresivo = useMemo(() =>
    proyectarPatrimonio(ahorroNeto * 1.5, TASA_INTERES_MENSUAL * 1.5, MESES_PROYECCION), [ahorroNeto])

  const chartData = useMemo(() =>
    Array.from({ length: MESES_PROYECCION + 1 }, (_, i) => ({
      mes: i === 0 ? 'Hoy' : formatMesLabel(i),
      Conservador: escenarioConservador[i],
      Actual: escenarioActual[i],
      Agresivo: escenarioAgresivo[i],
    })),
    [escenarioConservador, escenarioActual, escenarioAgresivo]
  )

  const mesesMeta = mesesHastaMeta(ahorroNeto, TASA_INTERES_MENSUAL, metaActual.value)
  const mesesMetaConservador = mesesHastaMeta(ahorroNeto * 0.6, 0, metaActual.value)
  const mesesMetaAgresivo = mesesHastaMeta(ahorroNeto * 1.5, TASA_INTERES_MENSUAL * 1.5, metaActual.value)

  function fechaLlegada(meses: number | null): string {
    if (!meses) return '—'
    return format(addMonths(new Date(), meses), "MMM 'de' yyyy", { locale: es })
  }

  // XP needed per rank preview
  const rangoActual = getRangoInfo(state.xp.total)

  const hayDatos = state.transacciones.length > 0

  return (
    <AppLayout titulo="Proyección Millonaria">
      <div className="space-y-6 animate-fade-in max-w-4xl">

        {/* ── Hero ── */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: 'linear-gradient(135deg, #ffd60018 0%, #09090b 100%)', borderColor: '#ffd60030' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Crown size={18} className="text-[#ffd600]" />
            <span className="text-[#ffd600] text-xs font-bold uppercase tracking-widest">Mentes Millonarias</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-1">Tu camino al millón 💰</h2>
          <p className="text-zinc-400 text-sm">
            Visualizá cómo crece tu patrimonio si mantenés tus hábitos actuales.
          </p>

          {!hayDatos && (
            <div className="mt-4 p-3 rounded-xl bg-zinc-800/60 border border-zinc-700">
              <p className="text-zinc-400 text-sm">
                Cargá datos desde <span className="text-[#ffd600]">Configuración → Datos de ejemplo</span> para ver tu proyección personalizada.
              </p>
            </div>
          )}
        </div>

        {/* ── Goal selector ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-xs font-medium mb-3">Meta de patrimonio</p>
          <div className="relative">
            <button
              onClick={() => setMostrarSelector(v => !v)}
              className="w-full flex items-center justify-between bg-zinc-800 border border-zinc-700 hover:border-[#ffd600]/50 rounded-xl px-4 py-3 text-left transition-all"
            >
              <div className="flex items-center gap-2">
                <Target size={16} className="text-[#ffd600]" />
                <span className="text-white font-bold text-lg">{metaActual.label}</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-zinc-500 transition-transform ${mostrarSelector ? 'rotate-180' : ''}`}
              />
            </button>

            {mostrarSelector && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden z-10 shadow-xl">
                {METAS.map((meta, i) => (
                  <button
                    key={meta.value}
                    onClick={() => { setMetaIdx(i); setMostrarSelector(false) }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-zinc-700 ${
                      i === metaIdx ? 'text-[#ffd600]' : 'text-zinc-300'
                    }`}
                  >
                    <span className="font-semibold">{meta.label}</span>
                    {mesesHastaMeta(ahorroNeto, TASA_INTERES_MENSUAL, meta.value) !== null && (
                      <span className="text-zinc-500 text-xs">
                        {mesesHastaMeta(ahorroNeto, TASA_INTERES_MENSUAL, meta.value)} meses
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Current snapshot ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Ahorro mensual</p>
            <p className="text-[#ffd600] font-bold text-sm">{formatearMonto(ahorroNeto)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Tasa de ahorro</p>
            <p className="text-white font-bold text-sm">{tasaAhorro}%</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Meta actual</p>
            <p className="text-white font-bold text-sm">{metaActual.label}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Llegada estimada</p>
            <p className="text-emerald-400 font-bold text-sm">
              {mesesMeta ? fechaLlegada(mesesMeta) : 'Sin datos'}
            </p>
          </div>
        </div>

        {/* ── Projection chart ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-300 font-medium text-sm">Proyección patrimonial a 5 años</h3>
            <span className="text-zinc-600 text-xs">con interés compuesto</span>
          </div>

          {hayDatos && ahorroNeto > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gradAgresivo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffd600" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ffd600" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradConservador" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b7280" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={11}
                />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatMillones}
                  width={50}
                />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  labelStyle={{ color: '#a1a1aa', fontSize: 11 }}
                  formatter={(value: number, name: string) => [formatearMonto(value), name]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, color: '#71717a', paddingTop: 12 }}
                />
                <Area type="monotone" dataKey="Conservador" stroke="#6b7280" strokeWidth={1.5} fill="url(#gradConservador)" strokeDasharray="4 2" />
                <Area type="monotone" dataKey="Actual" stroke="#10b981" strokeWidth={2} fill="url(#gradActual)" />
                <Area type="monotone" dataKey="Agresivo" stroke="#ffd600" strokeWidth={2.5} fill="url(#gradAgresivo)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center">
              <div className="text-center">
                <TrendingUp size={40} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">
                  {!hayDatos
                    ? 'Cargá datos de ejemplo para ver el gráfico'
                    : 'Necesitás tener ahorro neto positivo este mes'}
                </p>
              </div>
            </div>
          )}

          {/* Scenario legend */}
          {hayDatos && ahorroNeto > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-zinc-800/50 border border-zinc-700">
                <p className="text-zinc-500 text-xs mb-1">Conservador</p>
                <p className="text-zinc-300 font-bold text-xs">{fechaLlegada(mesesMetaConservador)}</p>
                <p className="text-zinc-600 text-[10px] mt-0.5">-40% ahorro, sin interés</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-emerald-400 text-xs mb-1">Ritmo actual</p>
                <p className="text-white font-bold text-xs">{fechaLlegada(mesesMeta)}</p>
                <p className="text-zinc-600 text-[10px] mt-0.5">6% anual compuesto</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-[#ffd600]/5 border border-[#ffd600]/20">
                <p className="text-[#ffd600] text-xs mb-1">Agresivo</p>
                <p className="text-white font-bold text-xs">{fechaLlegada(mesesMetaAgresivo)}</p>
                <p className="text-zinc-600 text-[10px] mt-0.5">+50% ahorro, 9% anual</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Time to milestones ── */}
        {hayDatos && ahorroNeto > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-zinc-300 font-medium text-sm mb-4">Hitos financieros a tu ritmo</h3>
            <div className="space-y-3">
              {METAS.map(meta => {
                const m = mesesHastaMeta(ahorroNeto, TASA_INTERES_MENSUAL, meta.value)
                const reached = m !== null
                return (
                  <div key={meta.value} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${reached ? 'bg-[#ffd600]' : 'bg-zinc-700'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${reached ? 'text-white' : 'text-zinc-500'}`}>
                          {meta.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {reached ? (
                            <>
                              <span className="text-zinc-400 text-xs">{m} meses</span>
                              <span className="text-[#ffd600] text-xs font-medium flex items-center gap-1">
                                <Calendar size={10} />
                                {fechaLlegada(m)}
                              </span>
                            </>
                          ) : (
                            <span className="text-zinc-600 text-xs">más de 50 años</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Rank progression preview ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Crown size={16} className="text-[#ffd600]" />
            <h3 className="text-zinc-300 font-medium text-sm">Camino al rango Élite</h3>
          </div>

          <div className="space-y-2">
            {RANGOS.map(r => {
              const alcanzado = state.xp.total >= r.minXP
              const esCurrent = rangoActual.rango === r.rango
              const xpRestante = Math.max(0, r.minXP - state.xp.total)
              const diasParaXP = xpRestante > 0
                ? Math.ceil(xpRestante / 15)
                : 0

              return (
                <div
                  key={r.rango}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    esCurrent
                      ? ''
                      : alcanzado
                      ? 'border-zinc-700 bg-zinc-800/30'
                      : 'border-zinc-800/50 opacity-50'
                  }`}
                  style={esCurrent ? { borderColor: `${r.color}50`, background: `${r.color}08` } : {}}
                >
                  <span className="text-xl">{r.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: esCurrent ? r.color : alcanzado ? '#e4e4e7' : '#52525b' }}
                      >
                        {r.rango}
                        {esCurrent && <span className="ml-2 text-xs font-normal text-zinc-500">← actual</span>}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Zap size={10} className="text-[#ffd600]" />
                        <span className="text-zinc-500">
                          {r.maxXP ? `${formatXP(r.minXP)} – ${formatXP(r.maxXP)} XP` : `${formatXP(r.minXP)}+ XP`}
                        </span>
                      </div>
                    </div>
                    {!alcanzado && xpRestante > 0 && (
                      <p className="text-zinc-600 text-xs mt-0.5">
                        Te faltan {formatXP(xpRestante)} XP · ~{diasParaXP} días de actividad constante
                      </p>
                    )}
                  </div>
                  {alcanzado && (
                    <div className="w-5 h-5 rounded-full bg-[#ffd600]/15 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#ffd600]" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Elite profile preview ── */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: 'linear-gradient(135deg, #ffd60010, #8b5cf608, #09090b)', borderColor: '#ffd60025' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: '#10b98118', border: '2px solid #10b98140' }}
            >
              👑
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Vista previa</p>
              <p className="text-xl font-extrabold text-white">Perfil Élite</p>
              <p className="text-emerald-400 text-xs">20,000+ XP · Rango máximo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <p className="text-zinc-500 text-xs mb-1">XP total</p>
              <p className="text-[#ffd600] font-bold">20k+</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <p className="text-zinc-500 text-xs mb-1">Racha</p>
              <p className="text-[#ffd600] font-bold">365 días</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <p className="text-zinc-500 text-xs mb-1">Ahorro mensual</p>
              <p className="text-[#ffd600] font-bold">50%+</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <p className="text-zinc-500 text-xs mb-1">Hábitos</p>
              <p className="text-[#ffd600] font-bold">Todos ✓</p>
            </div>
          </div>

          <p className="text-zinc-500 text-xs text-center">
            Este es el perfil que vas a tener cuando seas constante. Cada acción de hoy te acerca.
          </p>
        </div>

      </div>
    </AppLayout>
  )
}
