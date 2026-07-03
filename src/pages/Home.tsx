import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Target,
  Zap,
  ShieldCheck,
  BarChart3,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatearMonto, mesActual, formatearMes, formatearFecha, porcentaje } from '../utils/formatters'
import { calcularRacha, calcularRachaMaxima, obtenerUltimos30Dias } from '../utils/streakLogic'
import { getRangoInfo, getProgresoRango, getTemporadaActual, getXPTemporada, formatXP, RANGOS } from '../utils/xp'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts'
import { format, subMonths, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const COLORES_CATEGORIA = [
  '#ffd600', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#f97316',
]

const META_MILLON = 1_000_000

function mesISO(offset: number): string {
  return format(subMonths(new Date(), offset), 'yyyy-MM')
}

function mesCorto(mesIso: string): string {
  return format(parseISO(`${mesIso}-01`), 'MMM', { locale: es })
}

function calcularScoreSalud(
  ingresos: number,
  gastos: number,
  racha: number,
  totalPresupuestos: number,
  presupuestosOk: number
): number {
  if (ingresos === 0) return 0
  const tasaAhorro = Math.max(0, (ingresos - gastos) / ingresos)
  const scoreAhorro = Math.min(40, Math.round(tasaAhorro * 80))
  const scoreRacha = Math.min(30, Math.round(racha * 1.5))
  const scorePres =
    totalPresupuestos > 0
      ? Math.min(30, Math.round((presupuestosOk / totalPresupuestos) * 30))
      : 15
  return scoreAhorro + scoreRacha + scorePres
}

function labelScore(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: 'Excelente 🔥', color: '#ffd600', bg: '#ffd60015' }
  if (score >= 60) return { label: 'Buena 💪', color: '#10b981', bg: '#10b98115' }
  if (score >= 40) return { label: 'Regular 📈', color: '#f59e0b', bg: '#f59e0b15' }
  return { label: 'Necesita atención ⚠️', color: '#f43f5e', bg: '#f43f5e15' }
}

