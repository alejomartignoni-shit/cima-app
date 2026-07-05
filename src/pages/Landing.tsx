import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import {
  Flame, CheckCircle2, Zap, ArrowRight, Star,
  Trophy, ListChecks, Wallet, Shield, ChevronRight,
} from 'lucide-react'

// ─── Feature data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Wallet,
    glow: 'rgba(255,214,0,0.15)',
    border: 'rgba(255,214,0,0.25)',
    iconColor: '#ffd600',
    title: 'Finanzas en tiempo real',
    desc: 'Registrá ingresos y gastos en segundos. Presupuestos por categoría, proyección al millón y reportes visuales automáticos.',
  },
  {
    icon: CheckCircle2,
    glow: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.2)',
    iconColor: '#34d399',
    title: 'Hábitos que se sostienen',
    desc: 'Racha diaria, check-ins y logros desbloqueables. Construí rutinas que duran meses, no días.',
  },
  {
    icon: ListChecks,
    glow: 'rgba(129,140,248,0.12)',
    border: 'rgba(129,140,248,0.2)',
    iconColor: '#818cf8',
    title: 'Tareas sin fricción',
    desc: 'Kanban visual, prioridades, fechas límite y planificador semanal. Todo en un solo sistema.',
  },
  {
    icon: Trophy,
    glow: 'rgba(251,146,60,0.12)',
    border: 'rgba(251,146,60,0.2)',
    iconColor: '#fb923c',
    title: 'Sistema de rangos XP',
    desc: 'Cada acción suma XP. Subí de Bronce a Diamante. Las Temporadas te mantienen en la cima.',
  },
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

  const goStart = () => navigate(isOnboarded ? '/' : '/onboarding')
  const goApp   = () => navigate('/')

  return (
    <div className="grain min-h-screen bg-black text-zinc-100 font-sans overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════════════════
          NAV — glass blur, always visible
      ════════════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ffd600] flex items-center justify-center shadow-lg shadow-[#ffd600]/30">
              <Flame size={17} className="text-zinc-950" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">CIMA</span>
          </div>
          <div className="flex items-center gap-3">
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
          HERO — cinematic full-viewport
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-12 px-5 overflow-hidden">

        {/* Star field layer */}
        <div className="stars absolute inset-0 pointer-events-none" />

        {/* Atmospheric glow layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gold spotlight — center bottom */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,214,0,0.5) 0%, rgba(255,140,0,0.15) 35%, transparent 70%)' }}
          />
          {/* Purple accent — top right */}
          <div
            className="absolute -top-20 right-0 w-[600px] h-[500px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.8) 0%, transparent 65%)' }}
          />
          {/* Blue accent — left */}
          <div
            className="absolute top-1/3 -left-20 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.8) 0%, transparent 65%)' }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">

          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#ffd600]/25 bg-[#ffd600]/8 text-[#ffd600] text-xs font-bold tracking-widest uppercase mb-8">
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
          <p className="animate-fade-up-d2 opacity-0 text-[clamp(1rem,2vw,1.25rem)] text-zinc-400 max-w-xl mx-auto leading-relaxed mb-10">
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
              className="text-zinc-500 text-sm font-medium hover:text-zinc-300 transition-colors flex items-center gap-1.5"
            >
              Ver cómo funciona <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Floating app mockup */}
        <div className="relative z-10 mt-20 w-full max-w-3xl mx-auto animate-float">
          {/* Glow rings */}
          <div className="absolute inset-0 -m-8 rounded-3xl opacity-20 blur-3xl" style={{ background: 'radial-gradient(ellipse at center, rgba(255,214,0,0.6) 0%, transparent 65%)' }} />
          <div className="absolute inset-0 -m-4 rounded-3xl opacity-10 blur-xl" style={{ background: 'rgba(255,214,0,0.4)' }} />

          {/* App window chrome */}
          <div className="scanlines relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl shadow-black">
            {/* Window bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="flex-1 mx-4 h-5 rounded-md bg-zinc-800 flex items-center px-3 gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#ffd600]/60 flex items-center justify-center">
                  <Flame size={8} className="text-zinc-950" />
                </div>
                <span className="text-zinc-600 text-[11px] font-medium">cima.app — Inicio</span>
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
                  className="rounded-xl p-3.5 border border-white/5 bg-white/2 backdrop-blur-sm"
                  style={{ background: `linear-gradient(135deg, ${stat.accent}06 0%, transparent 100%)` }}
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
              <div className="rounded-xl border border-white/5 p-4" style={{ background: 'linear-gradient(135deg, rgba(251,146,60,0.04) 0%, transparent 100%)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Temporada actual</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#ffd600]/10 text-[#ffd600] font-bold border border-[#ffd600]/20">T4</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">👑</span>
                  <div>
                    <div className="text-white font-black text-sm">Oro III</div>
                    <div className="text-zinc-500 text-[10px] mt-0.5">4,200 / 5,000 XP</div>
                  </div>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '84%', background: 'linear-gradient(90deg, #ffd600, #fb923c)' }} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-zinc-600 text-[10px]">800 XP para Oro IV</span>
                  <span className="text-[#fb923c] text-[10px] font-bold">+230 hoy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 mt-14 flex flex-col items-center gap-2 animate-bounce opacity-40">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-zinc-600" />
          <span className="text-zinc-600 text-xs tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          MANIFESTO — single powerful line
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 px-5 border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,214,0,0.02) 0%, transparent 50%, rgba(139,92,246,0.02) 100%)' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
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
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-28 px-5 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#ffd600] text-xs font-bold tracking-[0.25em] uppercase mb-4">Funcionalidades</div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight text-white leading-tight">
              No es una app de finanzas.
              <br />
              <span className="text-zinc-400 font-light italic">Es tu sistema completo.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group relative p-6 rounded-2xl border transition-all duration-500 hover:-translate-y-1 cursor-default"
                style={{
                  background: `linear-gradient(135deg, ${f.glow} 0%, transparent 60%)`,
                  borderColor: f.border,
                  animationDelay: `${i * 100}ms`,
                }}
              >
                {/* Top glow line */}
                <div className="absolute inset-x-0 top-0 h-px rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${f.iconColor}50, transparent)` }} />

                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 shadow-lg"
                  style={{ background: `${f.iconColor}15`, border: `1px solid ${f.iconColor}30`, boxShadow: `0 0 20px ${f.iconColor}15` }}
                >
                  <f.icon size={20} style={{ color: f.iconColor }} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2 tracking-tight">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          STATS ROW
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-5 border-y border-white/5" style={{ background: 'linear-gradient(180deg, #000 0%, #0a0a0c 100%)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { val: '10k+',  label: 'usuarios activos' },
            { val: '$2.4M', label: 'registrados en la app' },
            { val: '94%',   label: 'mejoran sus hábitos' },
            { val: '14d',   label: 'de Pro — gratis' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="text-3xl sm:text-4xl font-black text-[#ffd600] leading-none">{s.val}</span>
              <span className="text-zinc-500 text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-5 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#ffd600] text-xs font-bold tracking-[0.25em] uppercase mb-4">Cómo funciona</div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight text-white">
              3 pasos. Resultados reales.
            </h2>
          </div>

          <div className="relative grid sm:grid-cols-3 gap-6">
            {/* Connecting line (desktop) */}
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
              <div key={step.n} className="relative z-10 text-center">
                <div className="inline-flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl relative"
                    style={{ background: 'rgba(255,214,0,0.08)', border: '1px solid rgba(255,214,0,0.2)', boxShadow: '0 0 30px rgba(255,214,0,0.05)' }}>
                    {step.icon}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ffd600] flex items-center justify-center">
                      <span className="text-zinc-950 text-[10px] font-black">{i + 1}</span>
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 tracking-tight">{step.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-[220px] mx-auto">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          PRICING
      ════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-28 px-5" style={{ background: 'linear-gradient(180deg, #000 0%, #070709 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#ffd600] text-xs font-bold tracking-[0.25em] uppercase mb-4">Planes</div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight text-white mb-3">
              Empezá gratis.
              <br />
              <span className="text-zinc-500 font-light italic">Quedate por los resultados.</span>
            </h2>
            <p className="text-zinc-500">14 días de Pro incluidos. Sin tarjeta de crédito.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Free */}
            <div className="rounded-2xl bg-zinc-900/60 border border-white/8 p-7 flex flex-col">
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

            {/* Pro — cinematic gold border */}
            <div className="gold-border-card flex flex-col p-7 relative overflow-hidden">
              {/* Inner glow */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(255,214,0,0.08) 0%, transparent 60%)' }} />
              {/* Top glow beam */}
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
          </div>

          <p className="text-center mt-8 text-zinc-600 text-sm flex items-center justify-center gap-2">
            <Shield size={13} /> Plan anual disponible — ahorrá 2 meses ($59/año)
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-5 bg-zinc-950 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black text-white tracking-tight">Lo que dicen</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { name: 'Valentina M.', role: 'Diseñadora freelance', text: 'Finalmente entiendo a dónde va mi plata. 3 meses de racha y el sistema XP me hace seguir.',     stars: 5 },
              { name: 'Santiago R.', role: 'Emprendedor',          text: 'Lo uso todos los días. Combinar finanzas, hábitos y tareas en un solo lugar cambió mi rutina.', stars: 5 },
              { name: 'Lucía P.',    role: 'Estudiante',           text: 'Ahorré mis primeros $50k con esta app. La gamificación hace que no se sienta un esfuerzo.',     stars: 5 },
            ].map(t => (
              <div
                key={t.name}
                className="relative p-6 rounded-2xl border border-white/6 bg-zinc-900/50"
              >
                {/* Quote mark */}
                <div className="text-5xl font-black text-zinc-800 leading-none mb-2 select-none">"</div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={12} fill="#ffd600" className="text-[#ffd600]" />
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
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FINAL CTA — mirror hero energy
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-36 px-5 overflow-hidden" style={{ background: '#000' }}>
        {/* Atmospheric glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-25"
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,214,0,0.6) 0%, rgba(255,140,0,0.2) 40%, transparent 70%)' }} />
        </div>
        <div className="stars absolute inset-0 opacity-50" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-[#ffd600] items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#ffd600]/30 animate-float">
            <Flame size={30} className="text-zinc-950" />
          </div>

          <h2 className="text-[clamp(2.5rem,7vw,6rem)] font-black text-white tracking-tight leading-[0.95] mb-6">
            ¿Listo para llegar<br />
            a la <span className="shimmer-text">cima</span>?
          </h2>

          <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
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

          <div className="flex items-center justify-center gap-6 mt-8 text-zinc-700 text-xs">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-zinc-600" /> Sin tarjeta</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-zinc-600" /> Cancelás cuando querés</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-zinc-600" /> Datos locales · Privados</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-8 px-5 bg-black">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#ffd600] flex items-center justify-center">
              <Flame size={12} className="text-zinc-950" />
            </div>
            <span className="text-zinc-500 font-black text-sm tracking-tight">CIMA</span>
          </div>
          <div className="flex items-center gap-6 text-zinc-700 text-xs">
            <span>© 2026 CIMA App</span>
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
