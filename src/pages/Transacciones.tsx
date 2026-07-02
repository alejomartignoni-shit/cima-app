import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Modal } from '../components/ui/Modal'
import { ArrowLeftRight, TrendingUp, TrendingDown, Plus, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatearMonto, formatearFecha, hoy } from '../utils/formatters'
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO, type Transaccion, type TipoTransaccion, type Categoria } from '../types'
import { toast } from 'sonner'

interface FormState {
  tipo: TipoTransaccion
  categoria: Categoria
  monto: string
  fecha: string
  nota: string
}

const formVacio = (): FormState => ({
  tipo: 'gasto',
  categoria: CATEGORIAS_GASTO[0],
  monto: '',
  fecha: hoy(),
  nota: '',
})

function txAForm(tx: Transaccion): FormState {
  return {
    tipo: tx.tipo,
    categoria: tx.categoria,
    monto: String(tx.monto),
    fecha: tx.fecha,
    nota: tx.nota ?? '',
  }
}

export function Transacciones() {
  const { state, dispatch } = useApp()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Transaccion | null>(null)
  const [form, setForm] = useState<FormState>(formVacio)
  const [guardando, setGuardando] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoTransaccion>('todos')

  const ordenadas = [...state.transacciones]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .filter(t => filtroTipo === 'todos' || t.tipo === filtroTipo)

  const categoriasActuales = form.tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO

  function abrirNuevo() {
    const nuevo = formVacio()
    setForm(nuevo)
    setEditando(null)
    setModalAbierto(true)
  }

  function abrirEditar(tx: Transaccion) {
    setForm(txAForm(tx))
    setEditando(tx)
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setEditando(null)
  }

  function cambiarTipo(tipo: TipoTransaccion) {
    const cat = tipo === 'ingreso' ? CATEGORIAS_INGRESO[0] : CATEGORIAS_GASTO[0]
    setForm(f => ({ ...f, tipo, categoria: cat }))
  }

  function guardar() {
    const monto = parseFloat(form.monto.replace(/\./g, '').replace(',', '.'))
    if (!form.monto || isNaN(monto) || monto <= 0) {
      toast.error('Ingresá un monto válido')
      return
    }
    if (!form.fecha) {
      toast.error('Seleccioná una fecha')
      return
    }

    setGuardando(true)

    const payload: Transaccion = {
      id: editando?.id ?? `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tipo: form.tipo,
      categoria: form.categoria,
      monto,
      fecha: form.fecha,
      nota: form.nota.trim() || undefined,
    }

    if (editando) {
      dispatch({ type: 'EDIT_TRANSACCION', payload })
      toast.success('Transacción actualizada')
    } else {
      dispatch({ type: 'ADD_TRANSACCION', payload })
      toast.success('Transacción agregada')
    }

    setGuardando(false)
    cerrarModal()
  }

  function eliminar(tx: Transaccion) {
    if (!confirm(`¿Eliminar esta transacción de ${tx.tipo === 'ingreso' ? '+' : '-'}${formatearMonto(tx.monto)}?`)) return
    dispatch({ type: 'DELETE_TRANSACCION', payload: tx.id })
    toast.success('Transacción eliminada')
  }

  return (
    <AppLayout titulo="Transacciones">
      <div className="space-y-4 animate-fade-in">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          {/* Filter tabs */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
            {(['todos', 'ingreso', 'gasto'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltroTipo(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filtroTipo === f
                    ? f === 'ingreso'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : f === 'gasto'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {f === 'todos' ? 'Todos' : f === 'ingreso' ? 'Ingresos' : 'Gastos'}
              </button>
            ))}
          </div>

          <button
            onClick={abrirNuevo}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm px-3 py-2 rounded-xl transition-colors active:scale-95"
          >
            <Plus size={16} />
            Nueva
          </button>
        </div>

        {/* List */}
        {ordenadas.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight size={28} className="text-zinc-600" />
            </div>
            <h3 className="text-white font-medium mb-2">Sin transacciones</h3>
            <p className="text-zinc-500 text-sm">
              Tocá <span className="text-emerald-400">Nueva</span> para agregar tu primera transacción.
            </p>
          </div>
        ) : (
          ordenadas.map(tx => (
            <div
              key={tx.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.tipo === 'ingreso' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                }`}>
                  {tx.tipo === 'ingreso'
                    ? <TrendingUp size={18} className="text-emerald-400" />
                    : <TrendingDown size={18} className="text-rose-400" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{tx.categoria}</p>
                  <p className="text-zinc-500 text-xs mt-0.5 truncate">
                    {formatearFecha(tx.fecha)}
                    {tx.nota && ` · ${tx.nota}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`font-semibold text-sm ${
                  tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {tx.tipo === 'ingreso' ? '+' : '-'}{formatearMonto(tx.monto)}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => abrirEditar(tx)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => eliminar(tx)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        abierto={modalAbierto}
        titulo={editando ? 'Editar transacción' : 'Nueva transacción'}
        onCerrar={cerrarModal}
      >
        <div className="space-y-4">
          {/* Tipo */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {(['ingreso', 'gasto'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => cambiarTipo(t)}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    form.tipo === t
                      ? t === 'ingreso'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-transparent hover:border-zinc-700'
                  }`}
                >
                  {t === 'ingreso' ? '+ Ingreso' : '- Gasto'}
                </button>
              ))}
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Monto (ARS)</label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={form.monto}
              onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-lg font-semibold placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Categoría</label>
            <select
              value={form.categoria}
              onChange={e => setForm(f => ({ ...f, categoria: e.target.value as Categoria }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
            >
              {categoriasActuales.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Fecha</label>
            <input
              type="date"
              value={form.fecha}
              onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Nota */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Nota (opcional)</label>
            <input
              type="text"
              placeholder="Descripción breve..."
              maxLength={80}
              value={form.nota}
              onChange={e => setForm(f => ({ ...f, nota: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={cerrarModal}
              className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-semibold text-sm transition-colors active:scale-95"
            >
              {editando ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
