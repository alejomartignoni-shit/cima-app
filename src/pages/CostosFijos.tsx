import { useMemo, useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Modal } from '../components/ui/Modal'
import { Reveal } from '../components/ui/Reveal'
import { useApp } from '../store/AppContext'
import { formatearMonto, hoy, mesActual } from '../utils/formatters'
import { CATEGORIAS_COSTO_FIJO, type CategoriaCostoFijo, type CostoFijo, type FrecuenciaCosto } from '../types'
import { playPop, vibrate } from '../utils/sound'
import { Plus, Trash2, Receipt, Power, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'

const META_CATEGORIA: Record<CategoriaCostoFijo, { emoji: string; color: string }> = {
  Software:      { emoji: '💻', color: '#38bdf8' },
  Suscripciones: { emoji: '🔁', color: '#7c5cfc' },
  Vivienda:      { emoji: '🏠', color: '#fb923c' },
  Expensas:      { emoji: '🏢', color: '#f472b6' },
  Servicios:     { emoji: '⚡', color: '#ffd600' },
  Transporte:    { emoji: '🚗', color: '#34d399' },
  Otro:          { emoji: '📦', color: '#a1a1aa' },
}

function montoMensual(c: CostoFijo): number {
  return c.frecuencia === 'mensual' ? c.monto : c.monto / 12
}

const FORM_INICIAL = {
  nombre: '',
  categoria: 'Software' as CategoriaCostoFijo,
  monto: '',
  frecuencia: 'mensual' as FrecuenciaCosto,
  nota: '',
}

export function CostosFijos() {
  const { state, dispatch } = useApp()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)

  const activos = state.costosFijos.filter(c => c.activo)
  const totalMensual = activos.reduce((s, c) => s + montoMensual(c), 0)
  const totalAnual = totalMensual * 12

  const ingresosMes = useMemo(() => {
    const mes = mesActual()
    return state.transacciones
      .filter(t => t.tipo === 'ingreso' && t.fecha.startsWith(mes))
      .reduce((s, t) => s + t.monto, 0)
  }, [state.transacciones])

  const pctIngresos = ingresosMes > 0 ? Math.round((totalMensual / ingresosMes) * 100) : null

  const porCategoria = useMemo(() => {
    const acc = new Map<CategoriaCostoFijo, number>()
    for (const c of activos) {
      acc.set(c.categoria, (acc.get(c.categoria) ?? 0) + montoMensual(c))
    }
    return [...acc.entries()].sort((a, b) => b[1] - a[1])
  }, [state.costosFijos])

  const ordenados = [...state.costosFijos].sort((a, b) =>
    Number(b.activo) - Number(a.activo) || montoMensual(b) - montoMensual(a)
  )

  function guardar() {
    const monto = Number(form.monto)
    if (!form.nombre.trim()) { toast.error('Poné un nombre al costo fijo'); return }
    if (!monto || monto <= 0) { toast.error('El monto tiene que ser mayor a 0'); return }
    dispatch({
      type: 'ADD_COSTO_FIJO',
      payload: {
        id: crypto.randomUUID(),
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        monto,
        frecuencia: form.frecuencia,
        activo: true,
        creadoEn: hoy(),
        nota: form.nota.trim() || undefined,
      },
    })
    playPop(); vibrate(10)
    toast.success(`${form.nombre.trim()} agregado a tus costos fijos`)
    setForm(FORM_INICIAL)
    setModalAbierto(false)
  }

  function toggleActivo(c: CostoFijo) {
    dispatch({ type: 'EDIT_COSTO_FIJO', payload: { ...c, activo: !c.activo } })
    vibrate(8)
  }

  function eliminar(c: CostoFijo) {
    dispatch({ type: 'DELETE_COSTO_FIJO', payload: c.id })
    toast.success(`${c.nombre} eliminado`)
  }

  return (
    <AppLayout titulo="Costos Fijos">
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">

        {/* ── Hero resumen ─────────────────────────────────────────────── */}
        <div className="card-hero rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="aurora-bg absolute inset-0 opacity-40 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">
              Costo fijo mensual
            </p>
            <p className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              {formatearMonto(totalMensual)}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-phantom bg-violeta/10 border border-violeta/25">
                {formatearMonto(totalAnual)} /año
              </span>
              {pctIngresos !== null && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  pctIngresos > 50
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  <TrendingDown size={11} />
                  {pctIngresos}% de tus ingresos del mes
                </span>
              )}
            </div>

            {/* Desglose por categoría */}
            {porCategoria.length > 0 && (
              <div className="mt-6 pt-4 border-t border-zinc-800/60 space-y-2.5">
                {porCategoria.map(([cat, monto]) => {
                  const meta = META_CATEGORIA[cat]
                  const pct = totalMensual > 0 ? (monto / totalMensual) * 100 : 0
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-base w-6 text-center">{meta.emoji}</span>
                      <span className="text-zinc-300 text-xs font-semibold w-28 truncate">{cat}</span>
                      <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: meta.color }} />
                      </div>
                      <span className="text-zinc-400 text-xs font-bold tabular-nums w-24 text-right">
                        {formatearMonto(monto)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Botón agregar ────────────────────────────────────────────── */}
        <button
          onClick={() => { playPop(); setModalAbierto(true) }}
          className="btn-juicy btn-juicy-violet w-full"
        >
          <Plus size={18} strokeWidth={2.5} /> Agregar costo fijo
        </button>

        {/* ── Lista ────────────────────────────────────────────────────── */}
        {ordenados.length === 0 ? (
          <Reveal>
            <div className="glass-card rounded-2xl p-10 text-center">
              <Receipt size={32} className="text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm font-semibold mb-1">Sin costos fijos registrados</p>
              <p className="text-zinc-600 text-xs">
                Suscripciones de software, alquiler, servicios: todo lo que se cobra solo, todos los meses.
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
              {ordenados.map(c => {
                const meta = META_CATEGORIA[c.categoria]
                return (
                  <div key={c.id} className={`flex items-center gap-3 px-4 py-3.5 transition-opacity ${c.activo ? '' : 'opacity-45'}`}>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}30` }}
                    >
                      {meta.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-100 text-sm font-semibold truncate">{c.nombre}</p>
                      <p className="text-zinc-600 text-xs">
                        {c.categoria} · {c.frecuencia === 'mensual' ? 'mensual' : `anual (${formatearMonto(montoMensual(c))}/mes)`}
                      </p>
                    </div>
                    <span className="text-white font-bold text-sm tabular-nums flex-shrink-0">
                      {formatearMonto(c.monto)}
                    </span>
                    <button
                      onClick={() => toggleActivo(c)}
                      title={c.activo ? 'Pausar' : 'Reactivar'}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                        c.activo ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-zinc-600 hover:bg-zinc-800'
                      }`}
                    >
                      <Power size={15} />
                    </button>
                    <button
                      onClick={() => eliminar(c)}
                      title="Eliminar"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          </Reveal>
        )}

        <p className="text-zinc-600 text-xs text-center px-4 pb-2">
          Los costos pausados no suman al total mensual. Revisá esta lista cada mes: acá se esconde la plata que se va sola. 🔍
        </p>
      </div>

      {/* ── Modal agregar ──────────────────────────────────────────────── */}
      <Modal abierto={modalAbierto} titulo="Nuevo costo fijo" onCerrar={() => setModalAbierto(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Netflix, Alquiler, Claude Pro…"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violeta"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Categoría</label>
              <select
                value={form.categoria}
                onChange={e => setForm({ ...form, categoria: e.target.value as CategoriaCostoFijo })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-sm text-zinc-100 focus:outline-none focus:border-violeta"
              >
                {CATEGORIAS_COSTO_FIJO.map(c => (
                  <option key={c} value={c}>{META_CATEGORIA[c].emoji} {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Frecuencia</label>
              <select
                value={form.frecuencia}
                onChange={e => setForm({ ...form, frecuencia: e.target.value as FrecuenciaCosto })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-sm text-zinc-100 focus:outline-none focus:border-violeta"
              >
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Monto (ARS)</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={form.monto}
              onChange={e => setForm({ ...form, monto: e.target.value })}
              placeholder="0"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violeta"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Nota (opcional)</label>
            <input
              type="text"
              value={form.nota}
              onChange={e => setForm({ ...form, nota: e.target.value })}
              placeholder="Plan anual con descuento…"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violeta"
            />
          </div>
          <button onClick={guardar} className="btn-juicy btn-juicy-violet w-full">
            Guardar costo fijo
          </button>
        </div>
      </Modal>
    </AppLayout>
  )
}
