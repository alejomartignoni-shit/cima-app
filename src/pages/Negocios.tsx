import { useMemo, useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Modal } from '../components/ui/Modal'
import { Reveal } from '../components/ui/Reveal'
import { useApp } from '../store/AppContext'
import { formatearMonto, formatearFecha, hoy, mesActual } from '../utils/formatters'
import { CATEGORIAS_NEGOCIO, type CategoriaNegocio, type TipoTransaccion } from '../types'
import { playPop, playDing, vibrate } from '../utils/sound'
import {
  Plus, Trash2, Briefcase, ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { format, subMonths, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

const EMOJIS_SUGERIDOS = ['💼', '🤖', '📱', '🏠', '🛒', '🎥', '✂️', '🍔', '🚗', '💊', '📚', '⚡']

const FORM_TX_INICIAL = {
  tipo: 'ingreso' as TipoTransaccion,
  categoria: 'Ventas' as CategoriaNegocio,
  monto: '',
  nota: '',
}

export function Negocios() {
  const { state, dispatch } = useApp()
  const [seleccionado, setSeleccionado] = useState<string | null>(null)
  const [modalNegocio, setModalNegocio] = useState(false)
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [emojiNegocio, setEmojiNegocio] = useState('💼')
  const [modalTx, setModalTx] = useState(false)
  const [formTx, setFormTx] = useState(FORM_TX_INICIAL)
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false)

  const negocio = state.negocios.find(n => n.id === seleccionado) ?? null
  const mes = mesActual()

  const resumenPorNegocio = useMemo(() => {
    const map = new Map<string, { total: number; mesNeto: number }>()
    for (const n of state.negocios) {
      const txs = state.transaccionesNegocio.filter(t => t.negocioId === n.id)
      const total = txs.reduce((s, t) => s + (t.tipo === 'ingreso' ? t.monto : -t.monto), 0)
      const mesNeto = txs
        .filter(t => t.fecha.startsWith(mes))
        .reduce((s, t) => s + (t.tipo === 'ingreso' ? t.monto : -t.monto), 0)
      map.set(n.id, { total, mesNeto })
    }
    return map
  }, [state.negocios, state.transaccionesNegocio, mes])

  // ─── Detalle del negocio seleccionado ─────────────────────────────────
  const txNegocio = useMemo(
    () => state.transaccionesNegocio
      .filter(t => t.negocioId === seleccionado)
      .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [state.transaccionesNegocio, seleccionado],
  )

  const ingresosMes = txNegocio.filter(t => t.tipo === 'ingreso' && t.fecha.startsWith(mes)).reduce((s, t) => s + t.monto, 0)
  const gastosMes = txNegocio.filter(t => t.tipo === 'gasto' && t.fecha.startsWith(mes)).reduce((s, t) => s + t.monto, 0)
  const balanceTotal = txNegocio.reduce((s, t) => s + (t.tipo === 'ingreso' ? t.monto : -t.monto), 0)
  const margen = ingresosMes > 0 ? Math.round(((ingresosMes - gastosMes) / ingresosMes) * 100) : null

  const chartData = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const m = format(subMonths(new Date(), 5 - i), 'yyyy-MM')
    const txM = txNegocio.filter(t => t.fecha.startsWith(m))
    return {
      mes: format(parseISO(`${m}-01`), 'MMM', { locale: es }),
      Ingresos: txM.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0),
      Gastos: txM.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0),
    }
  }), [txNegocio])

  function crearNegocio() {
    if (!nombreNegocio.trim()) { toast.error('Poné un nombre al negocio'); return }
    const id = crypto.randomUUID()
    dispatch({
      type: 'ADD_NEGOCIO',
      payload: { id, nombre: nombreNegocio.trim(), emoji: emojiNegocio, creadoEn: hoy() },
    })
    playDing(); vibrate(12)
    toast.success(`Espacio "${nombreNegocio.trim()}" creado 🚀`)
    setNombreNegocio('')
    setEmojiNegocio('💼')
    setModalNegocio(false)
    setSeleccionado(id)
  }

  function agregarTx() {
    const monto = Number(formTx.monto)
    if (!monto || monto <= 0) { toast.error('El monto tiene que ser mayor a 0'); return }
    if (!seleccionado) return
    dispatch({
      type: 'ADD_TX_NEGOCIO',
      payload: {
        id: crypto.randomUUID(),
        negocioId: seleccionado,
        fecha: hoy(),
        tipo: formTx.tipo,
        categoria: formTx.categoria,
        monto,
        nota: formTx.nota.trim() || undefined,
      },
    })
    playPop(); vibrate(10)
    toast.success(formTx.tipo === 'ingreso' ? `+${formatearMonto(monto)} 💰` : `-${formatearMonto(monto)} registrado`)
    setFormTx(FORM_TX_INICIAL)
    setModalTx(false)
  }

  function borrarNegocio() {
    if (!negocio) return
    dispatch({ type: 'DELETE_NEGOCIO', payload: negocio.id })
    toast.success(`Espacio "${negocio.nombre}" eliminado`)
    setSeleccionado(null)
    setConfirmandoBorrar(false)
  }

  const fmtCompact = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v))

  // ════════════════════════════════════════════════════════════════════
  // Vista: lista de espacios
  // ════════════════════════════════════════════════════════════════════
  if (!negocio) {
    return (
      <AppLayout titulo="Negocios">
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">

          <div className="card-hero rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="aurora-bg absolute inset-0 opacity-40 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                Modo empresario
              </p>
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Un espacio por negocio.
                <br />
                <span className="text-gradient-violet">Cada finanza, separada.</span>
              </p>
              <p className="text-zinc-400 text-sm mt-3 max-w-md">
                Las finanzas de tus negocios viven aparte de las personales: balance, cashflow y
                desglose por categoría, cada uno en su espacio.
              </p>
            </div>
          </div>

          <button
            onClick={() => { playPop(); setModalNegocio(true) }}
            className="btn-juicy btn-juicy-violet w-full"
          >
            <Plus size={18} strokeWidth={2.5} /> Crear espacio de negocio
          </button>

          {state.negocios.length === 0 ? (
            <Reveal>
              <div className="glass-card rounded-2xl p-10 text-center">
                <Briefcase size={32} className="text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm font-semibold mb-1">Sin negocios todavía</p>
                <p className="text-zinc-600 text-xs">
                  Agencia, e-commerce, consultoría: creá un espacio y traqueá sus números.
                </p>
              </div>
            </Reveal>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {state.negocios.map((n, i) => {
                const r = resumenPorNegocio.get(n.id) ?? { total: 0, mesNeto: 0 }
                return (
                  <Reveal key={n.id} delay={i * 70}>
                    <button
                      onClick={() => { playPop(); setSeleccionado(n.id) }}
                      className="glass-card glass-card-hover w-full text-left rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl bg-violeta/10 border border-violeta/25">
                          {n.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-base truncate">{n.nombre}</p>
                          <p className="text-zinc-600 text-xs">desde {n.creadoEn}</p>
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-zinc-500 text-[11px] font-medium mb-0.5">Balance total</p>
                          <p className={`font-black text-lg tabular-nums ${r.total >= 0 ? 'text-white' : 'text-rose-400'}`}>
                            {formatearMonto(r.total)}
                          </p>
                        </div>
                        <span className={`text-xs font-bold tabular-nums ${r.mesNeto >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {r.mesNeto >= 0 ? '+' : ''}{formatearMonto(r.mesNeto)} este mes
                        </span>
                      </div>
                    </button>
                  </Reveal>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal crear negocio */}
        <Modal abierto={modalNegocio} titulo="Nuevo espacio de negocio" onCerrar={() => setModalNegocio(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Nombre del negocio</label>
              <input
                type="text"
                value={nombreNegocio}
                onChange={e => setNombreNegocio(e.target.value)}
                placeholder="Agencia IA, Tienda online…"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violeta"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS_SUGERIDOS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmojiNegocio(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                      emojiNegocio === e
                        ? 'bg-violeta/20 border-violeta scale-110'
                        : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={crearNegocio} className="btn-juicy btn-juicy-violet w-full">
              Crear espacio
            </button>
          </div>
        </Modal>
      </AppLayout>
    )
  }

  // ════════════════════════════════════════════════════════════════════
  // Vista: detalle del negocio
  // ════════════════════════════════════════════════════════════════════
  return (
    <AppLayout titulo={negocio.nombre}>
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">

        <button
          onClick={() => { setSeleccionado(null); setConfirmandoBorrar(false) }}
          className="flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} /> Todos los negocios
        </button>

        {/* Hero del negocio */}
        <div className="card-hero rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="aurora-bg absolute inset-0 opacity-40 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{negocio.emoji}</span>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                Balance de {negocio.nombre}
              </p>
            </div>
            <p className={`text-4xl sm:text-5xl font-black tracking-tight ${balanceTotal >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatearMonto(balanceTotal)}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                <ArrowUpRight size={11} /> {formatearMonto(ingresosMes)} este mes
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20">
                <ArrowDownRight size={11} /> {formatearMonto(gastosMes)} este mes
              </span>
              {margen !== null && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  margen >= 0
                    ? 'text-phantom bg-violeta/10 border-violeta/25'
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                }`}>
                  <TrendingUp size={11} /> {margen}% margen
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => { playPop(); setModalTx(true) }}
          className="btn-juicy btn-juicy-violet w-full"
        >
          <Plus size={18} strokeWidth={2.5} /> Registrar movimiento
        </button>

        {/* Chart 6 meses */}
        {txNegocio.length > 0 && (
          <Reveal>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Últimos 6 meses</h3>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={chartData} barCategoryGap="30%" barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} width={38} tickFormatter={fmtCompact} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: 12 }}
                    labelStyle={{ color: '#a1a1aa' }}
                    formatter={(v: number) => [formatearMonto(v), '']}
                  />
                  <Bar dataKey="Ingresos" fill="#7c5cfc" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Gastos" fill="#3b3363" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Reveal>
        )}

        {/* Movimientos */}
        {txNegocio.length === 0 ? (
          <Reveal>
            <div className="glass-card rounded-2xl p-10 text-center">
              <p className="text-zinc-400 text-sm font-semibold mb-1">Sin movimientos todavía</p>
              <p className="text-zinc-600 text-xs">Registrá la primera venta o el primer gasto del negocio.</p>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
              {txNegocio.slice(0, 30).map(t => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 text-sm font-medium truncate">
                      {t.categoria}{t.nota ? ` · ${t.nota}` : ''}
                    </p>
                    <p className="text-zinc-600 text-xs mt-0.5">{formatearFecha(t.fecha)}</p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums flex-shrink-0 ${t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.tipo === 'ingreso' ? '+' : '-'}{formatearMonto(t.monto)}
                  </span>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_TX_NEGOCIO', payload: t.id })}
                    title="Eliminar"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-700 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Borrar negocio — dos pasos */}
        <div className="text-center pt-2 pb-2">
          {confirmandoBorrar ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-zinc-500 text-xs">¿Eliminar "{negocio.nombre}" y todos sus movimientos?</span>
              <button onClick={borrarNegocio} className="text-rose-400 text-xs font-bold hover:underline">
                Sí, eliminar
              </button>
              <button onClick={() => setConfirmandoBorrar(false)} className="text-zinc-400 text-xs font-bold hover:underline">
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmandoBorrar(true)}
              className="text-zinc-700 text-xs hover:text-rose-400 transition-colors"
            >
              Eliminar este espacio
            </button>
          )}
        </div>
      </div>

      {/* Modal registrar movimiento */}
      <Modal abierto={modalTx} titulo={`Movimiento — ${negocio.nombre}`} onCerrar={() => setModalTx(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-800 rounded-xl">
            {(['ingreso', 'gasto'] as TipoTransaccion[]).map(t => (
              <button
                key={t}
                onClick={() => setFormTx({ ...formTx, tipo: t, categoria: t === 'ingreso' ? 'Ventas' : 'Herramientas' })}
                className={`py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                  formTx.tipo === t
                    ? t === 'ingreso' ? 'bg-emerald-500 text-zinc-950' : 'bg-rose-500 text-white'
                    : 'text-zinc-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Categoría</label>
            <select
              value={formTx.categoria}
              onChange={e => setFormTx({ ...formTx, categoria: e.target.value as CategoriaNegocio })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-sm text-zinc-100 focus:outline-none focus:border-violeta"
            >
              {CATEGORIAS_NEGOCIO.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Monto (ARS)</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              autoFocus
              value={formTx.monto}
              onChange={e => setFormTx({ ...formTx, monto: e.target.value })}
              placeholder="0"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violeta"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Nota (opcional)</label>
            <input
              type="text"
              value={formTx.nota}
              onChange={e => setFormTx({ ...formTx, nota: e.target.value })}
              placeholder="Cliente X, factura #12…"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violeta"
            />
          </div>
          <button onClick={agregarTx} className="btn-juicy btn-juicy-violet w-full">
            Registrar
          </button>
        </div>
      </Modal>
    </AppLayout>
  )
}
