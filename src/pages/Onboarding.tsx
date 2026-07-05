import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, Flame } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { hoy } from '../utils/formatters'
import { getRangoInfo } from '../utils/xp'
import type { ObjetivoUsuario, PerfilUsuario } from '../types'

// ─── Step data ────────────────────────────────────────────────────────────────

const OBJETIVOS: { value: ObjetivoUsuario; label: string; emoji: string; desc: string }[] = [
  { value: 'ahorrar',   label: 'Ahorrar más',          emoji: '💰', desc: 'Quiero tener un colchón sólido' },
  { value: 'controlar', label: 'Controlar gastos',      emoji: '📊', desc: 'Saber exactamente a dónde va mi plata' },
  { value: 'deudas',    label: 'Salir de deudas',       emoji: '🔓', desc: 'Liquidar lo que debo cuanto antes' },
  { value: 'invertir',  label: 'Empezar a invertir',    emoji: '📈', desc: 'Hacer crecer mi patrimonio' },
  { value: 'libertad',  label: 'Libertad financiera',   emoji: '🏔️', desc: 'Vivir de mis activos, no de mi tiempo' },
]

const OBSTACULOS = [
  { value: 'gastos_impulso',  label: 'Gastos de impulso',     emoji: '🛍️' },
  { value: 'ingresos_bajos',  label: 'Ingresos insuficientes', emoji: '💸' },
  { value: 'sin_habito',      label: 'No tengo el hábito',     emoji: '📅' },
  { value: 'deudas_activas',  label: 'Deudas que me frenan',   emoji: '⛓️' },
  { value: 'no_se_invertir',  label: 'No sé cómo invertir',    emoji: '🤔' },
]

