import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Zap,
  ArrowRight,
  CreditCard,
  Target,
  Flame,
  Check,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatearMonto, mesActual, formatearMes, formatearFecha, hoy } from '../utils/formatters'
import { calcularRacha, checkInHechoHoy } from '../utils/streakLogic'
import { CountUp } from '../components/game/CountUp'
import { QuestCard } from '../components/game/QuestCard'
import { Reveal } from '../components/ui/Reveal'
import { celebrate } from '../components/game/Celebration'
import { playPop, vibrate } from '../utils/sound'
import { getRangoInfo, getProgresoRango, getTemporadaActual, getXPTemporada, formatXP, RANGOS } from '../utils/xp'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { format, subMonths, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const META_MILLON = 1_000_000

function mesISO(offset: number): string {
  return format(subMonths(new Date(), offset), 'yyyy-MM')
}

function mesCorto(mesIso: string): string {
  return format(parseISO(`${mesIso}-01`), 'MMM', { locale: es })
}

function StatusBadge({ tipo }: { tipo: 'ingreso' | 'gasto' }) {
  return tipo === 'ingreso'
    ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ingreso</span>
    : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">Gasto</span>
}

function QuickAction({
  icono: Icono,
  label,
  variante,
  onClick,
  hecho = false,
}: {
  icono: typeof Plus
  label: string
  variante: 'gold' | 'emerald' | 'violet' | 'dark'
  onClick: () => void
  hecho?: boolean
}) {
  return (
    <button
      onClick={() => { playPop(); vibrate(10); onClick() }}
      className="flex flex-col items-center gap-2 group"
    >
      <span className={`btn-juicy btn-juicy-${hecho ? 'dark' : variante} !rounded-full !p-0 w-14 h-14`}>
        {hecho ? <Check size={22} strokeWidth={3} className="text-emerald-400" /> : <Icono size={22} strokeWidth={2.5} />}
      </span>
      <span className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">{label}</span>
    </button>
  )
}

export function Home() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const mes = mesActual()
  const racha = calcularRacha(state.diasActivos, state.transacciones)
  const checkInHecho = checkInHechoHoy(state.ultimoCheckIn)

  function handleCheckIn() {
    if (checkInHecho) return
    dispatch({ type: 'CHECKIN_HOY', payload: hoy() })
    celebrate({ pieces: 60 })
  }

  const temporada = getTemporadaActual()
  const rangoInfo = getRangoInfo(state.xp.total)
  const progreso = getProgresoRango(state.xp.total)
  const xpTemporada = getXPTemporada(state.xp, temporada)

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

  const mesPrev = mesRef === mes ? mesISO(1) : mesISO(2)
  const txMesPrev = state.transacciones.filter(t => t.fecha.startsWith(mesPrev))
  const ingresosPrev = txMesPrev.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const gastosPrev = txMesPrev.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const ahorroNetoPrev = Math.max(0, ingresosPrev - gastosPrev)

  const crecimientoIngresos = ingresosPrev > 0 ? Math.round(((ingresos - ingresosPrev) / ingresosPrev) * 100) : null
  const cambioGastos = gastosPrev > 0 ? Math.round(((gastos - gastosPrev) / gastosPrev) * 100) : null
  const cambioAhorro = ahorroNetoPrev > 0 ? Math.round(((ahorroNeto - ahorroNetoPrev) / ahorroNetoPrev) * 100) : null

  const totalAhorrado = state.transacciones.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
    - state.transacciones.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const pctHaciaMillon = Math.min(100, Math.max(0, Math.round((totalAhorrado / META_MILLON) * 100)))
  const mesesParaMillon = ahorroNeto > 0 ? Math.ceil(META_MILLON / ahorroNeto) : null

  const barData = Array.from({ length: 8 }, (_, i) => {
    const m = mesISO(7 - i)
    const txM = state.transacciones.filter(t => t.fecha.startsWith(m))
    const ing = txM.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
    const gst = txM.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
    return { mes: mesCorto(m), Ingresos: ing, Gastos: gst }
  })

  const recentTx = [...state.transacciones]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 6)

  const hayDatos = state.transacciones.length > 0

  const fmtCompact = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v))

  return (
    <AppLayout titulo="Dashboard">
      <div className="space-y-4 animate-fade-in">

        {/* ── 1. Wallet Hero (estilo Phantom) ─────────────────────────────── */}
        <div className="card-hero rounded-3xl p-6 sm:p-8 relative overflow-hidden text-center">
          <div className="aurora-bg absolute inset-0 opacity-50 pointer-events-none" />
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">
            Patrimonio total
          </p>
          <CountUp
            value={totalAhorrado}
            format={formatearMonto}
            className={`block text-4xl sm:text-5xl font-black tracking-tight ${totalAhorrado >= 0 ? 'text-white' : 'text-rose-400'}`}
          />

          {/* Chips del mes */}
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
              balance >= 0
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            }`}>
              {balance >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {formatearMonto(balance)} · {formatearMes(mesRef)}
            </span>
            {ingresos > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-[#ab9ff2] bg-[#7c5cfc]/10 border border-[#7c5cfc]/25">
                <Zap size={11} /> {tasaAhorro}% ahorro
              </span>
            )}
          </div>

          {/* Acciones rápidas circulares */}
          <div className="flex items-start justify-center gap-5 sm:gap-8 mt-6">
            <QuickAction icono={Plus} label="Agregar" variante="gold" onClick={() => navigate('/transacciones')} />
            <QuickAction icono={Flame} label={checkInHecho ? 'Hecho ✓' : 'Check-in'} variante="emerald" hecho={checkInHecho} onClick={handleCheckIn} />
            <QuickAction icono={Target} label="Metas" variante="dark" onClick={() => navigate('/presupuestos')} />
            <QuickAction icono={TrendingUp} label="Proyección" variante="violet" onClick={() => navigate('/proyeccion')} />
          </div>

          {/* Camino al millón */}
          {hayDatos && (
            <div className="mt-6 pt-4 border-t border-zinc-800/60 text-left">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
                  <Target size={11} className="text-[#ffd600]" />
                  Camino al Millón
                </div>
                <span className="text-xs text-[#ffd600] font-black">{pctHaciaMillon}%</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pctHaciaMillon}%`, background: 'linear-gradient(90deg, #ffd600, #ff9500)' }} />
              </div>
              {mesesParaMillon !== null && (
                <p className="text-zinc-600 text-xs mt-1.5">
                  A este ritmo: {mesesParaMillon} {mesesParaMillon === 1 ? 'mes' : 'meses'} para $1M
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── 1b. Misiones del día ────────────────────────────────────────── */}
        <Reveal delay={60}>
          <QuestCard />
        </Reveal>

        {/* ── 2. Cash Flow + Income/Expense ──────────────────────────────── */}
        <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cash Flow chart */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-sm">Cash Flow</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-zinc-500 text-xs">Ingresos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#1a4a30' }} />
                  <span className="text-zinc-500 text-xs">Gastos</span>
                </div>
              </div>
            </div>
            {hayDatos ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} barCategoryGap="35%" barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#52525b', fontSize: 10 }}
                    axisLine={false} tickLine={false} width={38}
                    tickFormatter={fmtCompact}
                  />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: 12 }}
                    labelStyle={{ color: '#a1a1aa' }}
                    formatter={(v: number) => [formatearMonto(v), '']}
                  />
                  <Bar dataKey="Ingresos" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Gastos" fill="#1a4a30" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-zinc-600 text-sm">
                Sin datos todavía
              </div>
            )}
          </div>

          {/* Income + Expense sidebar */}
          <div className="flex flex-col gap-3">
            {/* Income */}
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <ArrowUpRight size={15} className="text-emerald-400" />
                </div>
                <span className="text-zinc-600 text-xs">Ingresos</span>
              </div>
              <p className="text-white font-bold text-xl">{formatearMonto(ingresos)}</p>
              {crecimientoIngresos !== null && (
                <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
                  crecimientoIngresos > 0 ? 'text-emerald-400' : crecimientoIngresos < 0 ? 'text-rose-400' : 'text-zinc-500'
                }`}>
                  {crecimientoIngresos > 0 ? <ArrowUpRight size={11} /> : crecimientoIngresos < 0 ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                  {crecimientoIngresos > 0 ? '+' : ''}{crecimientoIngresos}% vs mes anterior
                </div>
              )}
            </div>

            {/* Expense */}
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <ArrowDownRight size={15} className="text-rose-400" />
                </div>
                <span className="text-zinc-600 text-xs">Gastos</span>
              </div>
              <p className="text-white font-bold text-xl">{formatearMonto(gastos)}</p>
              {cambioGastos !== null && (
                <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
                  cambioGastos < 0 ? 'text-emerald-400' : cambioGastos > 0 ? 'text-rose-400' : 'text-zinc-500'
                }`}>
                  {cambioGastos > 0 ? <ArrowUpRight size={11} /> : cambioGastos < 0 ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                  {cambioGastos > 0 ? '+' : ''}{cambioGastos}% vs mes anterior
                </div>
              )}
            </div>
          </div>
        </div>
        </Reveal>

        {/* ── 3. Stat cards ──────────────────────────────────────────────── */}
        <Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Ahorro neto */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-400 text-xs font-medium">Ahorro neto</p>
              <span className="text-zinc-600 text-xs">{formatearMes(mesRef)}</span>
            </div>
            <p className="text-emerald-400 font-bold text-lg">{formatearMonto(ahorroNeto)}</p>
            {cambioAhorro !== null && (
              <p className={`text-xs mt-1 flex items-center gap-1 font-medium ${cambioAhorro >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {cambioAhorro >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {cambioAhorro >= 0 ? '+' : ''}{cambioAhorro}% vs período ant.
              </p>
            )}
            <p className="text-zinc-600 text-xs mt-0.5">vs {formatearMonto(ahorroNetoPrev)} ant.</p>
          </div>

          {/* Total acumulado */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-400 text-xs font-medium">Total acumulado</p>
              <span className="text-zinc-600 text-xs">Histórico</span>
            </div>
            <p className={`font-bold text-lg ${totalAhorrado >= 0 ? 'text-[#ffd600]' : 'text-rose-400'}`}>
              {formatearMonto(totalAhorrado)}
            </p>
            <p className="text-zinc-600 text-xs mt-1">{pctHaciaMillon}% hacia $1M</p>
            <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pctHaciaMillon}%`, background: '#ffd600' }} />
            </div>
          </div>

          {/* Racha / Actividad — spans full width on 2-col mobile layout */}
          <div className="col-span-2 sm:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-400 text-xs font-medium">Racha activa</p>
              <span className="text-zinc-600 text-xs">{formatearMes(mes)}</span>
            </div>
            <p className="text-[#ffd600] font-bold text-lg">{racha} días</p>
            <p className="text-zinc-600 text-xs mt-1">{tasaAhorro}% tasa de ahorro</p>
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(); d.setDate(d.getDate() - (6 - i))
                const iso = d.toISOString().slice(0, 10)
                const activo = state.diasActivos.some(da => da.fecha === iso)
                  || state.transacciones.some(t => t.fecha === iso)
                return <div key={iso} className={`flex-1 h-1.5 rounded-full ${activo ? 'bg-[#ffd600]' : 'bg-zinc-800'}`} />
              })}
            </div>
          </div>
        </div>
        </Reveal>

        {/* ── 4. Recent Activity + Rank card ─────────────────────────────── */}
        <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Recent activity */}
          <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold text-sm">Actividad reciente</h3>
              <button
                onClick={() => navigate('/transacciones')}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
              >
                Ver todo <ArrowRight size={11} />
              </button>
            </div>

            {recentTx.length === 0 ? (
              <div className="px-5 py-10 text-center text-zinc-600 text-sm">
                Sin transacciones. <button onClick={() => navigate('/transacciones')} className="text-[#ffd600] hover:underline">Agregar una</button>
              </div>
            ) : (
              <div>
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 px-5 py-2.5 border-b border-zinc-800/60">
                  <span className="text-zinc-600 text-[11px] uppercase tracking-wide font-semibold">Detalle</span>
                  <span className="text-zinc-600 text-[11px] uppercase tracking-wide font-semibold">Monto</span>
                  <span className="hidden sm:block text-zinc-600 text-[11px] uppercase tracking-wide font-semibold">Tipo</span>
                  <span className="hidden sm:block text-zinc-600 text-[11px] uppercase tracking-wide font-semibold">Nota</span>
                </div>

                {recentTx.map((tx, i) => (
                  <div
                    key={tx.id}
                    className={`grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 px-5 py-3.5 items-center hover:bg-zinc-800/30 transition-colors ${
                      i < recentTx.length - 1 ? 'border-b border-zinc-800/40' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-zinc-200 text-sm font-medium truncate">{tx.categoria}</p>
                      <p className="text-zinc-600 text-xs mt-0.5">{formatearFecha(tx.fecha)}</p>
                    </div>
                    <span className={`text-sm font-semibold tabular-nums flex-shrink-0 ${tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.tipo === 'ingreso' ? '+' : '-'}{formatearMonto(tx.monto)}
                    </span>
                    <span className="hidden sm:block"><StatusBadge tipo={tx.tipo} /></span>
                    <span className="hidden sm:block text-zinc-500 text-xs">{tx.nota ? tx.nota.slice(0, 12) : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rank / XP card */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-sm">Mi Rango</h3>
              <button
                onClick={() => navigate('/recompensas')}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
              >
                Ver todo <ArrowRight size={11} />
              </button>
            </div>

            {/* Rank card visual */}
            <div
              className="rounded-xl p-4 mb-4 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${rangoInfo.color}18 0%, #09090b 100%)`, border: `1px solid ${rangoInfo.color}30` }}
            >
              <div className="absolute right-3 top-3 text-4xl opacity-20">{rangoInfo.emoji}</div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={13} style={{ color: rangoInfo.color }} />
                <span className="text-xs font-semibold" style={{ color: rangoInfo.color }}>CIMA ÉLITE</span>
              </div>
              <p className="text-white font-bold text-lg">{rangoInfo.rango} {rangoInfo.emoji}</p>
              <p className="text-zinc-500 text-xs mt-1">{formatXP(state.xp.total)} XP · {temporada.nombre}</p>
            </div>

            {/* XP progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-500">Progreso al siguiente rango</span>
                <span style={{ color: rangoInfo.color }}>{Math.round(progreso.porcentaje)}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progreso.porcentaje}%`, background: rangoInfo.color }} />
              </div>
              {progreso.siguiente && (
                <p className="text-zinc-600 text-xs mt-1.5">
                  {formatXP(progreso.xpParaSiguiente!)} XP para {progreso.siguiente.rango} {progreso.siguiente.emoji}
                </p>
              )}
            </div>

            {/* Compact rank ladder */}
            <div className="grid grid-cols-5 gap-1 mt-auto">
              {RANGOS.map(r => {
                const alcanzado = state.xp.total >= r.minXP
                const esCurrent = rangoInfo.rango === r.rango
                return (
                  <div key={r.rango}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-center transition-all ${
                      esCurrent ? 'border' : alcanzado ? 'bg-zinc-800/40' : 'opacity-30'
                    }`}
                    style={esCurrent ? { borderColor: `${r.color}50`, background: `${r.color}10` } : {}}
                  >
                    <span className="text-base">{r.emoji}</span>
                    <span className="text-[9px] font-semibold" style={{ color: esCurrent ? r.color : alcanzado ? '#71717a' : '#3f3f46' }}>
                      {r.rango}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Season XP */}
            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Zap size={12} className="text-[#ffd600]" />
                XP esta temporada
              </div>
              <span className="text-[#ffd600] font-bold text-sm">+{formatXP(xpTemporada)}</span>
            </div>
          </div>
        </div>
        </Reveal>

      </div>
    </AppLayout>
  )
}
