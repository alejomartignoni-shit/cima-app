import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Reveal } from '../components/ui/Reveal'
import { TiltCard } from '../components/ui/TiltCard'
import {
  Flame, ArrowRight, CheckCircle2, X, ChevronDown, Sparkles,
  TrendingUp, Trophy, Calendar, BarChart3, Wallet, Shield, Star, Zap, Coins, Briefcase,
} from 'lucide-react'

// ─── Copy data ─────────────────────────────────────────────────────────────────

const PAINS = [
  'Empezás con toda la energía en enero y en marzo ya abandonaste.',
  'No tenés idea de a dónde se va tu plata cada mes.',
  'Tenés las metas claras pero cero sistema para sostenerlas.',
  'Probaste 10 apps de finanzas y todas te aburrieron en una semana.',
]

const PRO_BLOCKS = [
  {
    icon: TrendingUp,
    color: '#38bdf8',
    title: 'Proyección al millón',
    desc: 'Ves exactamente cuántos meses te faltan para tu meta según tu ritmo real de ahorro. No es magia: es tu propia data proyectada en el tiempo.',
    bullets: ['Escenarios optimista / realista / actual', 'Meta configurable', 'Actualización automática con cada transacción'],
  },
  {
    icon: Trophy,
    color: '#7c5cfc',
    title: 'XP, Rangos y Temporadas',
    desc: 'Cada gasto registrado, cada hábito cumplido y cada tarea cerrada suma XP. Subís de Bronce a Diamante. Cada temporada, el contador se reinicia y volvés a competir.',
    bullets: ['7 rangos con recompensas', 'Temporadas de 3 meses', 'Logros desbloqueables'],
  },
  {
    icon: BarChart3,
    color: '#34d399',
    title: 'Dashboards y reportes',
    desc: 'Gráficos de gastos por categoría, evolución mensual, comparativas. Tu situación financiera completa en una pantalla, sin planillas.',
    bullets: ['Reportes por categoría y mes', 'Tendencias de ingresos vs gastos', 'Exportá tu historial'],
  },
  {
    icon: Coins,
    color: '#ffd600',
    title: 'Patrimonio completo',
    desc: 'Inversiones con P&L en tiempo real, activos que generan renta, fondo de emergencia con semáforo de cobertura y el radar de costos fijos que detecta las suscripciones que te desangran.',
    bullets: ['P&L por posición y total', 'Renta pasiva de tus activos', 'Meses de emergencia cubiertos'],
  },
  {
    icon: Briefcase,
    color: '#f472b6',
    title: 'Modo empresario',
    desc: 'Un espacio por negocio, con sus finanzas desglosadas y separadas de las personales: balance, cashflow de 6 meses, margen del mes y movimientos por categoría.',
    bullets: ['Espacios ilimitados por negocio', 'Margen y cashflow por empresa', 'Números personales y de negocio sin mezclar'],
  },
  {
    icon: Calendar,
    color: '#fb923c',
    title: 'Planificador semanal',
    desc: 'Organizá la semana en bloques: tareas, hábitos y revisión financiera. El domingo planificás, el resto de la semana ejecutás.',
    bullets: ['Vista semanal completa', 'Kanban de tareas con prioridades', 'Hábitos ilimitados'],
  },
]

const TESTIMONIALS = [
  { name: 'Martín G.', role: 'Consultor', text: 'Pagué el año completo a los 3 días de probarlo. La proyección al millón me ordenó la cabeza como ninguna planilla.' },
  { name: 'Camila F.', role: 'Médica', text: 'El sistema de temporadas es adictivo en el buen sentido. Llevo 2 temporadas seguidas en Platino y mis ahorros lo reflejan.' },
  { name: 'Franco D.', role: 'Programador', text: 'Soy de abandonar apps a la semana. Acá llevo 5 meses. La diferencia es que esto se siente un juego, no una obligación.' },
]

