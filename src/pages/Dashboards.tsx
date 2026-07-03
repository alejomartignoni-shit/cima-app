import { useState, useRef } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Plus, X, Settings, Trash2, GripVertical, ChevronDown, ChevronUp, LayoutDashboard, Check } from 'lucide-react'
import { useApp } from '../store/AppContext'
import type { Dashboard, Widget, WidgetType } from '../types'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subMonths, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatXP, getRangoInfo } from '../utils/xp'
import { calcularRacha } from '../utils/streakLogic'

function genId() { return `db-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
function wid() { return `w-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

const WIDGET_CATALOG: { type: WidgetType; label: string; descripcion: string; emoji: string }[] = [
  { type: 'kpi_balance',      label: 'Balance del mes',      descripcion: 'Saldo actual del mes corriente',            emoji: '💰' },
  { type: 'kpi_ingresos',     label: 'Ingresos',             descripcion: 'Total de ingresos del mes',                 emoji: '📈' },
  { type: 'kpi_gastos',       label: 'Gastos',               descripcion: 'Total de gastos del mes',                   emoji: '📉' },
  { type: 'kpi_ahorro',       label: 'Tasa de ahorro',       descripcion: 'Porcentaje de ingresos ahorrado',           emoji: '🏦' },
  { type: 'kpi_racha',        label: 'Racha',                descripcion: 'Días consecutivos activos',                 emoji: '🔥' },
  { type: 'kpi_xp',           label: 'XP Total',             descripcion: 'Puntos de experiencia acumulados',          emoji: '⚡' },
  { type: 'kpi_deuda',        label: 'Deuda total',          descripcion: 'Suma de deudas pendientes',                 emoji: '💳' },
  { type: 'kpi_tareas',       label: 'Tareas completadas',   descripcion: 'Progreso general de tareas',                emoji: '✅' },
  { type: 'chart_bar_6meses', label: 'Ingresos vs Gastos',   descripcion: 'Gráfico de barras últimos 6 meses',         emoji: '📊' },
  { type: 'chart_area_ahorro',label: 'Evolución de ahorro',  descripcion: 'Área de ahorro mensual acumulado',          emoji: '📐' },
  { type: 'chart_pie_gastos', label: 'Gastos por categoría', descripcion: 'Torta de distribución de gastos',           emoji: '🥧' },
  { type: 'chart_habits',     label: 'Progreso de hábitos',  descripcion: 'Días completados por hábito (30d)',         emoji: '🎯' },
  { type: 'camino_millon',    label: 'Camino al millón',     descripcion: 'Barra de progreso hacia $1,000,000',        emoji: '🏆' },
  { type: 'recent_tx',        label: 'Últimas transacciones',descripcion: 'Las 5 transacciones más recientes',         emoji: '💸' },
  { type: 'task_progress',    label: 'Progreso de tareas',   descripcion: 'Barra de completado general',               emoji: '📋' },
]

const fmt = (n: number) => n >= 1_000_000
  ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1000
  ? `$${(n / 1000).toFixed(0)}k`
  : `$${n.toLocaleString('es-AR')}`

const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#f43f5e','#06b6d4','#f97316','#84cc16']

function WidgetRenderer({ widget }: { widget: Widget }) {
  const { state } = useApp()

  const mesISO = format(new Date(), 'yyyy-MM')
  const txMes = state.transacciones.filter(t => t.fecha.startsWith(mesISO))
  const ingresos = txMes.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const gastos = txMes.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const balance = ingresos - gastos
  const tasaAhorro = ingresos > 0 ? Math.round(((ingresos - gastos) / ingresos) * 100) : 0
  const racha = calcularRacha(state.diasActivos, state.transacciones)
  const rangoInfo = getRangoInfo(state.xp.total)
  const deudaTotal = state.deudas.reduce((s, d) => s + d.montoRestante, 0)
  const tareasTotal = state.tareas.length
  const tareasComp = state.tareas.filter(t => t.estado === 'Completada').length
  const pctTareas = tareasTotal > 0 ? Math.round((tareasComp / tareasTotal) * 100) : 0

  const title = widget.titulo

  if (widget.type === 'kpi_balance') return (
    <div className="h-full flex flex-col justify-between">
      {title && <p className="text-zinc-500 text-xs mb-1">{title}</p>}
      <p className="text-zinc-400 text-xs mb-auto">Balance del mes</p>
      <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{fmt(balance)}</p>
      <p className="text-zinc-600 text-xs mt-1">{ingresos > 0 ? `${fmt(ingresos)} ingresos · ${fmt(gastos)} gastos` : 'Sin datos'}</p>
    </div>
  )

  if (widget.type === 'kpi_ingresos') return (
    <div className="h-full flex flex-col justify-between">
      <p className="text-zinc-400 text-xs mb-auto">Ingresos del mes</p>
      <p className="text-3xl font-bold text-emerald-400 mt-2">{fmt(ingresos)}</p>
      <p className="text-zinc-600 text-xs mt-1">{txMes.filter(t => t.tipo === 'ingreso').length} transacciones</p>
    </div>
  )

  if (widget.type === 'kpi_gastos') return (
    <div className="h-full flex flex-col justify-between">
      <p className="text-zinc-400 text-xs mb-auto">Gastos del mes</p>
      <p className="text-3xl font-bold text-rose-400 mt-2">{fmt(gastos)}</p>
      <p className="text-zinc-600 text-xs mt-1">{txMes.filter(t => t.tipo === 'gasto').length} transacciones</p>
    </div>
  )

  if (widget.type === 'kpi_ahorro') return (
    <div className="h-full flex flex-col justify-between">
      <p className="text-zinc-400 text-xs mb-auto">Tasa de ahorro</p>
      <p className={`text-3xl font-bold mt-2 ${tasaAhorro >= 20 ? 'text-emerald-400' : tasaAhorro >= 10 ? 'text-amber-400' : 'text-rose-400'}`}>{tasaAhorro}%</p>
      <div className="h-1.5 bg-zinc-800 rounded-full mt-2"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(tasaAhorro, 100)}%` }} /></div>
    </div>
  )

  if (widget.type === 'kpi_racha') return (
    <div className="h-full flex flex-col justify-between">
      <p className="text-zinc-400 text-xs mb-auto">Racha activa</p>
      <p className="text-3xl font-bold text-[#ffd600] mt-2">{racha} 🔥</p>
      <p className="text-zinc-600 text-xs mt-1">{racha === 1 ? 'día' : 'días'} consecutivos</p>
    </div>
  )

  if (widget.type === 'kpi_xp') return (
    <div className="h-full flex flex-col justify-between">
      <p className="text-zinc-400 text-xs mb-auto">XP Total</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-2xl">{rangoInfo.emoji}</span>
        <p className="text-3xl font-bold" style={{ color: rangoInfo.color }}>{formatXP(state.xp.total)}</p>
      </div>
      <p className="text-zinc-600 text-xs mt-1">{rangoInfo.rango}</p>
    </div>
  )

  if (widget.type === 'kpi_deuda') return (
    <div className="h-full flex flex-col justify-between">
      <p className="text-zinc-400 text-xs mb-auto">Deuda total</p>
      <p className="text-3xl font-bold text-amber-400 mt-2">{fmt(deudaTotal)}</p>
      <p className="text-zinc-600 text-xs mt-1">{state.deudas.length} deuda{state.deudas.length !== 1 ? 's' : ''} activa{state.deudas.length !== 1 ? 's' : ''}</p>
    </div>
  )

  if (widget.type === 'kpi_tareas') return (
    <div className="h-full flex flex-col justify-between">
      <p className="text-zinc-400 text-xs mb-auto">Tareas completadas</p>
      <p className="text-3xl font-bold text-emerald-400 mt-2">{pctTareas}%</p>
      <p className="text-zinc-600 text-xs mt-1">{tareasComp}/{tareasTotal} tareas</p>
    </div>
  )

  if (widget.type === 'chart_bar_6meses') {
    const meses = Array.from({ length: 6 }, (_, i) => {
      const m = format(subMonths(new Date(), 5 - i), 'yyyy-MM')
      const label = format(subMonths(new Date(), 5 - i), 'MMM', { locale: es })
      const txs = state.transacciones.filter(t => t.fecha.startsWith(m))
      return { mes: label, Ingresos: txs.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0) / 1000, Gastos: txs.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0) / 1000 }
    })
    return (
      <div className="h-full flex flex-col">
        <p className="text-zinc-400 text-xs mb-2">Ingresos vs Gastos (6 meses, miles $)</p>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={meses} barGap={2}>
              <XAxis dataKey="mes" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="Ingresos" fill="#10b981" radius={[3,3,0,0]} />
              <Bar dataKey="Gastos" fill="#f43f5e" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  if (widget.type === 'chart_area_ahorro') {
    const meses = Array.from({ length: 6 }, (_, i) => {
      const m = format(subMonths(new Date(), 5 - i), 'yyyy-MM')
      const label = format(subMonths(new Date(), 5 - i), 'MMM', { locale: es })
      const txs = state.transacciones.filter(t => t.fecha.startsWith(m))
      const ing = txs.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
      const gas = txs.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
      return { mes: label, Ahorro: Math.round((ing - gas) / 1000) }
    })
    return (
      <div className="h-full flex flex-col">
        <p className="text-zinc-400 text-xs mb-2">Evolución de ahorro (miles $)</p>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={meses}>
              <defs><linearGradient id="ahorroGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="mes" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="Ahorro" stroke="#10b981" strokeWidth={2} fill="url(#ahorroGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  if (widget.type === 'chart_pie_gastos') {
    const bycat: Record<string, number> = {}
    txMes.filter(t => t.tipo === 'gasto').forEach(t => { bycat[t.categoria] = (bycat[t.categoria] ?? 0) + t.monto })
    const data = Object.entries(bycat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6)
    if (data.length === 0) return <div className="h-full flex items-center justify-center text-zinc-600 text-sm">Sin gastos este mes</div>
    return (
      <div className="h-full flex flex-col">
        <p className="text-zinc-400 text-xs mb-2">Gastos por categoría</p>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${(v/1000).toFixed(0)}k`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  if (widget.type === 'chart_habits') {
    const hace30 = subDays(new Date(), 30)
    const data = state.habitos.filter(h => h.activo).map(h => ({
      name: h.nombre.length > 10 ? h.nombre.slice(0, 10) + '…' : h.nombre,
      Días: state.registrosHabito.filter(r => r.habitoId === h.id && new Date(r.fecha) >= hace30).length,
      color: h.color,
    }))
    if (data.length === 0) return <div className="h-full flex items-center justify-center text-zinc-600 text-sm">Sin hábitos activos</div>
    return (
      <div className="h-full flex flex-col">
        <p className="text-zinc-400 text-xs mb-2">Hábitos completados (últimos 30 días)</p>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barSize={10}>
              <XAxis type="number" tick={{ fill: '#71717a', fontSize: 10 }} domain={[0, 30]} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="Días" radius={[0,4,4,0]}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  if (widget.type === 'camino_millon') {
    const meta = 1_000_000
    const pct = Math.min((balance / meta) * 100, 100)
    return (
      <div className="h-full flex flex-col justify-between">
        <p className="text-zinc-400 text-xs">Camino al millón 🏆</p>
        <div className="my-auto">
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: '#ffd600' }} className="font-bold">{fmt(balance)}</span>
            <span className="text-zinc-500">{fmt(meta)}</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #ffd600aa, #ffd600)' }} />
          </div>
          <p className="text-zinc-600 text-xs mt-1.5">{pct.toFixed(1)}% del objetivo</p>
        </div>
      </div>
    )
  }

  if (widget.type === 'recent_tx') {
    const recientes = [...state.transacciones].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5)
    return (
      <div className="h-full flex flex-col">
        <p className="text-zinc-400 text-xs mb-2">Últimas transacciones</p>
        <div className="flex-1 space-y-1.5 overflow-hidden">
          {recientes.length === 0
            ? <p className="text-zinc-600 text-sm">Sin transacciones</p>
            : recientes.map(t => (
              <div key={t.id} className="flex items-center justify-between text-xs">
                <div className="min-w-0 mr-2">
                  <p className="text-zinc-300 truncate">{t.nota ?? t.categoria}</p>
                  <p className="text-zinc-600">{t.fecha}</p>
                </div>
                <span className={`font-semibold flex-shrink-0 ${t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.tipo === 'ingreso' ? '+' : '-'}{fmt(t.monto)}
                </span>
              </div>
            ))}
        </div>
      </div>
    )
  }

  if (widget.type === 'task_progress') {
    const total = state.tareas.length
    const comp = state.tareas.filter(t => t.estado === 'Completada').length
    const enProg = state.tareas.filter(t => t.estado === 'En progreso').length
    const pct = total > 0 ? Math.round((comp / total) * 100) : 0
    return (
      <div className="h-full flex flex-col justify-between">
        <p className="text-zinc-400 text-xs mb-auto">Progreso de tareas</p>
        <div className="my-auto">
          <div className="text-3xl font-bold text-emerald-400 mb-1">{pct}%</div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-zinc-600 text-xs">{comp} completadas · {enProg} en progreso · {total - comp - enProg} restantes</p>
        </div>
      </div>
    )
  }

  return <div className="h-full flex items-center justify-center text-zinc-700 text-xs">Widget no disponible</div>
}

const WIDGET_SIZE: Partial<Record<WidgetType, string>> = {
  chart_bar_6meses: 'col-span-2 row-span-2',
  chart_area_ahorro: 'col-span-2 row-span-2',
  chart_pie_gastos: 'col-span-2 row-span-2',
  chart_habits: 'col-span-2 row-span-2',
  recent_tx: 'col-span-2 row-span-2',
}

function DashboardView({ dashboard, onEdit }: { dashboard: Dashboard; onEdit: () => void }) {
  const { dispatch } = useApp()
  const dragIdRef = useRef<string | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  function handleDragStart(id: string) {
    dragIdRef.current = id
    setDraggingId(id)
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    setOverIdx(idx)
  }

  function handleDrop(targetIdx: number) {
    const fromId = dragIdRef.current
    if (!fromId) return
    const fromIdx = dashboard.widgets.findIndex(w => w.id === fromId)
    if (fromIdx === targetIdx) { dragIdRef.current = null; setDraggingId(null); setOverIdx(null); return }
    const ws = [...dashboard.widgets]
    const [moved] = ws.splice(fromIdx, 1)
    ws.splice(targetIdx, 0, moved)
    dispatch({ type: 'EDIT_DASHBOARD', payload: { ...dashboard, widgets: ws } })
    dragIdRef.current = null
    setDraggingId(null)
    setOverIdx(null)
  }

  function handleDragEnd() {
    dragIdRef.current = null
    setDraggingId(null)
    setOverIdx(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">{dashboard.nombre}</h2>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-sm transition-colors bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg"
        >
          <Settings size={14} />Editar
        </button>
      </div>
      {dashboard.widgets.length === 0 ? (
        <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-zinc-600 mb-2">Dashboard vacío</p>
          <button onClick={onEdit} className="text-sm text-[#ffd600] hover:underline">+ Agregar widgets</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[120px]">
          {dashboard.widgets.map((w, idx) => (
            <div
              key={w.id}
              draggable
              onDragStart={() => handleDragStart(w.id)}
              onDragOver={e => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              className={`bg-zinc-900 border rounded-xl p-4 cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${WIDGET_SIZE[w.type] ?? ''} ${
                draggingId === w.id
                  ? 'opacity-30 scale-95 border-zinc-700'
                  : overIdx === idx && draggingId !== w.id
                  ? 'border-[#ffd600] shadow-[0_0_0_1px_#ffd60030] bg-zinc-800/80'
                  : 'border-zinc-800'
              }`}
            >
              <WidgetRenderer widget={w} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EditModal({ dashboard, onClose, onSave, onDelete }: {
  dashboard: Dashboard; onClose: () => void; onSave: (d: Dashboard) => void; onDelete: (id: string) => void
}) {
  const [nombre, setNombre] = useState(dashboard.nombre)
  const [widgets, setWidgets] = useState<Widget[]>(dashboard.widgets)
  const [showLibrary, setShowLibrary] = useState(false)
  const [draggingWIdx, setDraggingWIdx] = useState<number | null>(null)
  const [overWIdx, setOverWIdx] = useState<number | null>(null)
  const dragWIdxRef = useRef<number | null>(null)

  function addWidget(type: WidgetType) {
    if (widgets.some(w => w.type === type)) return
    setWidgets(ws => [...ws, { id: wid(), type }])
  }
  function removeWidget(id: string) { setWidgets(ws => ws.filter(w => w.id !== id)) }
  function moveUp(i: number) { if (i === 0) return; const ws = [...widgets]; [ws[i-1], ws[i]] = [ws[i], ws[i-1]]; setWidgets(ws) }
  function moveDown(i: number) { if (i === widgets.length - 1) return; const ws = [...widgets]; [ws[i], ws[i+1]] = [ws[i+1], ws[i]]; setWidgets(ws) }

  function handleWDragStart(i: number) { dragWIdxRef.current = i; setDraggingWIdx(i) }
  function handleWDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setOverWIdx(i) }
  function handleWDrop(targetIdx: number) {
    const fromIdx = dragWIdxRef.current
    if (fromIdx === null || fromIdx === targetIdx) { dragWIdxRef.current = null; setDraggingWIdx(null); setOverWIdx(null); return }
    const ws = [...widgets]
    const [moved] = ws.splice(fromIdx, 1)
    ws.splice(targetIdx, 0, moved)
    setWidgets(ws)
    dragWIdxRef.current = null
    setDraggingWIdx(null)
    setOverWIdx(null)
  }
  function handleWDragEnd() { dragWIdxRef.current = null; setDraggingWIdx(null); setOverWIdx(null) }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-white font-semibold">Editar dashboard</h2>
          <button onClick={onClose}><X size={18} className="text-zinc-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="text-zinc-400 text-xs mb-1.5 block">Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ffd600]" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-zinc-400 text-xs">Widgets ({widgets.length}) · arrastrá para reordenar</p>
              <button onClick={() => setShowLibrary(!showLibrary)} className="text-xs text-[#ffd600] hover:underline flex items-center gap-1">
                + Agregar {showLibrary ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>
            {showLibrary && (
              <div className="grid grid-cols-2 gap-1.5 mb-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700">
                {WIDGET_CATALOG.map(w => {
                  const added = widgets.some(aw => aw.type === w.type)
                  return (
                    <button key={w.type} onClick={() => addWidget(w.type)} disabled={added}
                      className={`text-left p-2 rounded-lg text-xs transition-all ${added ? 'opacity-40 cursor-not-allowed bg-zinc-800' : 'hover:bg-zinc-700 bg-zinc-800/50'}`}>
                      <div className="flex items-center gap-1.5">
                        <span>{w.emoji}</span>
                        <span className="text-zinc-200 font-medium">{w.label}</span>
                        {added && <Check size={10} className="text-emerald-400 ml-auto" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            <div className="space-y-1.5">
              {widgets.length === 0
                ? <p className="text-zinc-600 text-sm text-center py-4">Sin widgets. Agregá uno de la biblioteca.</p>
                : widgets.map((w, i) => {
                  const cat = WIDGET_CATALOG.find(c => c.type === w.type)
                  return (
                    <div
                      key={w.id}
                      draggable
                      onDragStart={() => handleWDragStart(i)}
                      onDragOver={e => handleWDragOver(e, i)}
                      onDrop={() => handleWDrop(i)}
                      onDragEnd={handleWDragEnd}
                      className={`flex items-center gap-2 rounded-lg p-2.5 cursor-grab active:cursor-grabbing select-none transition-all border ${
                        draggingWIdx === i
                          ? 'opacity-30 bg-zinc-800 border-zinc-700'
                          : overWIdx === i && draggingWIdx !== i
                          ? 'bg-zinc-700/60 border-[#ffd600]/50'
                          : 'bg-zinc-800 border-transparent'
                      }`}
                    >
                      <GripVertical size={14} className="text-zinc-500 flex-shrink-0" />
                      <span className="text-sm">{cat?.emoji}</span>
                      <span className="text-zinc-200 text-sm flex-1">{cat?.label ?? w.type}</span>
                      <div className="flex gap-1">
                        <button onClick={() => moveUp(i)} className="p-1 rounded hover:bg-zinc-700"><ChevronUp size={12} className="text-zinc-500" /></button>
                        <button onClick={() => moveDown(i)} className="p-1 rounded hover:bg-zinc-700"><ChevronDown size={12} className="text-zinc-500" /></button>
                        <button onClick={() => removeWidget(w.id)} className="p-1 rounded hover:bg-zinc-700 text-rose-400"><X size={12} /></button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-zinc-800 flex items-center justify-between gap-3 flex-shrink-0">
          <button onClick={() => { if (confirm('¿Eliminar este dashboard?')) { onDelete(dashboard.id); onClose() } }}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-sm">
            <Trash2 size={14} />Eliminar
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancelar</button>
            <button onClick={() => { onSave({ ...dashboard, nombre: nombre.trim() || dashboard.nombre, widgets }); onClose() }}
              className="px-4 py-2 bg-[#ffd600] hover:bg-[#ffe033] text-zinc-950 font-semibold text-sm rounded-lg transition-colors">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Dashboards() {
  const { state, dispatch } = useApp()
  const [activoId, setActivoId] = useState<string | null>(() => state.dashboards[0]?.id ?? null)
  const [editando, setEditando] = useState<Dashboard | null>(null)
  const [creando, setCreando] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')

  const activo = state.dashboards.find(d => d.id === activoId) ?? state.dashboards[0] ?? null

  function crear() {
    if (!nuevoNombre.trim()) return
    const d: Dashboard = { id: genId(), nombre: nuevoNombre.trim(), widgets: [], creadoEn: new Date().toISOString().split('T')[0] }
    dispatch({ type: 'ADD_DASHBOARD', payload: d })
    setActivoId(d.id)
    setNuevoNombre('')
    setCreando(false)
    setEditando(d)
  }

  if (state.dashboards.length === 0 && !creando) {
    return (
      <AppLayout titulo="Dashboards">
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <LayoutDashboard size={48} className="text-zinc-700 mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">Sin dashboards</h2>
          <p className="text-zinc-500 text-sm mb-6 max-w-xs">Creá tu primer dashboard personalizado con los widgets que más uses.</p>
          <button onClick={() => setCreando(true)} className="flex items-center gap-2 bg-[#ffd600] hover:bg-[#ffe033] text-zinc-950 font-semibold px-5 py-2.5 rounded-xl transition-colors">
            <Plus size={18} />Crear dashboard
          </button>
        </div>
        {creando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 w-full max-w-sm">
              <h3 className="text-white font-semibold mb-3">Nuevo dashboard</h3>
              <input autoFocus value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} onKeyDown={e => e.key === 'Enter' && crear()}
                placeholder="Nombre del dashboard" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ffd600] mb-3" />
              <div className="flex gap-2">
                <button onClick={() => { setCreando(false); setNuevoNombre('') }} className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm">Cancelar</button>
                <button onClick={crear} disabled={!nuevoNombre.trim()} className="flex-1 py-2 rounded-lg bg-[#ffd600] text-zinc-950 font-semibold text-sm disabled:opacity-40">Crear</button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    )
  }

  return (
    <AppLayout titulo="Dashboards">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1 flex-wrap flex-1 overflow-x-auto">
            {state.dashboards.map(d => (
              <button key={d.id} onClick={() => setActivoId(d.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activoId === d.id ? 'bg-[#ffd600] text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {d.nombre}
              </button>
            ))}
          </div>
          <button onClick={() => setCreando(true)} className="flex-shrink-0 flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-3 py-2 rounded-xl transition-colors">
            <Plus size={15} />Nuevo
          </button>
        </div>

        {activo && <DashboardView dashboard={activo} onEdit={() => setEditando(activo)} />}

        {creando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <h3 className="text-white font-semibold mb-3">Nuevo dashboard</h3>
              <input autoFocus value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} onKeyDown={e => e.key === 'Enter' && crear()}
                placeholder="Nombre del dashboard" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ffd600] mb-3" />
              <div className="flex gap-2">
                <button onClick={() => { setCreando(false); setNuevoNombre('') }} className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm">Cancelar</button>
                <button onClick={crear} disabled={!nuevoNombre.trim()} className="flex-1 py-2 rounded-lg bg-[#ffd600] text-zinc-950 font-semibold text-sm disabled:opacity-40">Crear</button>
              </div>
            </div>
          </div>
        )}

        {editando && (
          <EditModal dashboard={editando} onClose={() => setEditando(null)}
            onSave={d => dispatch({ type: 'EDIT_DASHBOARD', payload: d })}
            onDelete={id => { dispatch({ type: 'DELETE_DASHBOARD', payload: id }); setActivoId(state.dashboards.filter(d => d.id !== id)[0]?.id ?? null) }} />
        )}
      </div>
    </AppLayout>
  )
}
