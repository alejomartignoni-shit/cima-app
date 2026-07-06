import { useMemo, useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Modal } from '../components/ui/Modal'
import { Reveal } from '../components/ui/Reveal'
import { useApp } from '../store/AppContext'
import { formatearMonto, hoy } from '../utils/formatters'
import { TIPOS_INVERSION, TIPOS_ACTIVO, type Inversion, type TipoInversion, type ActivoFinanciero, type TipoActivo } from '../types'
import { playPop, vibrate } from '../utils/sound'
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown, Coins, Building2 } from 'lucide-react'
import { toast } from 'sonner'

const META_TIPO: Record<TipoInversion, { emoji: string; color: string }> = {
  Cripto:        { emoji: '₿',  color: '#fb923c' },
  Acciones:      { emoji: '📈', color: '#38bdf8' },
  CEDEARs:       { emoji: '🌎', color: '#7c5cfc' },
  'Plazo fijo':  { emoji: '🏦', color: '#ffd600' },
  'Fondo común': { emoji: '🧺', color: '#34d399' },
  Dólar:         { emoji: '💵', color: '#4ade80' },
  Otro:          { emoji: '📦', color: '#a1a1aa' },
}

const META_ACTIVO: Record<TipoActivo, string> = {
  'Propiedad en renta': '🏠',
  Vehículo: '🚗',
  Equipamiento: '🎥',
  Negocio: '💼',
  Otro: '📦',
}

const FORM_INICIAL = {
  nombre: '',
  tipo: 'Cripto' as TipoInversion,
  montoInvertido: '',
  valorActual: '',
  nota: '',
}

const FORM_ACTIVO_INICIAL = {
  nombre: '',
  tipo: 'Propiedad en renta' as TipoActivo,
  valor: '',
  ingresoMensual: '',
}