const INTERESES = [
  { value: 'finanzas',   label: 'Finanzas personales', emoji: '💳' },
  { value: 'habitos',    label: 'Hábitos productivos', emoji: '✅' },
  { value: 'tareas',     label: 'Gestión de tareas',   emoji: '📋' },
  { value: 'planificacion', label: 'Planificación semanal', emoji: '📅' },
  { value: 'inversiones', label: 'Inversiones',         emoji: '📈' },
  { value: 'negocios',   label: 'Crecimiento de negocio', emoji: '🚀' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function Onboarding() {
  const { dispatch, state } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [nombre, setNombre] = useState('')
  const [objetivo, setObjetivo] = useState<ObjetivoUsuario | ''>('')
  const [obstaculo, setObstaculo] = useState('')
  const [intereses, setIntereses] = useState<string[]>([])

  const TOTAL_STEPS = 5

  function toggleInteres(v: string) {
    setIntereses(prev => prev.includes(v) ? prev.filter(i => i !== v) : [...prev, v])
  }

  function avanzar() {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1)
  }

  function retroceder() {
    if (step > 0) setStep(s => s - 1)
  }

  function completar() {
    if (!objetivo) return
    const perfil: PerfilUsuario = {
      nombre: nombre.trim() || 'Usuario',
      objetivo: objetivo as ObjetivoUsuario,
      obstaculo,
      intereses,
      onboardingCompletado: true,
      creadoEn: hoy(),
    }
    dispatch({ type: 'COMPLETAR_ONBOARDING', payload: perfil })
    navigate('/')
  }

  const rangoInicial = getRangoInfo(0) // Bronce
  const xpActual = state.xp.total

  const canNext = [
    nombre.trim().length > 0,
    objetivo !== '',
    obstaculo !== '',
    true,
    true,
  ][step]

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <Link to="/landing" className="inline-flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-[#ffd600] flex items-center justify-center shadow-lg shadow-[#ffd600]/20">
            <Flame size={20} className="text-zinc-950" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">CIMA</span>
        </Link>
        <p className="text-zinc-500 text-sm">Tu sistema operativo personal</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-6">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-[#ffd600]' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>
        <p className="text-zinc-600 text-xs mt-2 text-right">Paso {step + 1} de {TOTAL_STEPS}</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-fade-in">

        {/* ── Step 0: Nombre ── */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">¿Cómo te llamás?</h2>
            <p className="text-zinc-400 text-sm mb-6">Para personalizar tu experiencia en CIMA</p>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canNext && avanzar()}
              placeholder="Tu nombre"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ffd600] transition-colors text-lg"
              autoFocus
            />
          </div>
        )}

        {/* ── Step 1: Objetivo ── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">¿Cuál es tu objetivo principal?</h2>
            <p className="text-zinc-400 text-sm mb-6">Elegí uno, podés cambiar después</p>
            <div className="space-y-2">
              {OBJETIVOS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setObjetivo(o.value)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    objetivo === o.value
                      ? 'border-[#ffd600] bg-[#ffd600]/10'
                      : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-2xl">{o.emoji}</span>
                  <div>
                    <p className="text-white font-medium text-sm">{o.label}</p>
                    <p className="text-zinc-500 text-xs">{o.desc}</p>
                  </div>
                  {objetivo === o.value && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-[#ffd600] flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Obstáculo ── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">¿Cuál es tu mayor obstáculo?</h2>
            <p className="text-zinc-400 text-sm mb-6">Así podemos ayudarte mejor</p>
            <div className="space-y-2">
              {OBSTACULOS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setObstaculo(o.value)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    obstaculo === o.value
                      ? 'border-[#ffd600] bg-[#ffd600]/10'
                      : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-2xl">{o.emoji}</span>
                  <p className="text-white text-sm font-medium">{o.label}</p>
                  {obstaculo === o.value && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-[#ffd600] flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Intereses ── */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">¿Qué querés usar en CIMA?</h2>
            <p className="text-zinc-400 text-sm mb-6">Seleccioná todo lo que te interese</p>
            <div className="grid grid-cols-2 gap-2">
              {INTERESES.map(i => (
                <button
                  key={i.value}
                  onClick={() => toggleInteres(i.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                    intereses.includes(i.value)
                      ? 'border-[#ffd600] bg-[#ffd600]/10'
                      : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xl">{i.emoji}</span>
                  <p className="text-white text-xs font-medium leading-snug">{i.label}</p>
                  {intereses.includes(i.value) && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-[#ffd600] flex items-center justify-center flex-shrink-0">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: Welcome + Rank reveal ── */}
        {step === 4 && (
          <div className="text-center">
            <div className="text-5xl mb-4">{rangoInicial.emoji}</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Bienvenido a CIMA{nombre.trim() ? `, ${nombre.trim()}` : ''}!
            </h2>
            <p className="text-zinc-400 text-sm mb-6">
              Empezás con rango <span className="font-semibold" style={{ color: rangoInicial.color }}>
                {rangoInicial.rango}
              </span>. Cada hábito, tarea y transacción que registres te suma XP y te acerca al siguiente rango.
            </p>

            {/* Rank progression preview */}
            <div className="bg-zinc-800 rounded-xl p-4 mb-6 text-left">
              <p className="text-zinc-500 text-xs mb-3 text-center">Tu camino al Élite</p>
              <div className="flex items-center justify-between gap-1">
                {['🥉', '🥈', '🥇', '💎', '💠', '👑'].map((emoji, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center gap-1 flex-1 ${i === 0 ? 'opacity-100' : 'opacity-30'}`}
                  >
                    <span className="text-lg">{emoji}</span>
                    <div className={`w-full h-0.5 rounded ${i === 0 ? 'bg-[#ffd600]' : 'bg-zinc-700'}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* XP bonus notice */}
            <div className="bg-[#ffd600]/10 border border-[#ffd600]/30 rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div className="text-left">
                <p className="text-[#ffd600] font-semibold text-sm">+50 XP de bienvenida</p>
                <p className="text-zinc-400 text-xs">Se acreditarán al confirmar</p>
              </div>
            </div>

            {xpActual > 0 && (
              <p className="text-zinc-600 text-xs mt-3">XP actual: {xpActual}</p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-6">
          {step > 0 && (
            <button
              onClick={retroceder}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-600 transition-colors text-sm"
            >
              <ChevronLeft size={16} />
              Atrás
            </button>
          )}
          <button
            onClick={step === TOTAL_STEPS - 1 ? completar : avanzar}
            disabled={!canNext && step !== 3}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 ${
              canNext || step === 3
                ? 'bg-[#ffd600] hover:bg-[#ffe033] text-zinc-950'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            {step === TOTAL_STEPS - 1 ? (
              <>
                <Check size={16} />
                ¡Empezar!
              </>
            ) : (
              <>
                Continuar
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
