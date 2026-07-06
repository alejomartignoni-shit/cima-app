import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { Reveal } from '../components/ui/Reveal'
import { TiltCard } from '../components/ui/TiltCard'
import {
  Flame, CheckCircle2, Zap, ArrowRight, Star,
  Trophy, ListChecks, Wallet, Shield, ChevronRight, Sparkles,
} from 'lucide-react'

// ─── Feature data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Wallet,
    iconColor: '#ffd600',
    title: 'Finanzas en tiempo real',
    desc: 'Ingresos, gastos, presupuestos, costos fijos e inversiones en un solo lugar. Proyección al millón y reportes automáticos.',
  },
  {
    icon: CheckCircle2,
    iconColor: '#34d399',
    title: 'Hábitos que se sostienen',
    desc: 'Racha diaria, check-ins y logros desbloqueables. Construí rutinas que duran meses, no días.',
  },
  {
    icon: ListChecks,
    iconColor: '#38bdf8',
    title: 'Tareas sin fricción',
    desc: 'Kanban visual, prioridades, fechas límite y planificador semanal. Todo en un solo sistema.',
  },
  {
    icon: Trophy,
    iconColor: '#7c5cfc',
    title: 'Sistema de rangos XP',
    desc: 'Cada acción suma XP. Subí de Bronce a Diamante. Las Temporadas te mantienen en la cima.',
  },
]

const MARQUEE_ITEMS = [
  'Racha diaria', 'XP por cada acción', 'Rangos Bronce → Diamante', 'Temporadas',
  'Presupuestos', 'Costos fijos', 'Suscripciones de software', 'Inversiones',
  'Fondo de emergencia', 'Cashflow diario · semanal · mensual', 'Modo empresario',
  'Proyección al millón', 'Hábitos', 'Kanban de tareas',
  'Planificador semanal', 'Logros desbloqueables', 'Dashboards', 'Recompensas',
]

const FREE_FEATURES = [
  'Transacciones básicas (50/mes)',
  'Hábitos (hasta 5)',
  'Tareas ilimitadas',
  'Dashboard de inicio',
  'Racha diaria',
]

const PRO_FEATURES = [
  'Todo lo del plan gratuito',
  'Transacciones ilimitadas',
  'Hábitos ilimitados',
  'XP · Rangos · Temporadas',
  'Proyección financiera avanzada',
  'Presupuestos por categoría',
  'Costos fijos y suscripciones',
  'Ahorros y fondo de emergencia',
  'Portfolio de inversiones y activos',
  'Cashflow diario/semanal/mensual',
  'Modo empresario: espacios por negocio',
  'Dashboards y reportes',
  'Planificador semanal',
  'Merch exclusivo desbloqueado',
  'Soporte prioritario',
]

// ─── Component ─────────────────────────────────────────────────────────────────