export function Home() {
  const { state } = useApp()
  const navigate = useNavigate()
  const mes = mesActual()
  const racha = calcularRacha(state.diasActivos, state.transacciones)
  const rachaMaxima = calcularRachaMaxima(state.diasActivos, state.transacciones)
  const ultimos30Dias = obtenerUltimos30Dias(state.diasActivos, state.transacciones)
  const totalDiasActivos = new Set([
    ...state.diasActivos.map(d => d.fecha),
    ...state.transacciones.map(t => t.fecha),
  ]).size

  const temporada = getTemporadaActual()
  const rangoInfo = getRangoInfo(state.xp.total)
  const progreso = getProgresoRango(state.xp.total)
  const xpTemporada = getXPTemporada(state.xp, temporada)

  // Current month — fall back to prev month if barely any data
  const txDelMesCurrent = state.transacciones.filter(t => t.fecha.startsWith(mes))
  const mesRef = txDelMesCurrent.length >= 5 ? mes : mesISO(1)
  const txDelMes = txDelMesCurrent.length >= 5
    ? txDelMesCurrent
    : state.transacciones.filter(t => t.fecha.startsWith(mesISO(1)))

  const ingresos = txDelMes.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const gastos = txDelMes.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const balance = ingresos - gastos
  const ahorroNeto = Math.max(0, balance)
  const tasaAhorro = ingresos > 0 ? Math.round((ahorroNeto / ingresos) * 100) : 0

  // Previous month comparison
  const mesPrev = mesRef === mes ? mesISO(1) : mesISO(2)
  const txMesPrev = state.transacciones.filter(t => t.fecha.startsWith(mesPrev))
  const ingresosPrev = txMesPrev.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const gastosPrev = txMesPrev.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)

  const crecimientoIngresos = ingresosPrev > 0
    ? Math.round(((ingresos - ingresosPrev) / ingresosPrev) * 100)
    : null
  const cambioGastos = gastosPrev > 0
    ? Math.round(((gastos - gastosPrev) / gastosPrev) * 100)
    : null

  // Budget health
  const presupuestosMes = state.presupuestos.filter(p => p.mes === mesRef)
  const gastosPorCat = txDelMes
    .filter(t => t.tipo === 'gasto')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] ?? 0) + t.monto
      return acc
    }, {})
  const presupuestosOk = presupuestosMes.filter(
    p => (gastosPorCat[p.categoria] ?? 0) <= p.monto
  ).length

  const score = calcularScoreSalud(ingresos, gastos, racha, presupuestosMes.length, presupuestosOk)
  const scoreInfo = labelScore(score)

  // Camino al Millón
  const mesesParaMillon = ahorroNeto > 0 ? Math.ceil(META_MILLON / ahorroNeto) : null
  const totalAhorrado = state.transacciones
    .filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0) -
    state.transacciones
      .filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const pctHaciaMillon = Math.min(100, Math.max(0, Math.round((totalAhorrado / META_MILLON) * 100)))

  // Income by source
  const ingresosPorCat = txDelMes
    .filter(t => t.tipo === 'ingreso')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] ?? 0) + t.monto
      return acc
    }, {})

  // 6-month bar chart
  const barData = Array.from({ length: 6 }, (_, i) => {
    const m = mesISO(5 - i)
    const txM = state.transacciones.filter(t => t.fecha.startsWith(m))
    const ing = txM.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
    const gst = txM.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
    return { mes: mesCorto(m), Ingresos: ing, Gastos: gst }
  })

  // Net savings trend
  const areaData = Array.from({ length: 6 }, (_, i) => {
    const m = mesISO(5 - i)
    const txM = state.transacciones.filter(t => t.fecha.startsWith(m))
    const ing = txM.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
    const gst = txM.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
    return { mes: mesCorto(m), Ahorro: Math.max(0, ing - gst) }
  })

  // Pie data
  const pieData = Object.entries(gastosPorCat)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  const hayDatos = state.transacciones.length > 0

  return (
    <AppLayout titulo="Dashboard">
      <div className="space-y-5 animate-fade-in max-w-5xl">

        {/* ── Balance hero ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-400 text-xs font-medium mb-1">Balance {formatearMes(mesRef)}</p>
              <p className={`text-4xl font-extrabold tracking-tight ${balance >= 0 ? 'text-[#ffd600]' : 'text-rose-400'}`}>
                {formatearMonto(balance)}
              </p>
              {ingresos > 0 && (
                <p className="text-zinc-500 text-xs mt-1.5">
                  Tasa de ahorro: <span className="text-zinc-300 font-semibold">{tasaAhorro}%</span>
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-zinc-500 text-xs mb-1">Ahorro neto</p>
              <p className="text-xl font-bold text-emerald-400">{formatearMonto(ahorroNeto)}</p>
            </div>
          </div>

          {ahorroNeto > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Target size={11} className="text-[#ffd600]" />
                  Camino al Millón
                </span>
                <span className="text-zinc-400">{pctHaciaMillon}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pctHaciaMillon}%`, background: '#ffd600' }}
                />
              </div>
              {mesesParaMillon !== null && (
                <p className="text-zinc-600 text-xs mt-1">
                  A este ritmo: {mesesParaMillon} {mesesParaMillon === 1 ? 'mes' : 'meses'} para $1M
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Health Score ── */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: scoreInfo.bg, borderColor: `${scoreInfo.color}30` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-0">
              <ShieldCheck size={16} style={{ color: scoreInfo.color }} />
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Salud Financiera</p>
            </div>
            <span className="text-xs font-medium" style={{ color: scoreInfo.color }}>{scoreInfo.label}</span>
          </div>
          <div className="flex items-end gap-3 mt-2">
            <span className="text-5xl font-extrabold" style={{ color: scoreInfo.color }}>{score}</span>
            <span className="text-zinc-400 text-sm mb-1">/100</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-zinc-500">
            <div className="flex flex-col gap-0.5">
              <span>Tasa de ahorro</span>
              <span className="text-zinc-300 font-semibold">{tasaAhorro}%</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span>Racha activa</span>
              <span className="text-zinc-300 font-semibold">{racha} días</span>
            </div>
            {presupuestosMes.length > 0 && (
              <div className="flex flex-col gap-0.5">
                <span>Presupuestos OK</span>
                <span className="text-zinc-300 font-semibold">{presupuestosOk}/{presupuestosMes.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Rank + Season ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${rangoInfo.color}18`, border: `1.5px solid ${rangoInfo.color}40` }}
              >
                {rangoInfo.emoji}
              </div>
              <div>
                <p className="font-bold text-lg" style={{ color: rangoInfo.color }}>{rangoInfo.rango}</p>
                <p className="text-zinc-500 text-xs">{temporada.emoji} {temporada.nombre}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Esta temporada</p>
              <p className="font-bold text-[#ffd600] flex items-center gap-1 justify-end text-sm">
                <Zap size={12} />
                +{formatXP(xpTemporada)} XP
              </p>
              <p className="text-zinc-600 text-xs mt-0.5">{formatXP(state.xp.total)} XP total</p>
            </div>
          </div>

          {/* XP progress bar */}
          <div className="mb-4">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progreso.porcentaje}%`, background: rangoInfo.color }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs">
              <span className="text-zinc-500">{formatXP(state.xp.total)} XP</span>
              {progreso.siguiente
                ? <span className="text-zinc-600">{formatXP(progreso.xpParaSiguiente!)} para {progreso.siguiente.rango} {progreso.siguiente.emoji}</span>
                : <span className="text-[#ffd600] font-semibold">Rango Máximo 👑</span>
              }
            </div>
          </div>

          {/* Full rank ladder */}
          <div className="grid grid-cols-5 gap-1.5">
            {RANGOS.map(r => {
              const alcanzado = state.xp.total >= r.minXP
              const esCurrent = rangoInfo.rango === r.rango
              return (
                <div
                  key={r.rango}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${
                    esCurrent
                      ? 'border-current'
                      : alcanzado
                      ? 'border-zinc-700 bg-zinc-800/30'
                      : 'border-zinc-800/50 opacity-40'
                  }`}
                  style={esCurrent ? { borderColor: `${r.color}60`, background: `${r.color}10` } : {}}
                >
                  <span className="text-lg">{r.emoji}</span>
                  <span
                    className="text-[10px] font-semibold leading-tight"
                    style={{ color: esCurrent ? r.color : alcanzado ? '#a1a1aa' : '#52525b' }}
                  >
                    {r.rango}
                  </span>
                  <span className="text-[9px] text-zinc-600">
                    {r.maxXP ? `${formatXP(r.minXP)}` : `${formatXP(r.minXP)}+`}
                  </span>
                  {alcanzado && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: r.color }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={() => navigate('/proyeccion')}
            className="mt-3 w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors text-center"
          >
            Ver proyección completa →
          </button>
        </div>

        {/* ── Compact activity streak ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-300 text-sm font-medium">Actividad — últimos 30 días</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-zinc-500">Racha: <span className="text-[#ffd600] font-bold">{racha}d</span></span>
              <span className="text-zinc-500">Máx: <span className="text-zinc-300 font-semibold">{rachaMaxima}d</span></span>
              <span className="text-zinc-500">Total: <span className="text-zinc-300 font-semibold">{totalDiasActivos}d</span></span>
            </div>
          </div>
          <div className="grid grid-cols-15 gap-1" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
            {ultimos30Dias.map(({ fecha, activo }) => (
              <div
                key={fecha}
                title={fecha}
                className={`h-4 rounded-sm transition-all ${activo ? '' : 'bg-zinc-800'}`}
                style={activo ? { background: '#ffd600', opacity: 0.85 } : {}}
              />
            ))}
          </div>
        </div>

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <span className="text-zinc-400 text-xs">Ingresos</span>
            </div>
            <p className="text-emerald-400 font-bold">{formatearMonto(ingresos)}</p>
            {crecimientoIngresos !== null && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${
                crecimientoIngresos > 0 ? 'text-emerald-400' : crecimientoIngresos < 0 ? 'text-rose-400' : 'text-zinc-500'
              }`}>
                {crecimientoIngresos > 0 ? <ArrowUpRight size={11} /> : crecimientoIngresos < 0 ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                {crecimientoIngresos > 0 ? '+' : ''}{crecimientoIngresos}% vs ant.
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-rose-400" />
              <span className="text-zinc-400 text-xs">Gastos</span>
            </div>
            <p className="text-rose-400 font-bold">{formatearMonto(gastos)}</p>
            {cambioGastos !== null && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${
                cambioGastos < 0 ? 'text-emerald-400' : cambioGastos > 0 ? 'text-rose-400' : 'text-zinc-500'
              }`}>
                {cambioGastos > 0 ? <ArrowUpRight size={11} /> : cambioGastos < 0 ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                {cambioGastos > 0 ? '+' : ''}{cambioGastos}% vs ant.
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-[#ffd600]" />
              <span className="text-zinc-400 text-xs">Tasa ahorro</span>
            </div>
            <p className="text-[#ffd600] font-bold">{tasaAhorro}%</p>
            <p className="text-zinc-600 text-xs mt-1">de ingresos</p>
          </div>
        </div>

        {/* ── Empty state ── */}
        {!hayDatos && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Wallet size={28} className="text-zinc-600" />
            </div>
            <h3 className="text-white font-medium mb-2">Sin datos todavía</h3>
            <p className="text-zinc-500 text-sm">
              Cargá datos de ejemplo desde{' '}
              <span className="text-[#ffd600]">Configuración</span> o agrega una transacción.
            </p>
          </div>
        )}

        {hayDatos && (
          <>
            {/* ── Millionaire projection widget ── */}
            <div
              className="rounded-2xl p-5 border cursor-pointer hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg, #ffd60015 0%, #09090b 100%)', borderColor: '#ffd60025' }}
              onClick={() => navigate('/proyeccion')}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 size={16} className="text-[#ffd600]" />
                    <span className="text-[#ffd600] text-xs font-semibold uppercase tracking-wide">Proyección</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">Tu camino al millón 💰</h3>
                </div>
                <ArrowUpRight size={20} className="text-zinc-500" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Ahorro mensual</p>
                  <p className="text-white font-bold text-sm">{formatearMonto(ahorroNeto)}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Meses para $1M</p>
                  <p className="text-white font-bold text-sm">
                    {mesesParaMillon !== null ? `${mesesParaMillon} meses` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Progreso</p>
                  <p className="text-[#ffd600] font-bold text-sm">{pctHaciaMillon}%</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pctHaciaMillon}%`, background: 'linear-gradient(90deg, #ffd600, #ffaa00)' }}
                  />
                </div>
              </div>
              <p className="text-zinc-600 text-xs mt-2 text-right">Ver proyección completa →</p>
            </div>

            {/* ── Net savings area chart ── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-zinc-300 font-medium text-sm mb-4">Ahorro neto mensual</h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffd600" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ffd600" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)}
                    width={42}
                  />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    labelStyle={{ color: '#a1a1aa', fontSize: 11 }}
                    formatter={(value: number) => [formatearMonto(value), 'Ahorro']}
                  />
                  <Area type="monotone" dataKey="Ahorro" stroke="#ffd600" strokeWidth={2} fill="url(#goldGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* ── 6-month evolution bar chart ── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-zinc-300 font-medium text-sm mb-4">Evolución 6 meses</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barCategoryGap="30%" barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)}
                    width={42}
                  />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    labelStyle={{ color: '#a1a1aa', fontSize: 11 }}
                    formatter={(value: number) => [formatearMonto(value), '']}
                  />
                  <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-zinc-500 text-xs">Ingresos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                  <span className="text-zinc-500 text-xs">Gastos</span>
                </div>
              </div>
            </div>

            {/* ── Income sources ── */}
            {Object.keys(ingresosPorCat).length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-zinc-300 font-medium text-sm mb-4">
                  Fuentes de ingreso — {formatearMes(mesRef)}
                </h3>
                <div className="space-y-3">
                  {Object.entries(ingresosPorCat)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, monto], i) => {
                      const pct = porcentaje(monto, ingresos)
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: COLORES_CATEGORIA[i % COLORES_CATEGORIA.length] }} />
                              <span className="text-zinc-300 text-sm">{cat}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-zinc-100 text-sm font-medium">{formatearMonto(monto)}</span>
                              <span className="text-zinc-500 text-xs ml-2">{pct}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: COLORES_CATEGORIA[i % COLORES_CATEGORIA.length] }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* ── Spending by category ── */}
            {pieData.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-zinc-300 font-medium text-sm mb-4">Gastos por categoría — {formatearMes(mesRef)}</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <PieChart width={160} height={160}>
                      <Pie data={pieData} cx={75} cy={75} innerRadius={45} outerRadius={72} paddingAngle={2} dataKey="value">
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORES_CATEGORIA[i % COLORES_CATEGORIA.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                        formatter={(value: number) => [formatearMonto(value), '']}
                      />
                    </PieChart>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    {pieData.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORES_CATEGORIA[i % COLORES_CATEGORIA.length] }} />
                          <span className="text-zinc-400 text-xs truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-zinc-300 text-xs font-medium">{formatearMonto(item.value)}</span>
                          <span className="text-zinc-600 text-xs w-8 text-right">{porcentaje(item.value, gastos)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Recent transactions ── */}
            <div>
              <h3 className="text-zinc-300 font-medium mb-3">Últimas transacciones</h3>
              <div className="space-y-2">
                {[...state.transacciones]
                  .sort((a, b) => b.fecha.localeCompare(a.fecha))
                  .slice(0, 5)
                  .map(tx => (
                    <div key={tx.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{tx.categoria}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          {formatearFecha(tx.fecha)}
                          {tx.nota && ` · ${tx.nota}`}
                        </p>
                      </div>
                      <span className={`font-semibold text-sm ${tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.tipo === 'ingreso' ? '+' : '-'}{formatearMonto(tx.monto)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
