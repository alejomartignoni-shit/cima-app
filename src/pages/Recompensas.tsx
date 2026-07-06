import { useState, lazy, Suspense } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { useApp } from '../store/AppContext'
import { LOGROS_DEF, type CategoriaLogro } from '../utils/logros'
import { getRangoInfo } from '../utils/xp'
import { Reveal } from '../components/ui/Reveal'
import { Lock, Maximize2 } from 'lucide-react'
import type { MerchProductId } from '../components/merch/Merch3DViewer'
const Merch3DViewer = lazy(() =>
  import('../components/merch/Merch3DViewer').then(m => ({ default: m.Merch3DViewer }))
)

const CATEGORIAS: { id: CategoriaLogro; label: string; emoji: string }[] = [
  { id: 'racha', label: 'Racha', emoji: '🔥' },
  { id: 'finanzas', label: 'Finanzas', emoji: '💰' },
  { id: 'habitos', label: 'Hábitos', emoji: '⚙️' },
  { id: 'tareas', label: 'Tareas', emoji: '✅' },
  { id: 'rango', label: 'Rango', emoji: '👑' },
  { id: 'especial', label: 'Especial', emoji: '⭐' },
]

const GANAR_CREDITOS = [
  { accion: 'Check-in diario', icono: '🔥', cantidad: '+10', desc: 'Por cada día activo' },
  { accion: 'Transacción', icono: '💸', cantidad: '+3', desc: 'Al registrar un movimiento' },
  { accion: 'Hábito completado', icono: '✅', cantidad: '+2', desc: 'Por hábito del día' },
  { accion: 'Tarea alta prioridad', icono: '🔴', cantidad: '+20', desc: 'Al completar' },
  { accion: 'Tarea media prioridad', icono: '🟡', cantidad: '+10', desc: 'Al completar' },
  { accion: 'Diario semanal', icono: '📓', cantidad: '+5', desc: 'Al escribir una entrada' },
  { accion: 'Onboarding', icono: '🚀', cantidad: '+50', desc: 'Una sola vez' },
  { accion: 'Logro desbloqueado', icono: '🏆', cantidad: 'Varía', desc: '30 – 10,000 créditos' },
]

const MERCH: { id: MerchProductId; nombre: string; descripcion: string; emoji: string }[] = [
  { id: 'hoodie', nombre: 'Hoodie Mentes Millonarias', emoji: '🧥', descripcion: 'Polar premium 380g. Logo M bordado al frente. Edición limitada.' },
]

function MerchCard({
  item,
  unlocked,
  onView,
}: {
  item: typeof MERCH[0]
  unlocked: boolean
  onView: () => void
}) {
  return (
    <div
      onClick={onView}
      className={`group relative bg-zinc-900 border rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] ${
        unlocked ? 'border-[#ffd600]/25 shadow-lg shadow-[#ffd600]/5 hover:border-[#ffd600]/50' : 'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {/* Preview area */}
      <div className={`aspect-[4/3] flex flex-col items-center justify-center relative overflow-hidden ${
        unlocked ? 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950' : 'bg-zinc-900'
      }`}>
        {/* Big emoji */}
        <span className={`text-7xl mb-3 transition-transform duration-300 group-hover:scale-110 ${unlocked ? '' : 'grayscale opacity-40'}`}>
          {item.emoji}
        </span>
        {/* M logo badge */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          unlocked ? 'bg-[#ffd600] shadow-lg shadow-[#ffd600]/30' : 'bg-zinc-700'
        }`}>
          <span className={`font-black text-xl leading-none ${unlocked ? 'text-zinc-950' : 'text-zinc-500'}`}>M</span>
        </div>

        {/* "Ver en 3D" hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-200">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
            <Maximize2 size={14} className="text-white" />
            <span className="text-white text-xs font-semibold">Ver en 3D</span>
          </div>
        </div>

        {/* Elite badge */}
        {unlocked && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#ffd600]/15 border border-[#ffd600]/30 text-[#ffd600]">
              👑 ÉLITE
            </span>
          </div>
        )}
        {/* Locked */}
        {!unlocked && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500">
              <Lock size={9} className="inline mr-1" />Bloqueado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="text-white font-semibold mb-1 text-sm">{item.nombre}</h4>
        <p className="text-zinc-500 text-xs mb-3 leading-relaxed">{item.descripcion}</p>
        {unlocked ? (
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onView() }}
              className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Maximize2 size={12} /> Ver en 3D
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex-1 py-2 rounded-xl bg-[#ffd600] hover:bg-[#ffe033] text-zinc-950 font-bold text-xs transition-colors active:scale-95"
            >
              🎁 Reclamar
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onView() }}
            className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-400 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Maximize2 size={12} /> Vista previa 3D
          </button>
        )}
      </div>
    </div>
  )
}