export function Inversiones() {
  const { state, dispatch } = useApp()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Inversion | null>(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [modalActivo, setModalActivo] = useState(false)
  const [formActivo, setFormActivo] = useState(FORM_ACTIVO_INICIAL)

  const totalInvertido = state.inversiones.reduce((s, i) => s + i.montoInvertido, 0)
  const valorTotal = state.inversiones.reduce((s, i) => s + i.valorActual, 0)
  const pnl = valorTotal - totalInvertido
  const pnlPct = totalInvertido > 0 ? (pnl / totalInvertido) * 100 : 0
  const valorActivos = state.activos.reduce((s, a) => s + a.valor, 0)
  const rentaPasiva = state.activos.reduce((s, a) => s + a.ingresoMensual, 0)
  const patrimonio = valorTotal + valorActivos

  const porTipo = useMemo(() => {
    const acc = new Map<TipoInversion, number>()
    for (const i of state.inversiones) {
      acc.set(i.tipo, (acc.get(i.tipo) ?? 0) + i.valorActual)
    }
    return [...acc.entries()].sort((a, b) => b[1] - a[1])
  }, [state.inversiones])

  const ordenadas = [...state.inversiones].sort((a, b) => b.valorActual - a.valorActual)

  function abrirNueva() {
    setEditando(null)
    setForm(FORM_INICIAL)
    playPop()
    setModalAbierto(true)
  }

  function abrirEdicion(inv: Inversion) {
    setEditando(inv)
    setForm({
      nombre: inv.nombre,
      tipo: inv.tipo,
      montoInvertido: String(inv.montoInvertido),
      valorActual: String(inv.valorActual),
      nota: inv.nota ?? '',
    })
    setModalAbierto(true)
  }

  function guardar() {
    const montoInvertido = Number(form.montoInvertido)
    const valorActual = Number(form.valorActual)
    if (!form.nombre.trim()) { toast.error('Poné un nombre a la inversión'); return }
    if (!montoInvertido || montoInvertido <= 0) { toast.error('El monto invertido tiene que ser mayor a 0'); return }
    if (valorActual < 0 || Number.isNaN(valorActual)) { toast.error('El valor actual no puede ser negativo'); return }

    if (editando) {
      dispatch({
        type: 'EDIT_INVERSION',
        payload: {
          ...editando,
          nombre: form.nombre.trim(),
          tipo: form.tipo,
          montoInvertido,
          valorActual,
          nota: form.nota.trim() || undefined,
        },
      })
      toast.success(`${form.nombre.trim()} actualizada`)
    } else {
      dispatch({
        type: 'ADD_INVERSION',
        payload: {
          id: crypto.randomUUID(),
          nombre: form.nombre.trim(),
          tipo: form.tipo,
          montoInvertido,
          valorActual: valorActual || montoInvertido,
          fecha: hoy(),
          nota: form.nota.trim() || undefined,
        },
      })
      toast.success(`${form.nombre.trim()} agregada al portfolio`)
    }
    playPop(); vibrate(10)
    setForm(FORM_INICIAL)
    setEditando(null)
    setModalAbierto(false)
  }

  function eliminar(inv: Inversion) {
    dispatch({ type: 'DELETE_INVERSION', payload: inv.id })
    toast.success(`${inv.nombre} eliminada`)
  }

  function guardarActivo() {
    const valor = Number(formActivo.valor)
    const ingresoMensual = Number(formActivo.ingresoMensual) || 0
    if (!formActivo.nombre.trim()) { toast.error('Poné un nombre al activo'); return }
    if (!valor || valor <= 0) { toast.error('El valor tiene que ser mayor a 0'); return }
    if (ingresoMensual < 0) { toast.error('La renta no puede ser negativa'); return }
    dispatch({
      type: 'ADD_ACTIVO',
      payload: {
        id: crypto.randomUUID(),
        nombre: formActivo.nombre.trim(),
        tipo: formActivo.tipo,
        valor,
        ingresoMensual,
        creadoEn: hoy(),
      },
    })
    playPop(); vibrate(10)
    toast.success(`${formActivo.nombre.trim()} agregado a tus activos`)
    setFormActivo(FORM_ACTIVO_INICIAL)
    setModalActivo(false)
  }

  function eliminarActivo(a: ActivoFinanciero) {
    dispatch({ type: 'DELETE_ACTIVO', payload: a.id })
    toast.success(`${a.nombre} eliminado`)
  }

  return (
    <AppLayout titulo="Inversiones">
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">

        {/* ── Hero portfolio ───────────────────────────────────────────── */}
        <div className="card-hero rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="aurora-bg absolute inset-0 opacity-40 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">
              Patrimonio total
            </p>
            <p className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              {formatearMonto(patrimonio)}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-zinc-300 bg-white/5 border border-white/10">
                {formatearMonto(totalInvertido)} invertidos
              </span>
              {totalInvertido > 0 && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  pnl >= 0
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                }`}>
                  {pnl >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {pnl >= 0 ? '+' : ''}{formatearMonto(pnl)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)
                </span>
              )}
              {rentaPasiva > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-phantom bg-violeta/10 border border-violeta/25">
                  <Building2 size={11} />
                  {formatearMonto(rentaPasiva)}/mes renta pasiva
                </span>
              )}
            </div>

            {/* Distribución por tipo */}
            {porTipo.length > 0 && valorTotal > 0 && (
              <div className="mt-6 pt-4 border-t border-zinc-800/60">
                <div className="flex h-2.5 rounded-full overflow-hidden bg-black/40 mb-3">
                  {porTipo.map(([tipo, valor]) => (
                    <div
                      key={tipo}
                      style={{ width: `${(valor / valorTotal) * 100}%`, background: META_TIPO[tipo].color }}
                      title={`${tipo}: ${formatearMonto(valor)}`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {porTipo.map(([tipo, valor]) => (
                    <span key={tipo} className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <span className="w-2 h-2 rounded-full" style={{ background: META_TIPO[tipo].color }} />
                      {tipo} · {Math.round((valor / valorTotal) * 100)}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Botón agregar ────────────────────────────────────────────── */}
        <button onClick={abrirNueva} className="btn-juicy btn-juicy-gold w-full">
          <Plus size={18} strokeWidth={2.5} /> Agregar inversión
        </button>

        {/* ── Lista ────────────────────────────────────────────────────── */}
        {ordenadas.length === 0 ? (
          <Reveal>
            <div className="glass-card rounded-2xl p-10 text-center">
              <Coins size={32} className="text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm font-semibold mb-1">Todavía no registraste inversiones</p>
              <p className="text-zinc-600 text-xs">
                Cripto, acciones, plazo fijo, dólares. Registrá cada posición y actualizá su valor cuando quieras.
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
              {ordenadas.map(inv => {
                const meta = META_TIPO[inv.tipo]
                const g = inv.valorActual - inv.montoInvertido
                const gPct = inv.montoInvertido > 0 ? (g / inv.montoInvertido) * 100 : 0
                return (
                  <div key={inv.id} className="flex items-center gap-3 px-4 py-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}30` }}
                    >
                      {meta.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-100 text-sm font-semibold truncate">{inv.nombre}</p>
                      <p className="text-zinc-600 text-xs">{inv.tipo} · desde {inv.fecha}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold text-sm tabular-nums">{formatearMonto(inv.valorActual)}</p>
                      <p className={`text-xs font-semibold tabular-nums ${g >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {g >= 0 ? '+' : ''}{gPct.toFixed(1)}%
                      </p>
                    </div>
                    <button
                      onClick={() => abrirEdicion(inv)}
                      title="Actualizar valor"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 transition-colors flex-shrink-0"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => eliminar(inv)}
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

        {/* ── Activos financieros ──────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-4">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <Building2 size={16} className="text-phantom" />
            Activos financieros
          </h2>
          <button
            onClick={() => { playPop(); setModalActivo(true) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-phantom bg-violeta/10 border border-violeta/25 hover:bg-violeta/20 transition-colors"
          >
            <Plus size={13} /> Agregar activo
          </button>
        </div>

        {state.activos.length === 0 ? (
          <Reveal>
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-zinc-400 text-sm font-semibold mb-1">Sin activos registrados</p>
              <p className="text-zinc-600 text-xs">
                Propiedades en renta, vehículos, equipamiento: lo que tenés y lo que te genera por mes.
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
              {[...state.activos].sort((a, b) => b.valor - a.valor).map(a => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-violeta/10 border border-violeta/25">
                    {META_ACTIVO[a.tipo]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 text-sm font-semibold truncate">{a.nombre}</p>
                    <p className="text-zinc-600 text-xs">{a.tipo}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm tabular-nums">{formatearMonto(a.valor)}</p>
                    {a.ingresoMensual > 0 && (
                      <p className="text-emerald-400 text-xs font-semibold tabular-nums">
                        +{formatearMonto(a.ingresoMensual)}/mes
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => eliminarActivo(a)}
                    title="Eliminar"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        <p className="text-zinc-600 text-xs text-center px-4 pb-2">
          Actualizá el valor actual de cada posición con el lápiz. El P&L se calcula solo. 📊
        </p>
      </div>

      {/* ── Modal agregar / editar ─────────────────────────────────────── */}
      <Modal
        abierto={modalAbierto}
        titulo={editando ? 'Actualizar inversión' : 'Nueva inversión'}
        onCerrar={() => { setModalAbierto(false); setEditando(null) }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="BTC, AAPL, Plazo fijo Galicia…"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Tipo</label>
            <select
              value={form.tipo}
              onChange={e => setForm({ ...form, tipo: e.target.value as TipoInversion })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-sm text-zinc-100 focus:outline-none focus:border-gold"
            >
              {TIPOS_INVERSION.map(t => (
                <option key={t} value={t}>{META_TIPO[t].emoji} {t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Invertido (ARS)</label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={form.montoInvertido}
                onChange={e => setForm({ ...form, montoInvertido: e.target.value })}
                placeholder="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Valor actual (ARS)</label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={form.valorActual}
                onChange={e => setForm({ ...form, valorActual: e.target.value })}
                placeholder="= invertido"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold"
              />
            </div>
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Nota (opcional)</label>
            <input
              type="text"
              value={form.nota}
              onChange={e => setForm({ ...form, nota: e.target.value })}
              placeholder="DCA semanal, hold largo plazo…"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold"
            />
          </div>
          <button onClick={guardar} className="btn-juicy btn-juicy-gold w-full">
            {editando ? 'Guardar cambios' : 'Agregar al portfolio'}
          </button>
        </div>
      </Modal>

      {/* ── Modal agregar activo ───────────────────────────────────────── */}
      <Modal abierto={modalActivo} titulo="Nuevo activo financiero" onCerrar={() => setModalActivo(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Nombre</label>
            <input
              type="text"
              value={formActivo.nombre}
              onChange={e => setFormActivo({ ...formActivo, nombre: e.target.value })}
              placeholder="Depto Nueva Córdoba, Cámara Sony…"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violeta"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Tipo</label>
            <select
              value={formActivo.tipo}
              onChange={e => setFormActivo({ ...formActivo, tipo: e.target.value as TipoActivo })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-sm text-zinc-100 focus:outline-none focus:border-violeta"
            >
              {TIPOS_ACTIVO.map(t => (
                <option key={t} value={t}>{META_ACTIVO[t]} {t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Valor (ARS)</label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={formActivo.valor}
                onChange={e => setFormActivo({ ...formActivo, valor: e.target.value })}
                placeholder="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violeta"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Renta mensual</label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={formActivo.ingresoMensual}
                onChange={e => setFormActivo({ ...formActivo, ingresoMensual: e.target.value })}
                placeholder="0 si no genera"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violeta"
              />
            </div>
          </div>
          <button onClick={guardarActivo} className="btn-juicy btn-juicy-violet w-full">
            Agregar activo
          </button>
        </div>
      </Modal>
    </AppLayout>
  )
}
