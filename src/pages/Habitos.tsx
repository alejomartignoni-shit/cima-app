import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Check, BarChart2 } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Modal } from '../components/ui/Modal'
import { hoy, formatearMes } from '../utils/formatters'
import {
  format,
  parseISO,
  getDaysInMonth,
  startOfMonth,
  addMonths,
  subMonths,
  isBefore,
  isToday,
  subDays,
  isAfter,
} from 'date-fns'
import { toast } from 'sonner'
import type { Habito } from '../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const EMOJIS = ['🏃', '💪', '📖', '💧', '🧘', '🍎', '😴', '🎯', '💊', '✍️', '🎵', '🧹', '💰', '🌿', '🚴', '🧠']
const COLORES = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4', '#f97316', '#84cc16']

const MOOD_LABELS = ['😞', '😕', '😐', '🙂', '😄']
const MOTIVACION_LABELS = ['😴', '😑', '🙂', '💪', '🔥']

function idNuevo(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

interface FormHabito {
  nombre: string
  emoji: string
  color: string
}

const formVacio = (): FormHabito => ({ nombre: '', emoji: '🎯', color: '#10b981' })

function habitoAForm(h: Habito): FormHabito {
  return { nombre: h.nombre, emoji: h.emoji, color: h.color }
}

export function Habitos() {
  const { state, dispatch } = useApp()
  const [mesCursor, setMesCursor] = useState(() => startOfMonth(new Date()))
  const [modalHabito, setModalHabito] = useState(false)
  const [editandoHabito, setEditandoHabito] = useState<Habito | null>(null)
  const [form, setForm] = useState<FormHabito>(formVacio)

  const mesISO = format(mesCursor, 'yyyy-MM')
  const diasEnMes = getDaysInMonth(mesCursor)
  const diasDelMes = Array.from({ length: diasEnMes }, (_, i) => {
    const d = i + 1
    return format(new Date(mesCursor.getFullYear(), mesCursor.getMonth(), d), 'yyyy-MM-dd')
  })

  const habitosActivos = state.habitos.filter(h => h.activo)

  function estaCompletado(habitoId: string, fecha: string) {
    return state.registrosHabito.some(r => r.habitoId === habitoId && r.fecha === fecha)
  }

  function toggleHabito(habitoId: string, fecha: string) {
    dispatch({ type: 'TOGGLE_REGISTRO_HABITO', payload: { fecha, habitoId } })
  }

  function completosMes(habitoId: string) {
    return diasDelMes.filter(d => estaCompletado(habitoId, d)).length
  }

  function porcentajeMes(habitoId: string) {
    const pasados = diasDelMes.filter(d => !isBefore(new Date(), parseISO(d))).length
    if (pasados === 0) return 0
    return Math.round((completosMes(habitoId) / pasados) * 100)
  }

  // Mood / motivation for today
  const fechaHoy = hoy()
  const estadoHoy = state.estadosDia.find(e => e.fecha === fechaHoy)

  function setMood(valor: 1 | 2 | 3 | 4 | 5) {
    const actual = estadoHoy ?? { fecha: fechaHoy, estado: 3 as const, motivacion: 3 as const }
    dispatch({ type: 'SET_ESTADO_DIA', payload: { ...actual, estado: valor } })
  }

  function setMotivacion(valor: 1 | 2 | 3 | 4 | 5) {
    const actual = estadoHoy ?? { fecha: fechaHoy, estado: 3 as const, motivacion: 3 as const }
    dispatch({ type: 'SET_ESTADO_DIA', payload: { ...actual, motivacion: valor } })
  }

  function abrirNuevo() {
    setForm(formVacio())
    setEditandoHabito(null)
    setModalHabito(true)
  }

  function abrirEditar(h: Habito) {
    setForm(habitoAForm(h))
    setEditandoHabito(h)
    setModalHabito(true)
  }

  function guardarHabito() {
    if (!form.nombre.trim()) {
      toast.error('Poné un nombre al hábito')
      return
    }
    if (editandoHabito) {
      dispatch({
        type: 'EDIT_HABITO',
        payload: { ...editandoHabito, nombre: form.nombre.trim(), emoji: form.emoji, color: form.color },
      })
      toast.success('Hábito actualizado')
    } else {
      dispatch({
        type: 'ADD_HABITO',
        payload: { id: idNuevo('hab'), nombre: form.nombre.trim(), emoji: form.emoji, color: form.color, activo: true, creadoEn: fechaHoy },
      })
      toast.success('Hábito creado')
    }
    setModalHabito(false)
  }

  function eliminarHabito(h: Habito) {
    if (!confirm(`¿Eliminar el hábito "${h.nombre}"? Se perderán todos los registros.`)) return
    dispatch({ type: 'DELETE_HABITO', payload: h.id })
    toast.success('Hábito eliminado')
  }

  const esMesActual = format(mesCursor, 'yyyy-MM') === format(new Date(), 'yyyy-MM')

  return (
    <AppLayout titulo="Hábitos">
      <div className="space-y-6 animate-fade-in">

        {/* Month nav + add button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMesCursor(subMonths(mesCursor, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-white font-semibold text-sm capitalize min-w-32 text-center">
              {formatearMes(mesISO)}
            </h2>
            <button
              onClick={() => setMesCursor(addMonths(mesCursor, 1))}
              disabled={esMesActual}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={abrirNuevo}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm px-3 py-2 rounded-lg transition-colors active:scale-95"
          >
            <Plus size={16} />
            Nuevo
          </button>
        </div>

        {/* Empty state */}
        {habitosActivos.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-white font-medium mb-2">Sin hábitos todavía</h3>
            <p className="text-zinc-500 text-sm">Creá tu primer hábito y empezá a trackear tu progreso diario.</p>
            <button
              onClick={abrirNuevo}
              className="mt-4 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Crear primer hábito
            </button>
          </div>
        )}

        {/* Habits grid — horizontally scrollable */}
        {habitosActivos.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: `${180 + diasEnMes * 28}px` }}>
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium sticky left-0 bg-zinc-900 z-10 min-w-40">
                      Hábito
                    </th>
                    {diasDelMes.map(fecha => {
                      const dia = parseInt(fecha.slice(8))
                      const esHoy = isToday(parseISO(fecha))
                      return (
                        <th
                          key={fecha}
                          className={`text-center py-3 text-xs font-medium w-7 ${
                            esHoy ? 'text-emerald-400' : 'text-zinc-600'
                          }`}
                        >
                          {dia}
                        </th>
                      )
                    })}
                    <th className="text-center px-3 py-3 text-zinc-500 text-xs font-medium min-w-14">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {habitosActivos.map(habito => (
                    <tr key={habito.id} className="group">
                      <td className="px-4 py-2 sticky left-0 bg-zinc-900 z-10">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg flex-shrink-0">{habito.emoji}</span>
                          <span className="text-zinc-300 text-sm truncate">{habito.nombre}</span>
                          <div className="hidden group-hover:flex items-center gap-1 ml-1 flex-shrink-0">
                            <button
                              onClick={() => abrirEditar(habito)}
                              className="w-5 h-5 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              onClick={() => eliminarHabito(habito)}
                              className="w-5 h-5 rounded flex items-center justify-center text-zinc-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </td>
                      {diasDelMes.map(fecha => {
                        const completado = estaCompletado(habito.id, fecha)
                        const esFuturo = isBefore(new Date(), parseISO(fecha)) && !isToday(parseISO(fecha))
                        return (
                          <td key={fecha} className="text-center py-2">
                            <button
                              onClick={() => !esFuturo && toggleHabito(habito.id, fecha)}
                              disabled={esFuturo}
                              className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center transition-all ${
                                esFuturo
                                  ? 'bg-zinc-800/40 cursor-not-allowed'
                                  : completado
                                  ? 'active:scale-90'
                                  : 'border border-zinc-700 hover:border-zinc-500'
                              }`}
                              style={completado ? { backgroundColor: habito.color } : {}}
                            >
                              {completado && <Check size={10} className="text-white" strokeWidth={3} />}
                            </button>
                          </td>
                        )
                      })}
                      <td className="text-center px-3 py-2">
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded"
                          style={{
                            color: habito.color,
                            backgroundColor: `${habito.color}22`,
                          }}
                        >
                          {porcentajeMes(habito.id)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mood & Motivation — today only */}
        {esMesActual && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
            <h3 className="text-zinc-300 font-medium text-sm">Estado de hoy</h3>

            <div>
              <p className="text-zinc-500 text-xs mb-2">¿Cómo te sentís?</p>
              <div className="flex gap-2">
                {MOOD_LABELS.map((emoji, i) => {
                  const val = (i + 1) as 1 | 2 | 3 | 4 | 5
                  return (
                    <button
                      key={val}
                      onClick={() => setMood(val)}
                      className={`flex-1 py-2 rounded-lg text-xl transition-all ${
                        estadoHoy?.estado === val
                          ? 'bg-emerald-500/20 ring-1 ring-emerald-500 scale-110'
                          : 'bg-zinc-800 hover:bg-zinc-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-zinc-500 text-xs mb-2">¿Cuánta energía tenés?</p>
              <div className="flex gap-2">
                {MOTIVACION_LABELS.map((emoji, i) => {
                  const val = (i + 1) as 1 | 2 | 3 | 4 | 5
                  return (
                    <button
                      key={val}
                      onClick={() => setMotivacion(val)}
                      className={`flex-1 py-2 rounded-lg text-xl transition-all ${
                        estadoHoy?.motivacion === val
                          ? 'bg-emerald-500/20 ring-1 ring-emerald-500 scale-110'
                          : 'bg-zinc-800 hover:bg-zinc-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  )
                })}
              </div>
            </div>

            {estadoHoy && (
              <p className="text-zinc-600 text-xs text-center">
                Estado registrado para hoy ✓
              </p>
            )}
          </div>
        )}

        {/* Stats summary for active habits */}
        {habitosActivos.length > 0 && esMesActual && (
          <div className="grid grid-cols-2 gap-3">
            {habitosActivos.slice(0, 4).map(h => {
              const pct = porcentajeMes(h.id)
              const completados = completosMes(h.id)
              return (
                <div key={h.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{h.emoji}</span>
                    <span className="text-zinc-300 text-xs truncate">{h.nombre}</span>
                  </div>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-bold" style={{ color: h.color }}>{pct}%</span>
                    <span className="text-zinc-500 text-xs">{completados} días</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: h.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Completion chart — last 30 days */}
        {habitosActivos.length > 0 && (() => {
          const hace30 = subDays(new Date(), 30)
          const chartData = habitosActivos.map(h => ({
            name: h.nombre.length > 12 ? h.nombre.slice(0, 12) + '…' : h.nombre,
            Días: state.registrosHabito.filter(r => r.habitoId === h.id && isAfter(new Date(r.fecha), hace30)).length,
            color: h.color,
          }))
          return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={15} className="text-zinc-500" />
                <h3 className="text-zinc-300 font-medium text-sm">Días completados · últimos 30 días</h3>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barSize={20}>
                  <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 30]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
                    cursor={{ fill: '#ffffff08' }}
                  />
                  <Bar dataKey="Días" radius={[4, 4, 0, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        })()}
      </div>

      {/* Modal: Add/Edit habit */}
      <Modal
        abierto={modalHabito}
        titulo={editandoHabito ? 'Editar hábito' : 'Nuevo hábito'}
        onCerrar={() => setModalHabito(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs mb-1.5">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Tomar agua, Meditar..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs mb-1.5">Emoji</label>
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, emoji: e }))}
                  className={`aspect-square rounded-lg text-xl flex items-center justify-center transition-all ${
                    form.emoji === e
                      ? 'bg-emerald-500/20 ring-1 ring-emerald-500'
                      : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-xs mb-1.5">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-all ${
                    form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setModalHabito(false)}
              className="flex-1 py-2.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={guardarHabito}
              className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold transition-colors"
            >
              {editandoHabito ? 'Guardar' : 'Crear hábito'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