export function Recompensas() {
  const { state } = useApp()
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaLogro>('racha')
  const [showHistorial, setShowHistorial] = useState(false)
  const [viewing, setViewing] = useState<MerchProductId | null>(null)

  const rangoInfo = getRangoInfo(state.xp.total)
  const isElite = rangoInfo.rango === 'Élite'
  const totalCreditos = state.creditos?.total ?? 0
  const historial = [...(state.creditos?.historial ?? [])].reverse().slice(0, 20)
  const desbloqueados = new Set(state.logros.map(l => l.id))
  const logrosDefs = LOGROS_DEF.filter(l => l.categoria === categoriaActiva)
  const totalDesbloqueados = state.logros.length
  const totalLogros = LOGROS_DEF.length
  const pctLogros = totalLogros > 0 ? Math.round((totalDesbloqueados / totalLogros) * 100) : 0

  return (
    <>
    <AppLayout titulo="Recompensas">
      <div className="space-y-5 max-w-5xl animate-fade-in">

        {/* Credits balance */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#ffd600]/15 border border-[#ffd600]/30 flex items-center justify-center">
                  <span className="text-[#ffd600] font-black text-xs">M</span>
                </div>
                <p className="text-zinc-400 text-sm font-medium">Monedas M</p>
              </div>
              <p className="text-5xl lg:text-6xl font-black text-[#ffd600] leading-none tabular-nums">
                {totalCreditos.toLocaleString('es-AR')}
              </p>
              <p className="text-zinc-500 text-xs mt-2">créditos acumulados</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className="text-2xl">{rangoInfo.emoji}</span>
                <span className="text-base font-bold" style={{ color: rangoInfo.color }}>{rangoInfo.rango}</span>
              </div>
              <p className="text-zinc-600 text-xs">{totalDesbloqueados}/{totalLogros} logros</p>
              <p className="text-[#ffd600] text-xs font-semibold mt-0.5">{pctLogros}% completo</p>
            </div>
          </div>

          {/* Logros progress bar */}
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-[#ffd600] transition-all duration-700"
              style={{ width: `${pctLogros}%` }}
            />
          </div>

          {historial.length > 0 && (
            <button
              onClick={() => setShowHistorial(!showHistorial)}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              {showHistorial ? '▲ Ocultar historial' : '▼ Ver historial reciente'}
            </button>
          )}

          {showHistorial && (
            <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1 max-h-44 overflow-y-auto pr-1">
              {historial.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/40 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-zinc-600 flex-shrink-0">{e.fecha}</span>
                    <span className="text-zinc-400 truncate">{e.motivo}</span>
                  </div>
                  <span className="text-[#ffd600] font-bold flex-shrink-0 ml-2">+{e.cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How to earn */}
        <Reveal>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest mb-4">Cómo ganar Monedas M</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GANAR_CREDITOS.map((g, i) => (
              <div key={i} className="bg-zinc-800/60 rounded-xl p-3 border border-zinc-700/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{g.icono}</span>
                  <span className="text-[#ffd600] font-bold text-sm">{g.cantidad}</span>
                </div>
                <p className="text-zinc-200 text-xs font-semibold leading-snug">{g.accion}</p>
                <p className="text-zinc-600 text-[10px] mt-0.5">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
        </Reveal>

        {/* Achievements */}
        <Reveal>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest mb-4">Logros</p>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {CATEGORIAS.map(c => {
              const count = LOGROS_DEF.filter(l => l.categoria === c.id && desbloqueados.has(l.id)).length
              const total = LOGROS_DEF.filter(l => l.categoria === c.id).length
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoriaActiva(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    categoriaActiva === c.id
                      ? 'bg-[#ffd600] text-zinc-950'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>{c.emoji}</span>
                  {c.label}
                  <span className={`ml-0.5 ${categoriaActiva === c.id ? 'text-zinc-700' : 'text-zinc-600'}`}>
                    {count}/{total}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Achievement grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {logrosDefs.map(def => {
              const unlocked = desbloqueados.has(def.id)
              const logro = state.logros.find(l => l.id === def.id)
              return (
                <div
                  key={def.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                    unlocked
                      ? 'border-zinc-700 bg-zinc-800/40'
                      : 'border-zinc-800/50 opacity-45'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                    unlocked ? 'bg-zinc-700' : 'bg-zinc-800/50'
                  }`}>
                    {unlocked ? def.icono : '🔒'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <p className={`text-sm font-semibold leading-tight ${unlocked ? 'text-white' : 'text-zinc-600'}`}>
                        {def.nombre}
                      </p>
                      <span className="text-[#ffd600] text-xs font-bold flex-shrink-0 ml-1 mt-0.5">
                        +{def.creditos >= 1000 ? `${(def.creditos / 1000).toFixed(0)}k` : def.creditos}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs leading-snug">{def.descripcion}</p>
                    {unlocked && logro?.desbloqueadoEn && (
                      <p className="text-zinc-700 text-[10px] mt-1">✓ {logro.desbloqueadoEn}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        </Reveal>

        {/* Elite Merch */}
        <div className={`border rounded-2xl p-5 ${isElite ? 'bg-gradient-to-br from-[#ffd600]/5 to-zinc-900 border-[#ffd600]/20' : 'bg-zinc-900 border-zinc-800'}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest">Merch Élite — Mentes Millonarias</p>
            {isElite && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#ffd600]/15 border border-[#ffd600]/30 text-[#ffd600]">
                👑 DESBLOQUEADO
              </span>
            )}
          </div>
          <p className="text-zinc-500 text-xs mb-5 leading-relaxed">
            {isElite
              ? 'Sos Élite. Elegí tu merch gratis y te lo enviamos a tu dirección. Felicitaciones 🎉'
              : `Alcanzá el rango Élite (20,000 XP — te faltan ${Math.max(0, 20000 - state.xp.total).toLocaleString('es-AR')} XP) y recibís merch gratis de Mentes Millonarias.`}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {MERCH.map(item => (
              <MerchCard key={item.id} item={item} unlocked={isElite} onView={() => setViewing(item.id)} />
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
    {viewing && (
      <Suspense fallback={null}>
        <Merch3DViewer
          productId={viewing}
          productName={MERCH.find(m => m.id === viewing)!.nombre}
          gold={isElite}
          onClose={() => setViewing(null)}
        />
      </Suspense>
    )}
    </>
  )
}