export function Landing() {
  const navigate = useNavigate()
  const { state } = useApp()
  const isOnboarded = state.perfil?.onboardingCompletado
  const heroBgRef = useRef<HTMLDivElement>(null)

  const goStart = () => navigate(isOnboarded ? '/' : '/onboarding')
  const goApp   = () => navigate('/')
  const goPro   = () => navigate('/pro')

  // Parallax sutil del fondo del hero
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = heroBgRef.current
        if (!el) return
        const y = Math.min(window.scrollY, window.innerHeight)
        el.style.setProperty('--parallax', `${y * 0.25}px`)
        el.style.opacity = String(Math.max(1 - y / (window.innerHeight * 0.9), 0))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="grain min-h-screen bg-abyss text-zinc-100 font-sans overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════════════════
          NAV — glass blur, always visible
      ════════════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ffd600] flex items-center justify-center shadow-lg shadow-[#ffd600]/30">
              <Flame size={17} className="text-zinc-950" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">CIMA</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={goPro} className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-violeta hover:text-phantom transition-colors">
              <Sparkles size={13} /> CIMA Pro
            </button>
            {isOnboarded ? (
              <button onClick={goApp} className="flex items-center gap-1.5 text-sm font-semibold text-zinc-300 hover:text-white transition-colors">
                Ir al app <ChevronRight size={14} />
              </button>
            ) : (
              <>
                <button onClick={goApp} className="hidden sm:block text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                  Iniciar sesión
                </button>
                <button
                  onClick={goStart}
                  className="px-4 py-2 rounded-lg bg-[#ffd600] text-zinc-950 text-sm font-bold hover:bg-[#ffe033] transition-all shadow-md shadow-[#ffd600]/20"
                >
                  Empezar gratis
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════════
          HERO — montaña cinemática full-viewport
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-5 overflow-hidden">

        {/* Montaña: Ken Burns + parallax */}
        <div
          ref={heroBgRef}
          className="absolute inset-0 pointer-events-none"
          style={{ transform: 'translateY(var(--parallax, 0px))' }}
        >
          <div
            className="kenburns-layer"
            style={{ backgroundImage: `url(${import.meta.env.BASE_URL}cinematic/montana.webp)` }}
          />
          {/* Legibilidad: viñeta + fade inferior */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 45%, transparent 30%, rgba(5,5,7,0.72) 78%, #050507 100%)' }} />
          <div className="absolute inset-x-0 bottom-0 h-64" style={{ background: 'linear-gradient(180deg, transparent, #050507)' }} />
          <div className="absolute inset-x-0 top-0 h-40" style={{ background: 'linear-gradient(0deg, transparent, rgba(5,5,7,0.85))' }} />
        </div>

        {/* Star field + aurora */}
        <div className="stars absolute inset-0 pointer-events-none opacity-70" />
        <div className="aurora-bg absolute inset-0 pointer-events-none" />

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">

          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#ffd600]/25 bg-black/40 backdrop-blur-md text-[#ffd600] text-xs font-bold tracking-widest uppercase mb-8">
            <Zap size={11} fill="currentColor" />
            14 días de Pro — Gratis
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up-d1 opacity-0 text-[clamp(2.8rem,8vw,7.5rem)] font-black leading-[0.93] tracking-[-0.03em] mb-7">
            <span className="text-white block">El sistema que</span>
            <span className="text-white block">te lleva a la</span>
            <span className="shimmer-text block">CIMA.</span>
          </h1>

          {/* Sub */}
          <p className="animate-fade-up-d2 opacity-0 text-[clamp(1rem,2vw,1.25rem)] text-zinc-300 max-w-xl mx-auto leading-relaxed mb-10">
            Finanzas, hábitos y tareas en un sistema gamificado.
            <br className="hidden sm:block" />
            Cada día que usás la app, subís de rango.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up-d3 opacity-0 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={goStart}
              className="animate-glow-pulse group relative flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#ffd600] text-zinc-950 font-black text-base hover:bg-[#ffe033] transition-all shadow-2xl shadow-[#ffd600]/30 hover:-translate-y-1"
            >
              Empezar gratis — es ahora
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-zinc-400 text-sm font-medium hover:text-white transition-colors flex items-center gap-1.5"
            >
              Ver cómo funciona <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Floating app mockup — glass window */}
        <div className="relative z-10 mt-20 w-full max-w-3xl mx-auto animate-float">
          <div className="absolute inset-0 -m-8 rounded-3xl opacity-25 blur-3xl" style={{ background: 'radial-gradient(ellipse at center, rgba(124,92,252,0.5) 0%, rgba(56,189,248,0.25) 45%, transparent 70%)' }} />

          <div className="scanlines glow-ring relative rounded-2xl overflow-hidden glass-card bg-black/60 shadow-2xl shadow-black">
            {/* Window bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="flex-1 mx-4 h-5 rounded-md bg-white/5 flex items-center px-3 gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#ffd600]/60 flex items-center justify-center">
                  <Flame size={8} className="text-zinc-950" />
                </div>
                <span className="text-zinc-500 text-[11px] font-medium">cima.app — Inicio</span>
              </div>
            </div>

            {/* App content */}
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Balance',   value: '$127,400', sub: '+$23k este mes',  accent: '#ffd600',  icon: '💰' },
                { label: 'Racha',     value: '23 días',  sub: 'Récord: 31',      accent: '#fb923c',  icon: '🔥' },
                { label: 'Rango',     value: 'Oro III',  sub: '94% → Oro IV',    accent: '#facc15',  icon: '👑' },
                { label: 'Tareas',    value: '8 / 11',   sub: 'Para hoy',        accent: '#34d399',  icon: '✅' },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="rounded-xl p-3.5 border border-white/5 backdrop-blur-sm"
                  style={{ background: `linear-gradient(135deg, ${stat.accent}08 0%, transparent 100%)` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-500 text-xs font-medium">{stat.label}</span>
                    <span className="text-base leading-none">{stat.icon}</span>
                  </div>
                  <div className="text-white font-black text-base leading-tight">{stat.value}</div>
                  <div className="text-[11px] mt-1.5 font-medium" style={{ color: stat.accent }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Habits */}
              <div className="rounded-xl border border-white/5 p-4" style={{ background: 'linear-gradient(135deg, rgba(255,214,0,0.04) 0%, transparent 100%)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Hábitos de hoy</span>
                  <span className="text-[#ffd600] text-xs font-bold">2/3</span>
                </div>
                {[
                  { name: 'Ejercicio 30min', done: true },
                  { name: 'Leer 20 páginas', done: true },
                  { name: 'Sin gastos extra', done: false },
                ].map(h => (
                  <div key={h.name} className="flex items-center gap-2.5 py-1.5">
                    <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 ${h.done ? 'bg-[#ffd600] border-[#ffd600]' : 'border-zinc-600'}`}>
                      {h.done && <span className="text-zinc-950 text-[8px] font-black">✓</span>}
                    </div>
                    <span className={`text-xs ${h.done ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{h.name}</span>
                  </div>
                ))}
              </div>

              {/* XP */}
              <div className="rounded-xl border border-white/5 p-4" style={{ background: 'linear-gradient(135deg, rgba(124,92,252,0.06) 0%, transparent 100%)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Temporada actual</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-violeta/10 text-phantom font-bold border border-violeta/25">T4</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">👑</span>
                  <div>
                    <div className="text-white font-black text-sm">Oro III</div>
                    <div className="text-zinc-500 text-[10px] mt-0.5">4,200 / 5,000 XP</div>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '84%', background: 'linear-gradient(90deg, #7c5cfc, #38bdf8)' }} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-zinc-600 text-[10px]">800 XP para Oro IV</span>
                  <span className="text-phantom text-[10px] font-bold">+230 hoy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 mt-14 flex flex-col items-center gap-2 animate-bounce opacity-40">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-zinc-500" />
          <span className="text-zinc-500 text-xs tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          MARQUEE — banda infinita
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-6 border-y border-white/5 bg-black/40 overflow-hidden marquee-mask">
        <div className="marquee-track items-center gap-0">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-3 px-6 text-sm font-semibold text-zinc-500 whitespace-nowrap">
              <Flame size={11} className="text-[#ffd600]/60" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          MANIFESTO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-5 overflow-hidden">
        <div className="aurora-bg absolute inset-0 opacity-60" />
        <Reveal className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-[clamp(1.4rem,4vw,2.8rem)] font-black leading-tight tracking-tight text-white">
            Cada día que no tomás control,
            <span className="text-zinc-500"> alguien más </span>
            <br className="hidden sm:block" />
            está subiendo de nivel.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-px w-16 bg-zinc-800" />
            <Flame size={14} className="text-[#ffd600]" />
            <div className="h-px w-16 bg-zinc-800" />
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FEATURES — glass tilt cards
      ════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative py-28 px-5 bg-abyss">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="text-[#ffd600] text-xs font-bold tracking-[0.25em] uppercase mb-4">Funcionalidades</div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight text-white leading-tight">
              No es una app de finanzas.
              <br />
              <span className="text-gradient-violet font-black">Es tu sistema completo.</span>
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <TiltCard className="group relative h-full p-6 rounded-2xl glass-card glass-card-hover cursor-default overflow-hidden">
                  {/* Top glow line */}
                  <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${f.iconColor}60, transparent)` }} />
                  {/* Hover glow blob */}
                  <div
                    className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none"
                    style={{ background: `${f.iconColor}18` }}
                  />
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${f.iconColor}12`, border: `1px solid ${f.iconColor}30`, boxShadow: `0 0 20px ${f.iconColor}15` }}
                  >
                    <f.icon size={20} style={{ color: f.iconColor }} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          STATS ROW
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-5 border-y border-white/5" style={{ background: 'linear-gradient(180deg, #050507 0%, #0a0a0e 100%)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { val: '10k+',  label: 'usuarios activos' },
            { val: '$2.4M', label: 'registrados en la app' },
            { val: '94%',   label: 'mejoran sus hábitos' },
            { val: '14d',   label: 'de Pro — gratis' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80} direction="scale">
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl sm:text-4xl font-black text-gradient-ice leading-none">{s.val}</span>
                <span className="text-zinc-500 text-sm">{s.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-5 bg-abyss">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="text-[#ffd600] text-xs font-bold tracking-[0.25em] uppercase mb-4">Cómo funciona</div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight text-white">
              3 pasos. Resultados reales.
            </h2>
          </Reveal>

          <div className="relative grid sm:grid-cols-3 gap-6">
            <div className="hidden sm:block absolute top-8 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px border-t border-dashed border-zinc-800 z-0" />

            {[
              {
                n: '01', title: 'Configurá tu perfil',
                desc: 'Elegí tu objetivo, personalizá en 2 minutos. Ya tenés 50 XP de bienvenida.',
                icon: '⚡',
              },
              {
                n: '02', title: 'Registrá todo',
                desc: 'Gastos, hábitos, tareas. La app construye tu historial y te muestra patrones.',
                icon: '📊',
              },
              {
                n: '03', title: 'Llegá a la cima',
                desc: 'XP, rangos, logros y temporadas. Tu progreso real, gamificado.',
                icon: '👑',
              },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 130} className="relative z-10 text-center">
                <div className="inline-flex flex-col items-center">
                  <div className="glass-card w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl relative"
                    style={{ boxShadow: '0 0 30px rgba(124,92,252,0.08)' }}>
                    {step.icon}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ffd600] flex items-center justify-center">
                      <span className="text-zinc-950 text-[10px] font-black">{i + 1}</span>
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 tracking-tight">{step.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-[220px] mx-auto">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          PRICING
      ════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="relative py-28 px-5 overflow-hidden" style={{ background: 'linear-gradient(180deg, #050507 0%, #08070c 100%)' }}>
        <div className="aurora-bg absolute inset-0 opacity-50" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="text-[#ffd600] text-xs font-bold tracking-[0.25em] uppercase mb-4">Planes</div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight text-white mb-3">
              Empezá gratis.
              <br />
              <span className="text-zinc-500 font-light italic">Quedate por los resultados.</span>
            </h2>
            <p className="text-zinc-500">14 días de Pro incluidos. Sin tarjeta de crédito.</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Free */}
            <Reveal direction="left">
              <div className="glass-card glass-card-hover h-full rounded-2xl p-7 flex flex-col">
                <div className="mb-6">
                  <div className="text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase mb-3">Gratis</div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-5xl font-black text-white">$0</span>
                    <span className="text-zinc-500 text-sm mb-2">/mes</span>
                  </div>
                  <p className="text-zinc-500 text-sm">Para empezar sin compromisos.</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {FREE_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="text-zinc-600 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-400 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={goStart}
                  className="w-full py-3.5 rounded-xl border border-zinc-700 text-zinc-300 font-bold text-sm hover:border-zinc-500 hover:text-white transition-all"
                >
                  Empezar gratis
                </button>
              </div>
            </Reveal>

            {/* Pro — cinematic gold border */}
            <Reveal direction="right" delay={120}>
              <div className="gold-border-card h-full flex flex-col p-7 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(255,214,0,0.08) 0%, transparent 60%)' }} />
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,214,0,0.8), transparent)' }} />

                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full shadow-lg shadow-[#ffd600]/20"
                  style={{ background: 'linear-gradient(90deg, #ffd600, #ffb300)', color: '#000' }}>
                  <span className="text-xs font-black tracking-wider">✦ MÁS POPULAR</span>
                </div>

                <div className="relative z-10 mb-6 mt-2">
                  <div className="text-[#ffd600] text-xs font-bold tracking-[0.2em] uppercase mb-3">Pro</div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-5xl font-black text-white">$7</span>
                    <span className="text-zinc-400 text-sm mb-2">/mes</span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'rgba(255,214,0,0.8)' }}>
                    🎁 14 días gratis — sin tarjeta
                  </p>
                </div>

                <ul className="relative z-10 space-y-3 mb-8 flex-1">
                  {PRO_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="text-[#ffd600] mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-300 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={goStart}
                  className="relative z-10 w-full py-4 rounded-xl font-black text-sm transition-all hover:-translate-y-0.5 shadow-xl shadow-[#ffd600]/20 hover:shadow-[#ffd600]/35"
                  style={{ background: 'linear-gradient(135deg, #ffd600, #ffb300)', color: '#000' }}
                >
                  Empezar prueba gratuita →
                </button>
                <p className="relative z-10 text-center text-zinc-600 text-xs mt-3">
                  Sin tarjeta · Cancelás cuando querés
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <p className="text-center mt-8 text-zinc-600 text-sm flex items-center justify-center gap-2">
              <Shield size={13} /> Plan anual disponible — ahorrá 2 meses ($59/año) ·
              <button onClick={goPro} className="text-violeta hover:text-phantom font-semibold transition-colors">
                Conocé CIMA Pro →
              </button>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-5 bg-abyss border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black text-white tracking-tight">Lo que dicen</h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { name: 'Valentina M.', role: 'Diseñadora freelance', text: 'Finalmente entiendo a dónde va mi plata. 3 meses de racha y el sistema XP me hace seguir.',     stars: 5 },
              { name: 'Santiago R.', role: 'Emprendedor',          text: 'Lo uso todos los días. Combinar finanzas, hábitos y tareas en un solo lugar cambió mi rutina.', stars: 5 },
              { name: 'Lucía P.',    role: 'Estudiante',           text: 'Ahorré mis primeros $50k con esta app. La gamificación hace que no se sienta un esfuerzo.',     stars: 5 },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="glass-card glass-card-hover relative h-full p-6 rounded-2xl">
                  <div className="text-5xl font-black text-zinc-800 leading-none mb-2 select-none">"</div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={12} fill="#ffd600" className="text-[#ffd600]" />
                    ))}
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ffd600]/10 border border-[#ffd600]/20 flex items-center justify-center">
                      <Flame size={12} className="text-[#ffd600]" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">{t.name}</div>
                      <div className="text-zinc-600 text-xs">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FINAL CTA — oso polar cinemático
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-40 px-5 overflow-hidden">
        {/* Fondo oso */}
        <div className="absolute inset-0">
          <div
            className="kenburns-layer"
            style={{ backgroundImage: `url(${import.meta.env.BASE_URL}cinematic/oso.webp)`, animationDuration: '45s' }}
          />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(5,5,7,0.45) 0%, rgba(5,5,7,0.88) 75%, #050507 100%)' }} />
        </div>

        <Reveal className="relative z-10 max-w-2xl mx-auto text-center" direction="scale">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-[#ffd600] items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#ffd600]/30 animate-float">
            <Flame size={30} className="text-zinc-950" />
          </div>

          <h2 className="text-[clamp(2.5rem,7vw,6rem)] font-black text-white tracking-tight leading-[0.95] mb-6">
            ¿Listo para llegar<br />
            a la <span className="shimmer-text">cima</span>?
          </h2>

          <p className="text-zinc-300 text-lg mb-10 leading-relaxed">
            14 días de Pro gratis. Sin tarjeta. Sin riesgo.<br />
            Solo vos, tu sistema y tus resultados.
          </p>

          <button
            onClick={goStart}
            className="animate-glow-pulse group inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg transition-all hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #ffd600, #ffb300)', color: '#000', boxShadow: '0 0 40px rgba(255,214,0,0.3)' }}
          >
            Empezar ahora — es gratis
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-6 mt-8 text-zinc-400 text-xs">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Sin tarjeta</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Cancelás cuando querés</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Datos locales · Privados</span>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-8 px-5 bg-abyss">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#ffd600] flex items-center justify-center">
              <Flame size={12} className="text-zinc-950" />
            </div>
            <span className="text-zinc-500 font-black text-sm tracking-tight">CIMA</span>
          </div>
          <div className="flex items-center gap-6 text-zinc-700 text-xs">
            <span>© 2026 CIMA App</span>
            <button onClick={goPro} className="hover:text-zinc-500 transition-colors">
              CIMA Pro
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-zinc-500 transition-colors"
            >
              Precios
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-zinc-500 transition-colors"
            >
              Funciones
            </button>
            <button onClick={goStart} className="hover:text-zinc-500 transition-colors">
              Empezar
            </button>
          </div>
        </div>
      </footer>

    </div>
  )
}