const FAQS = [
  {
    q: '¿Necesito tarjeta para probar Pro?',
    a: 'No. Los 14 días de prueba son sin tarjeta. Si al final no te sirve, no hacés nada y seguís en el plan gratuito. Sin cargos sorpresa.',
  },
  {
    q: '¿Qué pasa con mis datos si cancelo?',
    a: 'Nada. Tus datos viven en tu dispositivo. Si cancelás Pro, conservás todo tu historial y seguís usando las funciones del plan gratuito.',
  },
  {
    q: '¿En qué se diferencia de otras apps de finanzas?',
    a: 'Las demás apps te muestran números. CIMA te hace volver todos los días: racha, XP, rangos y temporadas convierten el hábito financiero en un juego que querés seguir jugando.',
  },
  {
    q: '¿Funciona sin conexión?',
    a: 'Sí. CIMA es una PWA: se instala en tu teléfono y funciona offline. Los datos se guardan localmente en tu dispositivo.',
  },
  {
    q: '¿Puedo pagar en pesos argentinos?',
    a: 'Sí. El precio se convierte a ARS al tipo de cambio del día con todos los medios de pago locales.',
  },
]

// ─── FAQ accordion ─────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="text-white font-bold text-sm sm:text-base">{q}</span>
        <ChevronDown
          size={18}
          className={`text-zinc-500 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        ref={bodyRef}
        className="overflow-hidden transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 400}px` : '0px' }}
      >
        <p className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function Ventas() {
  const navigate = useNavigate()
  const goStart = () => navigate('/onboarding')
  const goLanding = () => navigate('/landing')

  return (
    <div className="grain min-h-screen bg-abyss text-zinc-100 font-sans overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <button onClick={goLanding} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ffd600] flex items-center justify-center shadow-lg shadow-[#ffd600]/30">
              <Flame size={17} className="text-zinc-950" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">CIMA</span>
            <span className="text-phantom font-black text-xs tracking-[0.2em] uppercase mt-1">Pro</span>
          </button>
          <button
            onClick={goStart}
            className="px-4 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #7c5cfc, #38bdf8)', color: '#fff', boxShadow: '0 4px 20px rgba(124,92,252,0.35)' }}
          >
            Probar 14 días gratis
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════════
          HERO — promesa
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 px-5 overflow-hidden">
        <div className="aurora-bg absolute inset-0" />
        <div className="stars absolute inset-0 opacity-60" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(124,92,252,0.7) 0%, rgba(56,189,248,0.3) 50%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violeta/30 bg-violeta/10 text-phantom text-xs font-bold tracking-widest uppercase mb-8">
            <Sparkles size={11} />
            CIMA Pro — 14 días gratis
          </div>

          <h1 className="animate-fade-up-d1 opacity-0 text-[clamp(2.4rem,7vw,6rem)] font-black leading-[0.98] tracking-[-0.03em] mb-7">
            <span className="text-white block">Tu libertad financiera</span>
            <span className="text-white block">no necesita motivación.</span>
            <span className="text-gradient-violet block">Necesita un sistema.</span>
          </h1>

          <p className="animate-fade-up-d2 opacity-0 text-[clamp(1rem,2vw,1.3rem)] text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-10">
            La motivación se agota en semanas. CIMA Pro convierte tus finanzas en un juego
            que querés seguir jugando: XP, rangos, temporadas y proyección real hacia tu meta.
          </p>

          <div className="animate-fade-up-d3 opacity-0 flex flex-col items-center gap-4">
            <button
              onClick={goStart}
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg transition-all hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #7c5cfc, #38bdf8)', color: '#fff', boxShadow: '0 0 50px rgba(124,92,252,0.4)' }}
            >
              Empezar mi prueba gratis
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-zinc-500 text-xs">Sin tarjeta · Cancelás cuando querés</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          DOLOR — agitación
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-5 border-y border-white/5 bg-black/40">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className="text-[clamp(1.8rem,4.5vw,3rem)] font-black tracking-tight text-white leading-tight">
              ¿Te suena familiar?
            </h2>
          </Reveal>
          <div className="space-y-4">
            {PAINS.map((pain, i) => (
              <Reveal key={pain} delay={i * 90} direction={i % 2 === 0 ? 'left' : 'right'}>
                <div className="glass-card flex items-start gap-4 p-5 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center flex-shrink-0">
                    <X size={15} className="text-rose-400" />
                  </div>
                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed pt-1">{pain}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={150}>
            <p className="text-center mt-12 text-[clamp(1.2rem,3vw,1.8rem)] font-black text-white leading-snug">
              El problema no sos vos.
              <br />
              <span className="text-gradient-ice">Es que nadie te dio un sistema que enganche.</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          AUTO — sección cinemática de velocidad
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-40 px-5 overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="kenburns-layer"
            style={{ backgroundImage: `url(${import.meta.env.BASE_URL}cinematic/auto.webp)`, animationDuration: '40s' }}
          />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 85% 75% at 50% 50%, rgba(5,5,7,0.35) 0%, rgba(5,5,7,0.9) 80%, #050507 100%)' }} />
        </div>
        <Reveal className="relative z-10 max-w-3xl mx-auto text-center" direction="scale">
          <div className="text-phantom text-xs font-bold tracking-[0.3em] uppercase mb-5">La diferencia</div>
          <p className="text-[clamp(1.6rem,4.5vw,3.2rem)] font-black text-white leading-tight tracking-tight">
            Mientras los demás dependen de la fuerza de voluntad,
            <span className="text-gradient-violet"> vos vas a tener un sistema que trabaja solo.</span>
          </p>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          PRODUCTO — bloques Pro alternados
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-5 bg-abyss">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-20">
            <div className="text-phantom text-xs font-bold tracking-[0.25em] uppercase mb-4">Qué desbloquea Pro</div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight text-white leading-tight">
              4 armas que el plan
              <br />
              gratuito no tiene.
            </h2>
          </Reveal>

          <div className="space-y-6">
            {PRO_BLOCKS.map((block, i) => (
              <Reveal key={block.title} delay={60} direction={i % 2 === 0 ? 'left' : 'right'}>
                <TiltCard maxTilt={3} className="glass-card glass-card-hover relative rounded-3xl p-7 sm:p-9 overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${block.color}60, transparent)` }} />
                  <div
                    className="absolute -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30"
                    style={{ background: `${block.color}20`, [i % 2 === 0 ? 'right' : 'left']: '-4rem' }}
                  />
                  <div className={`relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-10 items-start ${i % 2 !== 0 ? 'sm:flex-row-reverse' : ''}`}>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${block.color}12`, border: `1px solid ${block.color}35`, boxShadow: `0 0 30px ${block.color}18` }}
                    >
                      <block.icon size={26} style={{ color: block.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-black text-xl sm:text-2xl tracking-tight mb-3">{block.title}</h3>
                      <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-5">{block.desc}</p>
                      <ul className="flex flex-wrap gap-x-6 gap-y-2">
                        {block.bullets.map(b => (
                          <li key={b} className="flex items-center gap-2 text-sm text-zinc-300">
                            <CheckCircle2 size={13} style={{ color: block.color }} />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TESTIMONIOS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-5 border-y border-white/5 bg-black/40">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black text-white tracking-tight">
              Los que ya subieron de nivel
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="glass-card glass-card-hover relative h-full p-6 rounded-2xl">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={12} fill="#ffd600" className="text-[#ffd600]" />
                    ))}
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violeta/10 border border-violeta/25 flex items-center justify-center">
                      <Trophy size={12} className="text-phantom" />
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
          PRECIO — anclaje
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-5 overflow-hidden">
        <div className="aurora-bg absolute inset-0 opacity-60" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <Reveal className="text-center mb-14">
            <div className="text-phantom text-xs font-bold tracking-[0.25em] uppercase mb-4">Inversión</div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight text-white mb-4">
              Menos que 2 cafés al mes.
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              Un curso de finanzas cuesta $200+. Un asesor, $100 la hora.
              CIMA Pro es el sistema completo, todos los días, por menos que un delivery.
            </p>
          </Reveal>

          <Reveal direction="scale" delay={100}>
            <div className="gold-border-card relative overflow-hidden p-8 sm:p-10">
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(255,214,0,0.08) 0%, transparent 60%)' }} />
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,214,0,0.8), transparent)' }} />

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-1 text-center sm:text-left">
                  <div className="text-[#ffd600] text-xs font-bold tracking-[0.2em] uppercase mb-3">CIMA Pro</div>
                  <div className="flex items-end justify-center sm:justify-start gap-2 mb-1">
                    <span className="text-6xl font-black text-white">$7</span>
                    <span className="text-zinc-400 text-sm mb-3">/mes</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-1">
                    o <span className="text-white font-bold">$59/año</span> — ahorrás 2 meses
                  </p>
                  <p className="text-sm font-semibold" style={{ color: 'rgba(255,214,0,0.8)' }}>
                    🎁 Primeros 14 días gratis, sin tarjeta
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={goStart}
                    className="animate-glow-pulse group flex items-center gap-2.5 px-8 py-4 rounded-xl font-black text-base transition-all hover:-translate-y-1 whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg, #ffd600, #ffb300)', color: '#000', boxShadow: '0 0 40px rgba(255,214,0,0.25)' }}
                  >
                    Empezar prueba gratis
                    <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <span className="text-zinc-600 text-xs">Cancelás en 2 clics</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Garantía */}
          <Reveal delay={150}>
            <div className="mt-8 glass-card rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">Riesgo cero, en serio.</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  14 días completos de Pro sin poner tarjeta. Si no te cambia la forma de manejar tu plata,
                  no hacés nada: volvés solo al plan gratuito y conservás todos tus datos.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-5 bg-abyss border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black text-white tracking-tight">
              Preguntas frecuentes
            </h2>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 60}>
                <FaqItem q={faq.q} a={faq.a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-36 px-5 overflow-hidden border-t border-white/5">
        <div className="aurora-bg absolute inset-0" />
        <div className="stars absolute inset-0 opacity-50" />

        <Reveal className="relative z-10 max-w-2xl mx-auto text-center" direction="scale">
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mx-auto mb-8 animate-float"
            style={{ background: 'linear-gradient(135deg, #7c5cfc, #38bdf8)', boxShadow: '0 0 50px rgba(124,92,252,0.4)' }}>
            <Zap size={30} className="text-white" fill="currentColor" />
          </div>

          <h2 className="text-[clamp(2.2rem,6vw,5rem)] font-black text-white tracking-tight leading-[0.98] mb-6">
            En 14 días vas a saber<br />
            si esto es <span className="text-gradient-violet">para vos</span>.
          </h2>

          <p className="text-zinc-300 text-lg mb-10 leading-relaxed">
            Y no te va a costar ni un peso averiguarlo.
          </p>

          <button
            onClick={goStart}
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg transition-all hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #7c5cfc, #38bdf8)', color: '#fff', boxShadow: '0 0 50px rgba(124,92,252,0.4)' }}
          >
            Activar mis 14 días gratis
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-6 mt-8 text-zinc-500 text-xs">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Sin tarjeta</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Sin compromiso</span>
            <span className="flex items-center gap-1.5"><Wallet size={12} /> Precio en ARS</span>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-5 bg-abyss">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <button onClick={goLanding} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#ffd600] flex items-center justify-center">
              <Flame size={12} className="text-zinc-950" />
            </div>
            <span className="text-zinc-500 font-black text-sm tracking-tight">CIMA</span>
          </button>
          <span className="text-zinc-700 text-xs">© 2026 CIMA App</span>
        </div>
      </footer>

    </div>
  )
}
