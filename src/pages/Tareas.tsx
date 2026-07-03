import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Plus, X, Calendar, LayoutGrid, List, Tag, ChevronLeft, ChevronRight, GripVertical, Trash2, Check } from 'lucide-react'
import { useApp } from '../store/AppContext'
import type { Tarea, EstadoTarea, PrioridadTarea, CategoriaTarea } from '../types'
import { CATEGORIAS_TAREA } from '../types'
import { hoy } from '../utils/formatters'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

const ESTADOS: EstadoTarea[] = ['Sin empezar', 'En progreso', 'Completada', 'Cancelada']
const PRIORIDADES: PrioridadTarea[] = ['Alta', 'Media', 'Baja', 'Opcional']

const ESTADO_COLOR: Record<EstadoTarea, string> = {
  'Sin empezar': '#71717a',
  'En progreso': '#3b82f6',
  'Completada': '#10b981',
  'Cancelada': '#f43f5e',
}
const ESTADO_BG: Record<EstadoTarea, string> = {
  'Sin empezar': '#71717a18',
  'En progreso': '#3b82f618',
  'Completada': '#10b98118',
  'Cancelada': '#f43f5e18',
}
const PRIORIDAD_COLOR: Record<PrioridadTarea, string> = {
  Alta: '#f43f5e',
  Media: '#f59e0b',
  Baja: '#3b82f6',
  Opcional: '#71717a',
}

