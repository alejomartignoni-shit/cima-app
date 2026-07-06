import { useMemo, useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Modal } from '../components/ui/Modal'
import { Reveal } from '../components/ui/Reveal'
import { useApp } from '../store/AppContext'
import { formatearMonto, hoy } from '../utils/formatters'
import { TIPOS_FONDO, type FondoAhorro, type TipoFondo } from '../types'
import { playPop, playDing, vibrate } from '../utils/sound'
import { celebrate } from '../components/game/Celebration'
import { Plus, Trash2, PiggyBank, ShieldCheck, Minus } from 'lucide-react'
import { toast } from 'sonner'

const META_FONDO: Record<TipoFondo, { emoji: string; color: string }> = {
  Emergencia: { emoji: '🛡️', color: '#34d399' },
  Ahorro:     { emoji: '🐷', color: '#38bdf8' },
  Meta:       { emoji: '🎯', color: '#7c5cfc' },
}

const FORM_INICIAL = {
  nombre: '',
  tipo: 'Ahorro' as TipoFondo,
  objetivo: '',
  acumulado: '',
}

export function Ahorros() {
  const { state, dispatch } = useApp()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [movimiento, setMovimiento] = useState<{ fondo: FondoAhorro; signo: 1 | -1 } | null>(null)
  const [montoMov, setMontoMov] = useState('')

  const totalAhorrado = state.fondos.reduce((s, f) => s + f.acumulado, 0)
  const emergencia = state.fondos.filter(f => f.tipo === 'Emergencia')
  const totalEmergencia = emergencia.reduce((s, f) => s + f.acumulado, 0)

  // Meses cubiertos: costos fijos activos mensualizados; fallback a promedio de gastos de 3 meses
  const gastoMensualRef = useMemo(() => {
    const fijos = state.costosFijos
      .filter(c => c.activo)
      .reduce((s, c) => s + (c.frecuencia === 'mensual' ? c.monto : c.monto / 12), 0)
    if (fijos > 0) return { monto: fijos, fuente: 'costos fijos' }
    const tresMesesAtras = new Date()
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3)
    const iso = tresMesesAtras.toISOString().slice(0, 10)
    const gastos = state.transacciones
      .filter(t => t.tipo === 'gasto' && t.fecha >= iso)
      .reduce((s, t) => s + t.monto, 0)
    return { monto: gastos / 3, fuente: 'promedio de gastos' }
  }, [state.costosFijos, state.transacciones])

  const mesesCubiertos = gastoMensualRef.monto > 0 ? totalEmergencia / gastoMensualRef.monto : null

  const ordenados = [...state.fondos].sort((a, b) =>
    (a.tipo === 'Emergencia' ? -1 : 0) - (b.tipo === 'Emergencia' ? -1 : 0) || b.acumulado - a.acumulado
  )

  function guardar() {
    const objetivo = Number(form.objetivo)
    const acumulado = Number(form.acumulado) || 0
    if (!form.nombre.trim()) { toast.error('Poné un nombre al fondo'); return }
    if (!objetivo || objetivo <= 0) { toast.error('El objetivo tiene que ser mayor a 0'); return }
    if (acumulado < 0) { toast.error('El monto inicial no puede ser negativo'); return }
    dispatch({
      type: 'ADD_FONDO',
      payload: {
        id: crypto.randomUUID(),
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        objetivo,
        acumulado,
        creadoEn: hoy(),
      },
    })
    playPop(); vibrate(10)
    toast.success(`Fondo "${form.nombre.trim()}" creado`)
    setForm(FORM_INICIAL)
    setModalAbierto(false)
  }

  function confirmarMovimiento() {
    if (!movimiento) return
    const monto = Number(montoMov)
    if (!monto || monto <= 0) { toast.error('Ingresá un monto mayor a 0'); return }
    const { fondo, signo } = movimiento
    const nuevo = fondo.acumulado + monto * signo
    if (nuevo < 0) { toast.error('No podés retirar más de lo acumulado'); return }
    dispatch({ type: 'EDIT_FONDO', payload: { ...fondo, acumulado: nuevo } })
    if (signo === 1) {
      playDing(); vibrate(12)
      if (fondo.acumulado < fondo.objetivo && nuevo >= fondo.objetivo) {
        celebrate({ pieces: 80 })
        toast.success(`🎉 ¡Objetivo de "${fondo.nombre}" alcanzado!`)
      } else {
        toast.success(`+${formatearMonto(monto)} a ${fondo.nombre}`)
      }
    } else {
      toast.success(`-${formatearMonto(monto)} de ${fondo.nombre}`)
    }
    setMovimiento(null)
    setMontoMov('')
  }

  function eliminar(f: FondoAhorro) {
    dispatch({ type: 'DELETE_FONDO', payload: f.id })
    toast.success(`Fondo "${f.nombre}" eliminado`)
  }

  return (
    <AppLayout titulo="Ahorros & Fondos">
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="card-hero rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="aurora-bg absolute inset-0 opacity-40 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">
              Total ahorrado
            </p>
            <p className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              {formatearMonto(totalAhorrado)}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck size={11} />
                {formatearMonto(totalEmergencia)} en emergencia
              </span>
              {mesesCubiertos !== null && totalEmergencia > 0 && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  mesesCubiertos >= 6
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : mesesCubiertos >= 3
                      ? 'text-[#ffd600] bg-[#ffd600]/10 border-[#ffd600]/20'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                }`}>
                  Cubre {mesesCubiertos.toFixed(1)} meses de {gastoMensualRef.fuente}
                </span>
              )}
            </div>
            {totalEmergencia === 0 && (
              <p className="text-zinc-500 text-xs mt-3">
                💡 Regla de oro: un fondo de emergencia de 3 a 6 meses de gastos antes de invertir fuerte.
              </p>
            )}
          </div>
        </div>

        {/* ── Botón agregar ────────────────────────────────────────────── */}
        <button
          onClick={() => { playPop(); setModalAbierto(true) }}
          className="btn-juicy btn-juicy-emerald w-full"
        >
          <Plus size={18} strokeWidth={2.5} /> Crear fondo
        </button>

        {/* ── Lista de fondos ──────────────────────────────────────────── */}
        {ordenados.length === 0 ? (
          <Reveal>
            <div className="glass-card rounded-2xl p-10 text-center">
              <PiggyBank size={32} className="text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm font-semibold mb-1">Sin fondos todavía</p>
              <p className="text-zinc-600 text-xs">
                Fondo de emergencia, vacaciones, auto nuevo: cada meta con su progreso visible.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="space-y-3">
            {ordenados.map((f, i) => {
              const meta = META_FONDO[f.tipo]
              const pct = f.objetivo > 0 ? Math.min(100, (f.acumulado / f.objetivo) * 100) : 0
              const completado = f.acumulado >= f.objetivo
              return (
                <Reveal key={f.id} delay={i * 60}>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}30` }}
                      >
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-100 text-sm font-semibold truncate">
                          {f.nombre}
                          {completado && <span className="ml-2 text-xs">✅</span>}
                        </p>
                        <p className="text-zinc-600 text-xs">{f.tipo}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white font-bold text-sm tabular-nums">{formatearMonto(f.acumulado)}</p>
                        <p className="text-zinc-600 text-xs tabular-nums">de {formatearMonto(f.objetivo)}</p>
                      </div>
                    </div>

                    <div className="h-2.5 bg-black/40 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: completado ? '#34d399' : `linear-gradient(90deg, ${meta.color}, ${meta.color}aa)` }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setMovimiento({ fondo: f, signo: 1 }); setMontoMov('') }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                      >
                        <Plus size={13} /> Aportar
                      </button>
                      <button
                        onClick={() => { setMovimiento({ fondo: f, signo: -1 }); setMontoMov('') }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-zinc-400 bg-zinc-800 border border-zinc-700 hover:text-zinc-200 transition-colors"
                      >
                        <Minus size={13} /> Retirar
                      </button>
                      <button
                        onClick={() => eliminar(f)}
                        title="Eliminar fondo"
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        )}

        <p className="text-zinc-600 text-xs text-center px-4 pb-2">
          El semáforo de emergencia: 🔴 menos de 3 meses · 🟡 3-6 meses · 🟢 6+ meses cubiertos.
        </p>
      </div>

      {/* ── Modal crear fondo ──────────────────────────────────────────── */}
      <Modal abierto={modalAbierto} titulo="Nuevo fondo" onCerrar={() => setModalAbierto(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Fondo de emergencia, Vacaciones…"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Tipo</label>
            <select
              value={form.tipo}
              onChange={e => setForm({ ...form, tipo: e.target.value as TipoFondo })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              {TIPOS_FONDO.map(t => (
                <option key={t} value={t}>{META_FONDO[t].emoji} {t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Objetivo (ARS)</label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={form.objetivo}
                onChange={e => setForm({ ...form, objetivo: e.target.value })}
                placeholder="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Ya acumulado</label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={form.acumulado}
                onChange={e => setForm({ ...form, acumulado: e.target.value })}
                placeholder="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <button onClick={guardar} className="btn-juicy btn-juicy-emerald w-full">
            Crear fondo
          </button>
        </div>
      </Modal>

      {/* ── Modal aportar / retirar ────────────────────────────────────── */}
      <Modal
        abierto={movimiento !== null}
        titulo={movimiento?.signo === 1 ? `Aportar a ${movimiento.fondo.nombre}` : `Retirar de ${movimiento?.fondo.nombre ?? ''}`}
        onCerrar={() => setMovimiento(null)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Monto (ARS)</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              autoFocus
              value={montoMov}
              onChange={e => setMontoMov(e.target.value)}
              placeholder="0"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          {movimiento && (
            <p className="text-zinc-500 text-xs">
              Acumulado actual: {formatearMonto(movimiento.fondo.acumulado)} · Objetivo: {formatearMonto(movimiento.fondo.objetivo)}
            </p>
          )}
          <button
            onClick={confirmarMovimiento}
            className={`btn-juicy w-full ${movimiento?.signo === 1 ? 'btn-juicy-emerald' : 'btn-juicy-dark'}`}
          >
            {movimiento?.signo === 1 ? 'Confirmar aporte' : 'Confirmar retiro'}
          </button>
        </div>
      </Modal>
    </AppLayout>
  )
}
