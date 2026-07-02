import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Plus, Pencil, Trash2, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Modal } from '../components/ui/Modal'
import { hoy, formatearFecha } from '../utils/formatters'
import { isBefore, parseISO, isToday } from 'date-fns'
import { toast } from 'sonner'
import type { Tarea, PrioridadTarea, EstadoTarea, CategoriaTarea } from '../types'
import { CATEGORIAS_TAREA } from '../types'

const PRIORIDADES: PrioridadTarea[] = ['Alta', 'Media', 'Baja', 'Opcional']
const ESTADOS: EstadoTarea[] = ['Sin empezar', 'En progreso', 'Completada', 'Cancelada']

function idNuevo(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

const PRIORIDAD_COLOR: Record<PrioridadTarea, string> = {
  Alta: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  Media: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Baja: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Opcional: 'bg-zinc-700 text-zinc-400 border-zinc-600',
}

const ESTADO_COLOR: Record<EstadoTarea, string> = {
  'Sin empezar': 'text-zinc-500',
  'En progreso': 'text-blue-400',
  'Completada': 'text-emerald-400',
  'Cancelada': 'text-zinc-600 line-through',
}

const ESTADO_ICON: Record<EstadoTarea, typeof Circle> = {
  'Sin empezar': Circle,
  'En progreso': Clock,
  'Completada': CheckCircle2,
  'Cancelada': Circle,
}

type FiltroEstado = 'Todas' | EstadoTarea
type FiltroPrioridad = 'Todas' | PrioridadTarea

interface FormTarea {
  titulo: string
  descripcion: string
  fechaVencimiento: string
  prioridad: PrioridadTarea
  estado: EstadoTarea
  categoria: CategoriaTarea
}

const formVacio = (): FormTarea => ({
  titulo: '',
  descripcion: '',
  fechaVencimiento: '',
  prioridad: 'Media',
  estado: 'Sin empezar',
  categoria: 'Personal',
})

function tareaAForm(t: Tarea): FormTarea {
  return {
    titulo: t.titulo,
    descripcion: t.descripcion ?? '',
    fechaVencimiento: t.fechaVencimiento ?? '',
    prioridad: t.prioridad,
    estado: t.estado,
    categoria: t.categoria,
  }
}

function estaVencida(t: Tarea) {
  if (!t.fechaVencimiento || t.estado === 'Completada' || t.estado === 'Cancelada') return false
  return isBefore(parseISO(t.fechaVencimiento), new Date()) && !isToday(parseISO(t.fechaVencimiento))
}

export function Tareas() {
  const { state, dispatch } = useApp()
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<Tarea | null>(null)
  const [form, setForm] = useState<FormTarea>(formVacio)
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('Todas')
  const [filtroPrioridad, setFiltroPrioridad] = useState<FiltroPrioridad>('Todas')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todas')

  const tareasFiltradas = state.tareas
    .filter(t => filtroEstado === 'Todas' || t.estado === filtroEstado)
    .filter(t => filtroPrioridad === 'Todas' || t.prioridad === filtroPrioridad)
    .filter(t => filtroCategoria === 'Todas' || t.categoria === filtroCategoria)
    .sort((a, b) => {
      // Sort: vencidas first, then by priority, then by date
      const vA = estaVencida(a) ? -1 : 0
      const vB = estaVencida(b) ? -1 : 0
      if (vA !== vB) return vA - vB
      const pOrder: Record<PrioridadTarea, number> = { Alta: 0, Media: 1, Baja: 2, Opcional: 3 }
      return pOrder[a.prioridad] - pOrder[b.prioridad]
    })

  // Stats
  const total = state.tareas.length
  const completadas = state.tareas.filter(t => t.estado === 'Completada').length
  const enProgreso = state.tareas.filter(t => t.estado === 'En progreso').length
  const vencidas = state.tareas.filter(estaVencida).length

  function abrirNuevo() {
    setForm(formVacio())
    setEditando(null)
    setModal(true)
  }

  function abrirEditar(t: Tarea) {
    setForm(tareaAForm(t))
    setEditando(t)
    setModal(true)
  }

  function guardar() {
    if (!form.titulo.trim()) {
      toast.error('Poné un título a la tarea')
      return
    }
    const payload: Tarea = {
      id: editando?.id ?? idNuevo('tar'),
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || undefined,
      fechaVencimiento: form.fechaVencimiento || undefined,
      prioridad: form.prioridad,
      estado: form.estado,
      categoria: form.categoria,
      creadaEn: editando?.creadaEn ?? hoy(),
    }
    if (editando) {
      dispatch({ type: 'EDIT_TAREA', payload })
      toast.success('Tarea actualizada')
    } else {
      dispatch({ type: 'ADD_TAREA', payload })
      toast.success('Tarea creada')
    }
    setModal(false)
  }

  function eliminar(t: Tarea) {
    if (!confirm(`¿Eliminar "${t.titulo}"?`)) return
    dispatch({ type: 'DELETE_TAREA', payload: t.id })
    toast.success('Tarea eliminada')
  }

  function toggleCompletada(t: Tarea) {
    const nuevoEstado: EstadoTarea = t.estado === 'Completada' ? 'Sin empezar' : 'Completada'
    dispatch({ type: 'EDIT_TAREA', payload: { ...t, estado: nuevoEstado } })
  }

  const estadosFiltro: FiltroEstado[] = ['Todas', ...ESTADOS]

  return (
    <AppLayout titulo="Tareas">
      <div className="space-y-5 animate-fade-in">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: total, color: 'text-zinc-100' },
            { label: 'En progreso', value: enProgreso, color: 'text-blue-400' },
            { label: 'Completadas', value: completadas, color: 'text-emerald-400' },
            { label: 'Vencidas', value: vencidas, color: 'text-rose-400' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-zinc-500 text-[10px] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="space-y-2">
          {/* Status tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {estadosFiltro.map(f => (
              <button
                key={f}
                onClick={() => setFiltroEstado(f)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filtroEstado === f
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Priority + category filters */}
          <div className="flex gap-2">
            <select
              value={filtroPrioridad}
              onChange={e => setFiltroPrioridad(e.target.value as FiltroPrioridad)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="Todas">Todas las prioridades</option>
              {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="Todas">Todas las categorías</option>
              {CATEGORIAS_TAREA.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={abrirNuevo}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-zinc-700 hover:border-emerald-500 text-zinc-500 hover:text-emerald-400 rounded-xl py-3 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Agregar tarea
        </button>

        {/* Task list */}
        {tareasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-zinc-500 text-sm">
              {state.tareas.length === 0
                ? 'Sin tareas todavía. ¡Creá la primera!'
                : 'No hay tareas con ese filtro.'}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {tareasFiltradas.map(t => {
            const vencida = estaVencida(t)
            const Icon = ESTADO_ICON[t.estado]
            const iconColor =
              t.estado === 'Completada' ? 'text-emerald-400' :
              t.estado === 'En progreso' ? 'text-blue-400' : 'text-zinc-600'

            return (
              <div
                key={t.id}
                className={`group bg-zinc-900 border rounded-xl p-4 transition-colors ${
                  vencida ? 'border-rose-500/30' : 'border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleCompletada(t)}
                    className={`mt-0.5 flex-shrink-0 ${iconColor} hover:scale-110 transition-transform`}
                  >
                    <Icon size={18} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${ESTADO_COLOR[t.estado]}`}>
                        {t.titulo}
                      </span>
                      {vencida && (
                        <span className="flex items-center gap-1 text-rose-400 text-xs">
                          <AlertCircle size={11} />
                          Vencida
                        </span>
                      )}
                    </div>

                    {t.descripcion && (
                      <p className="text-zinc-500 text-xs mt-0.5 truncate">{t.descripcion}</p>
                    )}

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${PRIORIDAD_COLOR[t.prioridad]}`}>
                        {t.prioridad}
                      </span>
                      <span className="text-zinc-600 text-[10px]">{t.categoria}</span>
                      {t.fechaVencimiento && (
                        <span className={`text-[10px] ${vencida ? 'text-rose-400' : 'text-zinc-500'}`}>
                          📅 {formatearFecha(t.fechaVencimiento)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => abrirEditar(t)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => eliminar(t)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal: Add/Edit task */}
      <Modal
        abierto={modal}
        titulo={editando ? 'Editar tarea' : 'Nueva tarea'}
        onCerrar={() => setModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs mb-1.5">Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="¿Qué hay que hacer?"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs mb-1.5">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Detalles opcionales..."
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">Prioridad</label>
              <select
                value={form.prioridad}
                onChange={e => setForm(f => ({ ...f, prioridad: e.target.value as PrioridadTarea }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
              >
                {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">Estado</label>
              <select
                value={form.estado}
                onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoTarea }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
              >
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">Categoría</label>
              <select
                value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value as CategoriaTarea }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIAS_TAREA.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">Vencimiento</label>
              <input
                type="date"
                value={form.fechaVencimiento}
                onChange={e => setForm(f => ({ ...f, fechaVencimiento: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setModal(false)}
              className="flex-1 py-2.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold transition-colors"
            >
              {editando ? 'Guardar' : 'Crear tarea'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
