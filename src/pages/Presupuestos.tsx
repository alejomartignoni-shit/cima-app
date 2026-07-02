import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Modal } from '../components/ui/Modal'
import { PieChart, Plus, Pencil, Trash2, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatearMonto, mesActual, formatearMes } from '../utils/formatters'
import { CATEGORIAS_GASTO, type CategoriaGasto, type Presupuesto, type Deuda, type TipoDeuda } from '../types'
import { toast } from 'sonner'

const TIPOS_DEUDA: TipoDeuda[] = ['Préstamo', 'Tarjeta de crédito', 'Hipoteca', 'Otro']

function idNuevo(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Presupuestos helpers ─────────────────────────────────────────────────────

interface FormPresupuesto {
  categoria: CategoriaGasto
  monto: string
  mes: string
}

function formPresVacio(): FormPresupuesto {
  return { categoria: CATEGORIAS_GASTO[0], monto: '', mes: mesActual() }
}

function presupuestoAForm(p: Presupuesto): FormPresupuesto {
  return { categoria: p.categoria, monto: String(p.monto), mes: p.mes }
}

function porcentajeColor(pct: number): string {
  if (pct >= 100) return 'bg-rose-500'
  if (pct >= 80) return 'bg-yellow-500'
  return 'bg-emerald-500'
}

function textoColor(pct: number): string {
  if (pct >= 100) return 'text-rose-400'
  if (pct >= 80) return 'text-yellow-400'
  return 'text-emerald-400'
}

// ─── Deudas helpers ───────────────────────────────────────────────────────────

interface FormDeuda {
  nombre: string
  tipo: TipoDeuda
  montoTotal: string
  montoRestante: string
  tasaInteres: string
  cuotaMensual: string
  fechaVencimiento: string
}

function formDeudaVacio(): FormDeuda {
  return {
    nombre: '',
    tipo: 'Préstamo',
    montoTotal: '',
    montoRestante: '',
    tasaInteres: '',
    cuotaMensual: '',
    fechaVencimiento: '',
  }
}

function deudaAForm(d: Deuda): FormDeuda {
  return {
    nombre: d.nombre,
    tipo: d.tipo,
    montoTotal: String(d.montoTotal),
    montoRestante: String(d.montoRestante),
    tasaInteres: d.tasaInteres != null ? String(d.tasaInteres) : '',
    cuotaMensual: d.cuotaMensual != null ? String(d.cuotaMensual) : '',
    fechaVencimiento: d.fechaVencimiento ?? '',
  }
}

type Tab = 'presupuestos' | 'deudas'

export function Presupuestos() {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState<Tab>('presupuestos')

  // Presupuestos state
  const [modalPres, setModalPres] = useState(false)
  const [editandoPres, setEditandoPres] = useState<Presupuesto | null>(null)
  const [formPres, setFormPres] = useState<FormPresupuesto>(formPresVacio)
  const [mesFiltro, setMesFiltro] = useState(mesActual())

  // Deudas state
  const [modalDeuda, setModalDeuda] = useState(false)
  const [editandoDeuda, setEditandoDeuda] = useState<Deuda | null>(null)
  const [formDeuda, setFormDeuda] = useState<FormDeuda>(formDeudaVacio)

  // ─── Presupuestos logic ───────────────────────────────────────────────────

  const presupuestosMes = state.presupuestos.filter(p => p.mes === mesFiltro)
  const gastosDelMes = state.transacciones.filter(
    t => t.tipo === 'gasto' && t.fecha.startsWith(mesFiltro)
  )

  function gastosPorCategoria(cat: CategoriaGasto): number {
    return gastosDelMes.filter(t => t.categoria === cat).reduce((s, t) => s + t.monto, 0)
  }

  const totalPresupuestado = presupuestosMes.reduce((s, p) => s + p.monto, 0)
  const totalGastado = presupuestosMes.reduce((s, p) => s + gastosPorCategoria(p.categoria), 0)
  const pctTotal = totalPresupuestado > 0 ? Math.round((totalGastado / totalPresupuestado) * 100) : 0

  const mesAnterior = () => {
    const [a, m] = mesFiltro.split('-').map(Number)
    const nuevo = m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, '0')}`
    setMesFiltro(nuevo)
  }

  const mesSiguiente = () => {
    const [a, m] = mesFiltro.split('-').map(Number)
    const nuevo = m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, '0')}`
    setMesFiltro(nuevo)
  }

  function guardarPresupuesto() {
    const monto = parseFloat(formPres.monto.replace(/\./g, '').replace(',', '.'))
    if (!formPres.monto || isNaN(monto) || monto <= 0) {
      toast.error('Ingresá un monto válido')
      return
    }
    const duplicado = state.presupuestos.find(
      p => p.categoria === formPres.categoria && p.mes === formPres.mes && p.id !== editandoPres?.id
    )
    if (duplicado) {
      toast.error(`Ya existe un presupuesto para ${formPres.categoria} en ${formatearMes(formPres.mes)}`)
      return
    }
    const payload: Presupuesto = {
      id: editandoPres?.id ?? idNuevo('pres'),
      categoria: formPres.categoria,
      monto,
      mes: formPres.mes,
    }
    if (editandoPres) {
      dispatch({ type: 'EDIT_PRESUPUESTO', payload })
      toast.success('Presupuesto actualizado')
    } else {
      dispatch({ type: 'ADD_PRESUPUESTO', payload })
      toast.success('Presupuesto creado')
    }
    setModalPres(false)
  }

  function eliminarPresupuesto(p: Presupuesto) {
    if (!confirm(`¿Eliminar presupuesto de ${p.categoria}?`)) return
    dispatch({ type: 'DELETE_PRESUPUESTO', payload: p.id })
    toast.success('Presupuesto eliminado')
  }

  // ─── Deudas logic ─────────────────────────────────────────────────────────

  function guardarDeuda() {
    const montoTotal = parseFloat(formDeuda.montoTotal.replace(/\./g, '').replace(',', '.'))
    const montoRestante = parseFloat(formDeuda.montoRestante.replace(/\./g, '').replace(',', '.'))
    if (!formDeuda.nombre.trim()) {
      toast.error('Ponele un nombre a la deuda')
      return
    }
    if (isNaN(montoTotal) || montoTotal <= 0 || isNaN(montoRestante) || montoRestante < 0) {
      toast.error('Ingresá montos válidos')
      return
    }
    const payload: Deuda = {
      id: editandoDeuda?.id ?? idNuevo('deu'),
      nombre: formDeuda.nombre.trim(),
      tipo: formDeuda.tipo,
      montoTotal,
      montoRestante,
      tasaInteres: formDeuda.tasaInteres ? parseFloat(formDeuda.tasaInteres) : undefined,
      cuotaMensual: formDeuda.cuotaMensual ? parseFloat(formDeuda.cuotaMensual.replace(/\./g, '').replace(',', '.')) : undefined,
      fechaVencimiento: formDeuda.fechaVencimiento || undefined,
    }
    if (editandoDeuda) {
      dispatch({ type: 'EDIT_DEUDA', payload })
      toast.success('Deuda actualizada')
    } else {
      dispatch({ type: 'ADD_DEUDA', payload })
      toast.success('Deuda registrada')
    }
    setModalDeuda(false)
  }

  function eliminarDeuda(d: Deuda) {
    if (!confirm(`¿Eliminar la deuda "${d.nombre}"?`)) return
    dispatch({ type: 'DELETE_DEUDA', payload: d.id })
    toast.success('Deuda eliminada')
  }

  const totalDeuda = state.deudas.reduce((s, d) => s + d.montoRestante, 0)
  const totalOriginal = state.deudas.reduce((s, d) => s + d.montoTotal, 0)
  const pctPagado = totalOriginal > 0 ? Math.round(((totalOriginal - totalDeuda) / totalOriginal) * 100) : 0

  return (
    <AppLayout titulo="Finanzas">
      <div className="space-y-5 animate-fade-in">

        {/* Tab switcher */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setTab('presupuestos')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'presupuestos'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <PieChart size={15} />
            Presupuestos
          </button>
          <button
            onClick={() => setTab('deudas')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'deudas'
                ? 'bg-rose-500/20 text-rose-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <CreditCard size={15} />
            Deudas
            {state.deudas.length > 0 && (
              <span className="bg-rose-500/20 text-rose-400 text-[10px] px-1.5 py-0.5 rounded-full">
                {state.deudas.length}
              </span>
            )}
          </button>
        </div>

        {/* ─── PRESUPUESTOS TAB ─── */}
        {tab === 'presupuestos' && (
          <>
            {/* Month navigator */}
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
              <button
                onClick={mesAnterior}
                className="text-zinc-400 hover:text-zinc-100 px-2 py-1 rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
              >
                ‹ Anterior
              </button>
              <span className="text-white font-medium text-sm capitalize">{formatearMes(mesFiltro)}</span>
              <button
                onClick={mesSiguiente}
                className="text-zinc-400 hover:text-zinc-100 px-2 py-1 rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
              >
                Siguiente ›
              </button>
            </div>

            {/* Summary */}
            {presupuestosMes.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-400 text-sm">Gasto total vs presupuesto</span>
                  <span className={`text-sm font-semibold ${textoColor(pctTotal)}`}>{pctTotal}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${porcentajeColor(pctTotal)}`}
                    style={{ width: `${Math.min(pctTotal, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Gastado: <span className="text-zinc-300">{formatearMonto(totalGastado)}</span></span>
                  <span className="text-zinc-500">Límite: <span className="text-zinc-300">{formatearMonto(totalPresupuestado)}</span></span>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-zinc-300 font-medium text-sm">
                {presupuestosMes.length === 0 ? 'Sin presupuestos' : `${presupuestosMes.length} categoría${presupuestosMes.length !== 1 ? 's' : ''}`}
              </h3>
              <button
                onClick={() => { setFormPres(formPresVacio()); setEditandoPres(null); setModalPres(true) }}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm px-3 py-2 rounded-xl transition-colors active:scale-95"
              >
                <Plus size={16} />
                Agregar
              </button>
            </div>

            {presupuestosMes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <PieChart size={28} className="text-zinc-600" />
                </div>
                <h3 className="text-white font-medium mb-2">Sin presupuestos</h3>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                  Definí límites de gasto por categoría para controlar tus finanzas mes a mes.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {presupuestosMes.map(p => {
                  const gastado = gastosPorCategoria(p.categoria)
                  const pct = Math.round((gastado / p.monto) * 100)
                  const excedido = gastado > p.monto
                  const restante = p.monto - gastado
                  return (
                    <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {excedido
                            ? <AlertTriangle size={14} className="text-rose-400 flex-shrink-0" />
                            : <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                          }
                          <span className="text-white text-sm font-medium">{p.categoria}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${textoColor(pct)}`}>{pct}%</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setFormPres(presupuestoAForm(p)); setEditandoPres(p); setModalPres(true) }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => eliminarPresupuesto(p)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${porcentajeColor(pct)}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Gastado: <span className="text-zinc-300">{formatearMonto(gastado)}</span></span>
                        <span className={excedido ? 'text-rose-400' : 'text-zinc-500'}>
                          {excedido ? `Excedido ${formatearMonto(Math.abs(restante))}` : `Disponible ${formatearMonto(restante)}`}
                        </span>
                        <span className="text-zinc-500">Límite: <span className="text-zinc-300">{formatearMonto(p.monto)}</span></span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ─── DEUDAS TAB ─── */}
        {tab === 'deudas' && (
          <>
            {/* Summary */}
            {state.deudas.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-400 text-sm">Deuda total restante</span>
                  <span className="text-rose-400 font-semibold text-sm">{formatearMonto(totalDeuda)}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${pctPagado}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Pagado: <span className="text-emerald-400">{pctPagado}%</span></span>
                  <span className="text-zinc-500">Original: <span className="text-zinc-300">{formatearMonto(totalOriginal)}</span></span>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-zinc-300 font-medium text-sm">
                {state.deudas.length === 0 ? 'Sin deudas' : `${state.deudas.length} deuda${state.deudas.length !== 1 ? 's' : ''}`}
              </h3>
              <button
                onClick={() => { setFormDeuda(formDeudaVacio()); setEditandoDeuda(null); setModalDeuda(true) }}
                className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-400 text-white font-semibold text-sm px-3 py-2 rounded-xl transition-colors active:scale-95"
              >
                <Plus size={16} />
                Agregar
              </button>
            </div>

            {state.deudas.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={28} className="text-zinc-600" />
                </div>
                <h3 className="text-white font-medium mb-2">Sin deudas registradas</h3>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                  Registrá préstamos, tarjetas de crédito o hipotecas para trackear tu progreso.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {state.deudas.map(d => {
                  const pct = d.montoTotal > 0
                    ? Math.round(((d.montoTotal - d.montoRestante) / d.montoTotal) * 100)
                    : 0
                  return (
                    <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 group">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-white text-sm font-medium">{d.nombre}</p>
                          <p className="text-zinc-500 text-xs mt-0.5">{d.tipo}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-rose-400 font-semibold text-sm">{formatearMonto(d.montoRestante)}</p>
                            <p className="text-zinc-600 text-xs">restante</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setFormDeuda(deudaAForm(d)); setEditandoDeuda(d); setModalDeuda(true) }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => eliminarDeuda(d)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>{pct}% pagado</span>
                        {d.cuotaMensual && <span>Cuota: <span className="text-zinc-300">{formatearMonto(d.cuotaMensual)}/mes</span></span>}
                        {d.tasaInteres && <span>TNA: {d.tasaInteres}%</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal: Presupuesto */}
      <Modal
        abierto={modalPres}
        titulo={editandoPres ? 'Editar presupuesto' : 'Nuevo presupuesto'}
        onCerrar={() => setModalPres(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Categoría de gasto</label>
            <select
              value={formPres.categoria}
              onChange={e => setFormPres(f => ({ ...f, categoria: e.target.value as CategoriaGasto }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              {CATEGORIAS_GASTO.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Límite mensual (ARS)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formPres.monto}
              onChange={e => setFormPres(f => ({ ...f, monto: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-lg font-semibold placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Mes</label>
            <input
              type="month"
              value={formPres.mes}
              onChange={e => setFormPres(f => ({ ...f, mes: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setModalPres(false)}
              className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={guardarPresupuesto}
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-colors"
            >
              {editandoPres ? 'Guardar cambios' : 'Crear presupuesto'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Deuda */}
      <Modal
        abierto={modalDeuda}
        titulo={editandoDeuda ? 'Editar deuda' : 'Nueva deuda'}
        onCerrar={() => setModalDeuda(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Nombre *</label>
            <input
              type="text"
              value={formDeuda.nombre}
              onChange={e => setFormDeuda(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Préstamo banco, Visa..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>

          <div>
            <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Tipo</label>
            <select
              value={formDeuda.tipo}
              onChange={e => setFormDeuda(f => ({ ...f, tipo: e.target.value as TipoDeuda }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
            >
              {TIPOS_DEUDA.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Monto total *</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formDeuda.montoTotal}
                onChange={e => setFormDeuda(f => ({ ...f, montoTotal: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Monto restante *</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formDeuda.montoRestante}
                onChange={e => setFormDeuda(f => ({ ...f, montoRestante: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Cuota mensual</label>
              <input
                type="number"
                min="0"
                placeholder="Opcional"
                value={formDeuda.cuotaMensual}
                onChange={e => setFormDeuda(f => ({ ...f, cuotaMensual: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs font-medium mb-1.5 block">TNA %</label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Opcional"
                value={formDeuda.tasaInteres}
                onChange={e => setFormDeuda(f => ({ ...f, tasaInteres: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setModalDeuda(false)}
              className="flex-1 py-2.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={guardarDeuda}
              className="flex-1 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold transition-colors"
            >
              {editandoDeuda ? 'Guardar' : 'Registrar deuda'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
