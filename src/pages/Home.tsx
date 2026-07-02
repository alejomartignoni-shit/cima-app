import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { TrendingUp, TrendingDown, Wallet, Flame, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatearMonto, mesActual, formatearMes, formatearFecha, porcentaje } from '../utils/formatters'
import { calcularRacha } from '../utils/streakLogic'
import { getRangoInfo, getProgresoRango, getTemporadaActual, getXPTemporada, formatXP } from '../utils/xp'
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
} from 'recharts'
import { format, subMonths, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const COLORES_CATEGORIA = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
  '#f97316', // orange
]

function mesISO(offset: number): string {
  return format(subMonths(new Date(), offset), 'yyyy-MM')
}

function mesCorto(mesIso: string): string {
  return format(parseISO(`${mesIso}-01`), 'MMM', { locale: es })
}

export function Home() {
  const { state } = useApp()
  const navigate = useNavigate()
  const mes = mesActual()
  const racha = calcularRacha(state.diasActivos, state.transacciones)

  const temporada = getTemporadaActual()
  const rangoInfo = getRangoInfo(state.xp.total)
  const progreso = getProgresoRango(state.xp.total)
  const xpTemporada = getXPTemporada(state.xp, temporada)

  // Current month
  const txDelMes = state.transacciones.filter(t => t.fecha.startsWith(mes))
  const ingresos = txDelMes.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const gastos = txDelMes.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const balance = ingresos - gastos

  // Previous month comparison
  const mesPrev = mesISO(1)
  const txMesPrev = state.transacciones.filter(t => t.fecha.startsWith(mesPrev))
  const ingresosPrev = txMesPrev.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const gastosPrev = txMesPrev.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)

  const crecimientoIngresos = ingresosPrev > 0
    ? Math.round(((ingresos - ingresosPrev) / ingresosPrev) * 100)
    : null

  const cambioGastos = gastosPrev > 0
    ? Math.round(((gastos - gastosPrev) / gastosPrev) * 100)
    : null

  // Spending by category (current month)
  const gastosPorCat = txDelMes
    .filter(t => t.tipo === 'gasto')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] ?? 0) + t.monto
      return acc
    }, {})

  const pieData = Object.entries(gastosPorCat)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  // Income by source (current month)
  const ingresosPorCat = txDelMes
    .filter(t => t.tipo === 'ingreso')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] ?? 0) + t.monto
      return acc
    }, {})

  // 6-month bar chart data
  const barData = Array.from({ length: 6 }, (_, i) => {
    const m = mesISO(5 - i)
    const txM = state.transacciones.filter(t => t.fecha.startsWith(m))
    return {
      mes: mesCorto(m),
      Ingresos: txM.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0),
      Gastos: txM.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0),
    }
  })

  const hayDatos = state.transacciones.length > 0

  return (
    <AppLayout titulo="Inicio">
      <div className="space-y-6 animate-fade-in">

        {/* Balance hero */}
        <div>
          <h2 className="text-zinc-400 text-sm font-medium mb-1">Balance de {formatearMes(mes)}</h2>
          <p className={`text-4xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatearMonto(balance)}
          </p>
        </div>

        {/* Rank + Season widget */}
        <button
          onClick={() => navigate('/temporada')}
          className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center gap-4 transition-all text-left active:scale-[0.99]"
        >
          {/* Rank badge */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `${rangoInfo.color}18`, border: `1.5px solid ${rangoInfo.color}40` }}
          >
            {rangoInfo.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm" style={{ color: rangoInfo.color }}>{rangoInfo.rango}</p>
              <p className="text-zinc-500 text-xs">{temporada.emoji} +{formatXP(xpTemporada)} XP</p>
            </div>
            {/* XP bar */}
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progreso.porcentaje}%`,
                  background: rangoInfo.color,
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-zinc-500 text-xs">{formatXP(state.xp.total)} XP total</p>
              {progreso.siguiente && (
                <p className="text-zinc-600 text-xs">
                  {formatXP(progreso.xpParaSiguiente!)} para {progreso.siguiente.rango}
                </p>
              )}
            </div>
          </div>
        </button>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Ingresos */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <span className="text-zinc-400 text-xs">Ingresos</span>
            </div>
            <p className="text-emerald-400 font-semibold">{formatearMonto(ingresos)}</p>
            {crecimientoIngresos !== null && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${
                crecimientoIngresos > 0 ? 'text-emerald-400' : crecimientoIngresos < 0 ? 'text-rose-400' : 'text-zinc-500'
              }`}>
                {crecimientoIngresos > 0 ? <ArrowUpRight size={11} /> : crecimientoIngresos < 0 ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                {crecimientoIngresos > 0 ? '+' : ''}{crecimientoIngresos}% vs mes anterior
              </div>
            )}
          </div>

          {/* Gastos */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-rose-400" />
              <span className="text-zinc-400 text-xs">Gastos</span>
            </div>
            <p className="text-rose-400 font-semibold">{formatearMonto(gastos)}</p>
            {cambioGastos !== null && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${
                cambioGastos < 0 ? 'text-emerald-400' : cambioGastos > 0 ? 'text-rose-400' : 'text-zinc-500'
              }`}>
                {cambioGastos > 0 ? <ArrowUpRight size={11} /> : cambioGastos < 0 ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                {cambioGastos > 0 ? '+' : ''}{cambioGastos}% vs mes anterior
              </div>
            )}
          </div>

          {/* Transactions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-zinc-400" />
              <span className="text-zinc-400 text-xs">Transacciones</span>
            </div>
            <p className="text-white font-semibold">{txDelMes.length}</p>
            <p className="text-zinc-600 text-xs mt-1">este mes</p>
          </div>

          {/* Streak */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-emerald-400" />
              <span className="text-zinc-400 text-xs">Racha</span>
            </div>
            <p className="text-emerald-400 font-semibold">{racha} {racha === 1 ? 'día' : 'días'}</p>
            <p className="text-zinc-600 text-xs mt-1">consecutivos</p>
          </div>
        </div>

        {/* Empty state */}
        {!hayDatos && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Wallet size={28} className="text-zinc-600" />
            </div>
            <h3 className="text-white font-medium mb-2">Sin datos todavía</h3>
            <p className="text-zinc-500 text-sm">
              Cargá datos de ejemplo desde{' '}
              <span className="text-emerald-400">Configuración</span> o agrega una transacción.
            </p>
          </div>
        )}

        {hayDatos && (
          <>
            {/* Business Growth — 6-month bar chart */}
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

            {/* Business Growth — Income sources */}
            {Object.keys(ingresosPorCat).length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-zinc-300 font-medium text-sm mb-4">Fuentes de ingreso — {formatearMes(mes)}</h3>
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
                              style={{
                                width: `${pct}%`,
                                background: COLORES_CATEGORIA[i % COLORES_CATEGORIA.length],
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Spending by category — pie + legend */}
            {pieData.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-zinc-300 font-medium text-sm mb-4">Gastos por categoría — {formatearMes(mes)}</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <PieChart width={160} height={160}>
                      <Pie
                        data={pieData}
                        cx={75}
                        cy={75}
                        innerRadius={45}
                        outerRadius={72}
                        paddingAngle={2}
                        dataKey="value"
                      >
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
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: COLORES_CATEGORIA[i % COLORES_CATEGORIA.length] }}
                          />
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

            {/* Recent transactions */}
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
