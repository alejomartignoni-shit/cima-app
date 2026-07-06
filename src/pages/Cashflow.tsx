import { useMemo, useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Reveal } from '../components/ui/Reveal'
import { useApp } from '../store/AppContext'
import { formatearMonto } from '../utils/formatters'
import { ArrowUpRight, ArrowDownRight, Waves, Building2 } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { format, subDays, subWeeks, subMonths, startOfWeek, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

type Periodo = 'diario' | 'semanal' | 'mensual'

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: 'diario', label: 'Diario' },
  { id: 'semanal', label: 'Semanal' },
  { id: 'mensual', label: 'Mensual' },
]

interface Bucket {
  label: string
  Ingresos: number
  Gastos: number
}

export function Cashflow() {
  const { state } = useApp()
  const [periodo, setPeriodo] = useState<Periodo>('mensual')

  const buckets = useMemo<Bucket[]>(() => {
    const tx = state.transacciones
    const sum = (desde: string, hasta: string, tipo: 'ingreso' | 'gasto') =>
      tx.filter(t => t.tipo === tipo && t.fecha >= desde && t.fecha < hasta)
        .reduce((s, t) => s + t.monto, 0)

    if (periodo === 'diario') {
      return Array.from({ length: 14 }, (_, i) => {
        const d = subDays(new Date(), 13 - i)
        const iso = format(d, 'yyyy-MM-dd')
        const next = format(addDays(d, 1), 'yyyy-MM-dd')
        return {
          label: format(d, 'd MMM', { locale: es }),
          Ingresos: sum(iso, next, 'ingreso'),
          Gastos: sum(iso, next, 'gasto'),
        }
      })
    }
    if (periodo === 'semanal') {
      return Array.from({ length: 8 }, (_, i) => {
        const inicio = startOfWeek(subWeeks(new Date(), 7 - i), { weekStartsOn: 1 })
        const desde = format(inicio, 'yyyy-MM-dd')
        const hasta = format(addDays(inicio, 7), 'yyyy-MM-dd')
        return {
          label: format(inicio, 'd/M'),
          Ingresos: sum(desde, hasta, 'ingreso'),
          Gastos: sum(desde, hasta, 'gasto'),
        }
      })
    }
    return Array.from({ length: 8 }, (_, i) => {
      const d = subMonths(new Date(), 7 - i)
      const desde = format(d, 'yyyy-MM') + '-01'
      const hasta = format(subMonths(d, -1), 'yyyy-MM') + '-01'
      return {
        label: format(d, 'MMM', { locale: es }),
        Ingresos: sum(desde, hasta, 'ingreso'),
        Gastos: sum(desde, hasta, 'gasto'),
      }
    })
  }, [state.transacciones, periodo])

  const totalIn = buckets.reduce((s, b) => s + b.Ingresos, 0)
  const totalOut = buckets.reduce((s, b) => s + b.Gastos, 0)
  const neto = totalIn - totalOut
  const conMovimiento = buckets.filter(b => b.Ingresos > 0 || b.Gastos > 0).length
  const promedioNeto = conMovimiento > 0 ? neto / conMovimiento : 0

  const rentaPasiva = state.activos.reduce((s, a) => s + a.ingresoMensual, 0)

  const unidad = periodo === 'diario' ? 'día' : periodo === 'semanal' ? 'semana' : 'mes'
  const rango = periodo === 'diario' ? 'últimos 14 días' : periodo === 'semanal' ? 'últimas 8 semanas' : 'últimos 8 meses'

  const fmtCompact = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v))

  return (
    <AppLayout titulo="Cashflow">
      <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">

        {/* ── Selector de periodo ──────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
          {PERIODOS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                periodo === p.id
                  ? 'bg-[#ffd600] text-zinc-950 shadow-md shadow-[#ffd600]/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Resumen ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight size={14} className="text-emerald-400" />
              <span className="text-zinc-500 text-xs font-medium">Entró</span>
            </div>
            <p className="text-emerald-400 font-bold text-lg tabular-nums">{formatearMonto(totalIn)}</p>
            <p className="text-zinc-600 text-[11px] mt-0.5">{rango}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight size={14} className="text-rose-400" />
              <span className="text-zinc-500 text-xs font-medium">Salió</span>
            </div>
            <p className="text-rose-400 font-bold text-lg tabular-nums">{formatearMonto(totalOut)}</p>
            <p className="text-zinc-600 text-[11px] mt-0.5">{rango}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Waves size={14} className="text-[#ffd600]" />
              <span className="text-zinc-500 text-xs font-medium">Flujo neto</span>
            </div>
            <p className={`font-bold text-lg tabular-nums ${neto >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {neto >= 0 ? '+' : ''}{formatearMonto(neto)}
            </p>
            <p className="text-zinc-600 text-[11px] mt-0.5">
              {promedioNeto >= 0 ? '+' : ''}{formatearMonto(promedioNeto)} promedio/{unidad}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={14} className="text-phantom" />
              <span className="text-zinc-500 text-xs font-medium">Renta pasiva</span>
            </div>
            <p className="text-phantom font-bold text-lg tabular-nums">{formatearMonto(rentaPasiva)}</p>
            <p className="text-zinc-600 text-[11px] mt-0.5">/mes de tus activos</p>
          </div>
        </div>

        {/* ── Chart ────────────────────────────────────────────────────── */}
        <Reveal>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-sm capitalize">Cashflow {periodo}</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-zinc-500 text-xs">Ingresos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-rose-500/70" />
                  <span className="text-zinc-500 text-xs">Gastos</span>
                </div>
              </div>
            </div>
            {totalIn === 0 && totalOut === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-zinc-600 text-sm">
                Sin movimientos en este período
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={buckets} barCategoryGap="30%" barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#52525b', fontSize: 10 }}
                    axisLine={false} tickLine={false} width={40}
                    tickFormatter={fmtCompact}
                  />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: 12 }}
                    labelStyle={{ color: '#a1a1aa' }}
                    formatter={(v: number) => [formatearMonto(v), '']}
                  />
                  <Bar dataKey="Ingresos" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Gastos" fill="#be5468" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Reveal>

        <p className="text-zinc-600 text-xs text-center px-4 pb-2">
          El cashflow personal sale de tus transacciones. Las finanzas de tus negocios viven aparte, en su propio espacio. 💼
        </p>
      </div>
    </AppLayout>
  )
}