function genId() { return `tarea-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

function TareaCard({ tarea, onEdit, onDelete, onEstado, draggable = false, onDragStart, compact = false }: {
  tarea: Tarea; onEdit: (t: Tarea) => void; onDelete: (id: string) => void
  onEstado: (id: string, e: EstadoTarea) => void; draggable?: boolean
  onDragStart?: (e: React.DragEvent, id: string) => void; compact?: boolean
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart ? e => onDragStart(e, tarea.id) : undefined}
      className={`bg-zinc-900 border border-zinc-800 rounded-xl ${compact ? 'p-3' : 'p-4'} group cursor-pointer hover:border-zinc-700 transition-all`}
      onClick={() => onEdit(tarea)}
    >
      <div className="flex items-start gap-2">
        {draggable && <GripVertical size={14} className="text-zinc-700 flex-shrink-0 mt-0.5 cursor-grab" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORIDAD_COLOR[tarea.prioridad] }} />
            <span className={`font-medium text-sm leading-tight ${tarea.estado === 'Completada' ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
              {tarea.titulo}
            </span>
          </div>
          {!compact && tarea.descripcion && (
            <p className="text-zinc-500 text-xs mb-2 leading-relaxed">{tarea.descripcion}</p>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: ESTADO_BG[tarea.estado], color: ESTADO_COLOR[tarea.estado] }}>
              {tarea.estado}
            </span>
            <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">{tarea.categoria}</span>
            {tarea.fechaVencimiento && (
              <span className="text-[10px] text-zinc-500">📅 {tarea.fechaVencimiento}</span>
            )}
            {tarea.tags?.map(tag => (
              <span key={tag} className="text-[10px] text-[#ffd600] bg-[#ffd60012] px-1.5 py-0.5 rounded border border-[#ffd60030]">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={e => e.stopPropagation()}>
          {tarea.estado !== 'Completada' && (
            <button className="p-1 rounded hover:bg-emerald-500/10 text-emerald-500 transition-colors"
              onClick={() => onEstado(tarea.id, 'Completada')} title="Completar">
              <Check size={13} />
            </button>
          )}
          <button className="p-1 rounded hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 transition-colors"
            onClick={() => onDelete(tarea.id)} title="Eliminar">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

interface FormState {
  titulo: string; descripcion: string; prioridad: PrioridadTarea; estado: EstadoTarea
  categoria: CategoriaTarea; fechaVencimiento: string; tagInput: string; tags: string[]
}

function TareaModal({ tarea, onClose, onSave, onDelete }: {
  tarea?: Tarea; onClose: () => void
  onSave: (data: Omit<Tarea, 'id' | 'creadaEn'>) => void
  onDelete?: (id: string) => void
}) {
  const [form, setForm] = useState<FormState>(() =>
    tarea
      ? { titulo: tarea.titulo, descripcion: tarea.descripcion ?? '', prioridad: tarea.prioridad, estado: tarea.estado, categoria: tarea.categoria, fechaVencimiento: tarea.fechaVencimiento ?? '', tagInput: '', tags: tarea.tags ?? [] }
      : { titulo: '', descripcion: '', prioridad: 'Media', estado: 'Sin empezar', categoria: 'Trabajo', fechaVencimiento: '', tagInput: '', tags: [] }
  )

  function addTag() {
    const t = form.tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t], tagInput: '' }))
    else setForm(f => ({ ...f, tagInput: '' }))
  }

  function handleSave() {
    if (!form.titulo.trim()) return
    onSave({ titulo: form.titulo.trim(), descripcion: form.descripcion.trim() || undefined, prioridad: form.prioridad, estado: form.estado, categoria: form.categoria, fechaVencimiento: form.fechaVencimiento || undefined, tags: form.tags.length > 0 ? form.tags : undefined })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-white font-semibold">{tarea ? 'Editar tarea' : 'Nueva tarea'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800"><X size={18} className="text-zinc-400" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-zinc-400 text-xs mb-1.5 block">Título *</label>
            <input autoFocus value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="¿Qué hay que hacer?" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ffd600]" />
          </div>
          <div>
            <label className="text-zinc-400 text-xs mb-1.5 block">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Detalles, contexto, notas..." rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ffd600] resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1.5 block">Prioridad</label>
              <select value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value as PrioridadTarea }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ffd600]">
                {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1.5 block">Estado</label>
              <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoTarea }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ffd600]">
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1.5 block">Categoría</label>
              <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value as CategoriaTarea }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ffd600]">
                {CATEGORIAS_TAREA.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1.5 block">Vencimiento</label>
              <input type="date" value={form.fechaVencimiento} onChange={e => setForm(f => ({ ...f, fechaVencimiento: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ffd600]" />
            </div>
          </div>
          <div>
            <label className="text-zinc-400 text-xs mb-1.5 flex items-center gap-1 block"><Tag size={11} />Tags</label>
            <div className="flex gap-2 mb-2">
              <input value={form.tagInput} onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
                placeholder="Escribe y presiona Enter" className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ffd600]" />
              <button onClick={addTag} className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-white transition-colors">+</button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs text-[#ffd600] bg-[#ffd60012] border border-[#ffd60030] px-2 py-0.5 rounded-full">
                    #{tag}<button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))}><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="p-5 border-t border-zinc-800 flex items-center justify-between gap-3">
          {tarea && onDelete
            ? <button onClick={() => { onDelete(tarea.id); onClose() }} className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-sm transition-colors"><Trash2 size={14} />Eliminar</button>
            : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancelar</button>
            <button onClick={handleSave} disabled={!form.titulo.trim()}
              className="px-4 py-2 bg-[#ffd600] hover:bg-[#ffe033] text-zinc-950 font-semibold text-sm rounded-lg transition-colors disabled:opacity-40">
              {tarea ? 'Guardar' : 'Crear tarea'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function KanbanView({ tareas, onEdit, onDelete, onEstado }: {
  tareas: Tarea[]; onEdit: (t: Tarea) => void; onDelete: (id: string) => void; onEstado: (id: string, e: EstadoTarea) => void
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<EstadoTarea | null>(null)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {ESTADOS.map(estado => {
        const col = tareas.filter(t => t.estado === estado)
        const isOver = overCol === estado
        return (
          <div key={estado}
            className={`rounded-xl border transition-all min-h-[200px] ${isOver ? 'border-[#ffd600]/50 bg-[#ffd60008]' : 'border-zinc-800 bg-zinc-900/40'}`}
            onDragOver={e => { e.preventDefault(); setOverCol(estado) }}
            onDragLeave={() => setOverCol(null)}
            onDrop={e => { e.preventDefault(); if (draggingId) onEstado(draggingId, estado); setDraggingId(null); setOverCol(null) }}>
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: ESTADO_COLOR[estado] }} />
                <span className="text-xs font-semibold text-zinc-300">{estado}</span>
              </div>
              <span className="text-[10px] font-medium text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full">{col.length}</span>
            </div>
            <div className="p-2 space-y-2">
              {col.map(t => (
                <div key={t.id} className={draggingId === t.id ? 'opacity-30' : 'opacity-100'}>
                  <TareaCard tarea={t} onEdit={onEdit} onDelete={onDelete} onEstado={onEstado} draggable
                    onDragStart={(e, id) => { setDraggingId(id); e.dataTransfer.effectAllowed = 'move' }}
                    compact />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CalendarView({ tareas, onEdit, onDelete, onEstado }: {
  tareas: Tarea[]; onEdit: (t: Tarea) => void; onDelete: (id: string) => void; onEstado: (id: string, e: EstadoTarea) => void
}) {
  const [mes, setMes] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const inicio = startOfMonth(mes)
  const fin = endOfMonth(mes)
  const dias = eachDayOfInterval({ start: inicio, end: fin })
  const firstDow = (getDay(inicio) + 6) % 7

  function tareasDelDia(d: Date) {
    const str = format(d, 'yyyy-MM-dd')
    return tareas.filter(t => t.fechaVencimiento === str)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setMes(m => subMonths(m, 1))} className="p-2 rounded-lg hover:bg-zinc-800"><ChevronLeft size={18} className="text-zinc-400" /></button>
        <h3 className="text-white font-semibold capitalize">{format(mes, 'MMMM yyyy', { locale: es })}</h3>
        <button onClick={() => setMes(m => addMonths(m, 1))} className="p-2 rounded-lg hover:bg-zinc-800"><ChevronRight size={18} className="text-zinc-400" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['L','M','X','J','V','S','D'].map(d => <div key={d} className="text-zinc-600 text-xs font-semibold py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
        {dias.map(dia => {
          const ts = tareasDelDia(dia)
          const sel = selectedDay ? isSameDay(dia, selectedDay) : false
          return (
            <button key={dia.toISOString()} onClick={() => setSelectedDay(sel ? null : dia)}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all
                ${sel ? 'bg-[#ffd600] text-zinc-950' : isToday(dia) ? 'bg-zinc-800 text-[#ffd600]' : 'hover:bg-zinc-800 text-zinc-300'}`}>
              {format(dia, 'd')}
              {ts.length > 0 && (
                <div className="absolute bottom-0.5 flex gap-0.5">
                  {ts.slice(0, 3).map((t, i) => (
                    <div key={i} className="w-1 h-1 rounded-full" style={{ background: sel ? '#09090b' : PRIORIDAD_COLOR[t.prioridad] }} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
      {selectedDay && (
        <div className="border-t border-zinc-800 pt-4 space-y-2">
          <h4 className="text-zinc-400 text-xs">{format(selectedDay, "d 'de' MMMM", { locale: es })}</h4>
          {tareasDelDia(selectedDay).length === 0
            ? <p className="text-zinc-600 text-sm">Sin tareas con vencimiento este día</p>
            : tareasDelDia(selectedDay).map(t => (
                <TareaCard key={t.id} tarea={t} onEdit={onEdit} onDelete={onDelete} onEstado={onEstado} />
              ))}
        </div>
      )}
    </div>
  )
}

type TabView = 'lista' | 'kanban' | 'calendario'

export function Tareas() {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState<TabView>('lista')
  const [modal, setModal] = useState<{ open: boolean; tarea?: Tarea }>({ open: false })
  const [filtroEstado, setFiltroEstado] = useState<EstadoTarea | 'Todos'>('Todos')
  const [filtroTag, setFiltroTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(state.tareas.flatMap(t => t.tags ?? [])))

  const tareasFiltradas = state.tareas.filter(t => {
    if (filtroEstado !== 'Todos' && t.estado !== filtroEstado) return false
    if (filtroTag && !t.tags?.includes(filtroTag)) return false
    return true
  })

  function handleSave(data: Omit<Tarea, 'id' | 'creadaEn'>) {
    if (modal.tarea) {
      dispatch({ type: 'EDIT_TAREA', payload: { ...modal.tarea, ...data } })
    } else {
      dispatch({ type: 'ADD_TAREA', payload: { id: genId(), creadaEn: hoy(), ...data } })
    }
    setModal({ open: false })
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_TAREA', payload: id })
    setModal({ open: false })
  }

  function handleEstado(id: string, estado: EstadoTarea) {
    const t = state.tareas.find(t => t.id === id)
    if (t) dispatch({ type: 'EDIT_TAREA', payload: { ...t, estado } })
  }

  const stats = {
    total: state.tareas.length,
    completadas: state.tareas.filter(t => t.estado === 'Completada').length,
    enProgreso: state.tareas.filter(t => t.estado === 'En progreso').length,
    pendientes: state.tareas.filter(t => t.estado === 'Sin empezar').length,
  }

  return (
    <AppLayout titulo="Tareas">
      <div className="space-y-4 max-w-6xl animate-fade-in">
        <div className="grid grid-cols-4 gap-2">
          {[{ label: 'Total', v: stats.total, c: '#a1a1aa' }, { label: 'En progreso', v: stats.enProgreso, c: '#3b82f6' }, { label: 'Completadas', v: stats.completadas, c: '#10b981' }, { label: 'Pendientes', v: stats.pendientes, c: '#71717a' }].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <p className="font-bold text-xl" style={{ color: s.c }}>{s.v}</p>
              <p className="text-zinc-600 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {stats.total > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-500">Progreso general</span>
              <span className="text-zinc-300 font-semibold">{Math.round((stats.completadas / stats.total) * 100)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                style={{ width: `${(stats.completadas / stats.total) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
            {([['lista', 'Lista', List], ['kanban', 'Kanban', LayoutGrid], ['calendario', 'Calendario', Calendar]] as const).map(([v, label, Icon]) => (
              <button key={v} onClick={() => setTab(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === v ? 'bg-[#ffd600] text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>
          <button onClick={() => setModal({ open: true })}
            className="flex items-center gap-2 bg-[#ffd600] hover:bg-[#ffe033] text-zinc-950 font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
            <Plus size={16} />Nueva tarea
          </button>
        </div>

        {tab === 'lista' && (
          <div className="flex flex-wrap gap-2">
            {(['Todos', ...ESTADOS] as const).map(e => (
              <button key={e} onClick={() => setFiltroEstado(e)}
                className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${filtroEstado === e ? 'bg-[#ffd600] text-zinc-950 border-[#ffd600]' : 'text-zinc-500 border-zinc-700 hover:border-zinc-500'}`}>
                {e}
              </button>
            ))}
            {allTags.map(tag => (
              <button key={tag} onClick={() => setFiltroTag(filtroTag === tag ? null : tag)}
                className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border transition-all ${filtroTag === tag ? 'bg-[#ffd600]/20 text-[#ffd600] border-[#ffd600]/40' : 'text-zinc-600 border-zinc-800 hover:border-zinc-600'}`}>
                <Tag size={10} />#{tag}
              </button>
            ))}
          </div>
        )}

        {tab === 'lista' && (
          <div className="space-y-2">
            {tareasFiltradas.length === 0
              ? <div className="text-center py-12 text-zinc-600">{state.tareas.length === 0 ? 'Sin tareas. Creá la primera.' : 'Sin resultados para estos filtros.'}</div>
              : tareasFiltradas.map(t => <TareaCard key={t.id} tarea={t} onEdit={t => setModal({ open: true, tarea: t })} onDelete={handleDelete} onEstado={handleEstado} />)}
          </div>
        )}

        {tab === 'kanban' && <KanbanView tareas={state.tareas} onEdit={t => setModal({ open: true, tarea: t })} onDelete={handleDelete} onEstado={handleEstado} />}

        {tab === 'calendario' && <CalendarView tareas={state.tareas} onEdit={t => setModal({ open: true, tarea: t })} onDelete={handleDelete} onEstado={handleEstado} />}
      </div>

      {modal.open && (
        <TareaModal tarea={modal.tarea} onClose={() => setModal({ open: false })} onSave={handleSave} onDelete={handleDelete} />
      )}
    </AppLayout>
  )
}
