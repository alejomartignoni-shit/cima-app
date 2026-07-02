import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { hoy } from '../utils/formatters'
import {
  format,
  parseISO,
  startOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  isToday,
  isBefore,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { DiaSemana } from '../types'

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function semanaISO(lunes: Date): string {
  return format(lunes, 'yyyy-MM-dd')
}

function getDiasSemana(lunes: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => format(addDays(lunes, i), 'yyyy-MM-dd'))
}

const diaSemanaVacio = (): DiaSemana => ({ notas: '', mejoras: '', gratitud: '' })

export function Semanal() {
  const { state, dispatch } = useApp()
  const [luneCursor, setLuneCursor] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(hoy())

  const semana = semanaISO(luneCursor)
  const diasSemana = getDiasSemana(luneCursor)
  const registroSemana = state.registrosSemanal.find(r => r.semana === semana)

  const esSemanaCurrent = semanaISO(startOfWeek(new Date(), { weekStartsOn: 1 })) === semana

  function getDia(fecha: string): DiaSemana {
    return registroSemana?.dias?.[fecha] ?? diaSemanaVacio()
  }

  function updateDia(fecha: string, campo: keyof DiaSemana, valor: string) {
    const diaActual = getDia(fecha)
    dispatch({
      type: 'UPDATE_DIA_SEMANAL',
      payload: {
        semana,
        fecha,
        dia: { ...diaActual, [campo]: valor },
      },
    })
  }

  // Habits for this week
  const habitosActivos = state.habitos.filter(h => h.activo)

  function estaCompletado(habitoId: string, fecha: string) {
    return state.registrosHabito.some(r => r.habitoId === habitoId && r.fecha === fecha)
  }

  function toggleHabito(habitoId: string, fecha: string) {
    const esFuturo = isBefore(new Date(), parseISO(fecha)) && !isToday(parseISO(fecha))
    if (esFuturo) return
    dispatch({ type: 'TOGGLE_REGISTRO_HABITO', payload: { fecha, habitoId } })
  }

  // Tasks due this week
  const tareasEstaSemana = state.tareas.filter(t => {
    if (!t.fechaVencimiento) return false
    return diasSemana.includes(t.fechaVencimiento)
  })

  // Week range display
  const rango = `${format(luneCursor, "d MMM", { locale: es })} – ${format(addDays(luneCursor, 6), "d MMM yyyy", { locale: es })}`

  const diaData = getDia(diaSeleccionado)
  const tareasDia = tareasEstaSemana.filter(t => t.fechaVencimiento === diaSeleccionado)

  return (
    <AppLayout titulo="Semana">
      <div className="space-y-5 animate-fade-in">

        {/* Week navigator */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              const nueva = subWeeks(luneCursor, 1)
              setLuneCursor(nueva)
              setDiaSeleccionado(semanaISO(nueva))
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">{rango}</p>
            {esSemanaCurrent && (
              <p className="text-emerald-400 text-xs mt-0.5">Esta semana</p>
            )}
          </div>
          <button
            onClick={() => {
              const nueva = addWeeks(luneCursor, 1)
              setLuneCursor(nueva)
              setDiaSeleccionado(semanaISO(nueva))
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day selector */}
        <div className="grid grid-cols-7 gap-1">
          {diasSemana.map((fecha, i) => {
            const dia = getDia(fecha)
            const tieneContenido = dia.notas || dia.mejoras || dia.gratitud
            const completadosHabitos = habitosActivos.filter(h => estaCompletado(h.id, fecha)).length
            const esHoy = isToday(parseISO(fecha))
            const seleccionado = diaSeleccionado === fecha

            return (
              <button
                key={fecha}
                onClick={() => setDiaSeleccionado(fecha)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                  seleccionado
                    ? 'bg-emerald-500/20 border border-emerald-500/40'
                    : esHoy
                    ? 'bg-zinc-800 border border-zinc-600'
                    : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <span className={`text-[10px] font-medium ${seleccionado ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {DIAS_SEMANA[i]}
                </span>
                <span className={`text-sm font-bold mt-0.5 ${
                  seleccionado ? 'text-emerald-400' : esHoy ? 'text-white' : 'text-zinc-300'
                }`}>
                  {parseInt(fecha.slice(8))}
                </span>
                <div className="flex gap-0.5 mt-1">
                  {tieneContenido && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                  {completadosHabitos > 0 && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected day content */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-sm capitalize">
            {format(parseISO(diaSeleccionado), "EEEE d 'de' MMMM", { locale: es })}
          </h3>

          {/* Habits for this day */}
          {habitosActivos.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-3 font-medium uppercase tracking-wide">Hábitos</p>
              <div className="space-y-2">
                {habitosActivos.map(h => {
                  const completado = estaCompletado(h.id, diaSeleccionado)
                  const esFuturo = isBefore(new Date(), parseISO(diaSeleccionado)) && !isToday(parseISO(diaSeleccionado))
                  return (
                    <button
                      key={h.id}
                      onClick={() => toggleHabito(h.id, diaSeleccionado)}
                      disabled={esFuturo}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                        esFuturo ? 'opacity-40 cursor-not-allowed' : 'hover:bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-all ${
                          completado ? 'border-transparent' : 'border-zinc-600'
                        }`}
                        style={completado ? { backgroundColor: h.color } : {}}
                      >
                        {completado && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-sm">{h.emoji} {h.nombre}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tasks due this day */}
          {tareasDia.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-3 font-medium uppercase tracking-wide">Tareas</p>
              <div className="space-y-2">
                {tareasDia.map(t => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      t.estado === 'Completada' ? 'bg-emerald-400' :
                      t.estado === 'En progreso' ? 'bg-blue-400' :
                      t.estado === 'Cancelada' ? 'bg-zinc-600' : 'bg-zinc-500'
                    }`} />
                    <span className={`text-sm ${t.estado === 'Completada' ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                      {t.titulo}
                    </span>
                    <span className="ml-auto text-[10px] text-zinc-600">{t.prioridad}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Journal sections */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5 font-medium">📝 Notas del día</label>
              <textarea
                value={diaData.notas}
                onChange={e => updateDia(diaSeleccionado, 'notas', e.target.value)}
                placeholder="¿Qué pasó hoy? ¿Qué lograste?"
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs mb-1.5 font-medium">🔧 ¿Qué mejorar?</label>
              <textarea
                value={diaData.mejoras}
                onChange={e => updateDia(diaSeleccionado, 'mejoras', e.target.value)}
                placeholder="¿Qué harías diferente?"
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs mb-1.5 font-medium">🙏 Gratitud</label>
              <textarea
                value={diaData.gratitud}
                onChange={e => updateDia(diaSeleccionado, 'gratitud', e.target.value)}
                placeholder="¿Por qué estás agradecido hoy?"
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>

          {/* Week overview — mini dots per day */}
          {habitosActivos.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-3 font-medium uppercase tracking-wide">Vista semanal — hábitos</p>
              <div className="overflow-x-auto">
                <table style={{ minWidth: `${100 + 7 * 36}px` }} className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-zinc-600 text-[10px] font-medium pb-2 min-w-24" />
                      {diasSemana.map((fecha, i) => (
                        <th key={fecha} className={`text-center text-[10px] font-medium pb-2 w-9 ${
                          isToday(parseISO(fecha)) ? 'text-emerald-400' : 'text-zinc-600'
                        }`}>
                          {DIAS_SEMANA[i]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {habitosActivos.map(h => (
                      <tr key={h.id}>
                        <td className="py-1.5 text-zinc-400 text-xs truncate max-w-24 pr-2">
                          {h.emoji} {h.nombre}
                        </td>
                        {diasSemana.map(fecha => {
                          const completado = estaCompletado(h.id, fecha)
                          const futuro = isBefore(new Date(), parseISO(fecha)) && !isToday(parseISO(fecha))
                          return (
                            <td key={fecha} className="text-center py-1.5">
                              <div
                                className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center ${
                                  futuro ? 'bg-zinc-800/40' :
                                  completado ? '' : 'border border-zinc-700'
                                }`}
                                style={completado ? { backgroundColor: h.color } : {}}
                              >
                                {completado && <Check size={9} className="text-white" strokeWidth={3} />}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
