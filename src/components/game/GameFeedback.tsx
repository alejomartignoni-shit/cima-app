import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Zap } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { getRangoInfo, RANGOS, formatXP, type InfoRango } from '../../utils/xp'
import { playDing, playFanfare, vibrate } from '../../utils/sound'
import { Celebration, celebrate } from './Celebration'
import { JuicyButton } from './JuicyButton'

function xpToast(cantidad: number, motivo?: string): void {
  toast.custom(
    () => (
      <div className="xp-toast">
        <div className="w-9 h-9 rounded-xl bg-[#ffd600]/15 border border-[#ffd600]/30 flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-[#ffd600]" fill="#ffd600" />
        </div>
        <div className="min-w-0">
          <p className="text-[#ffd600] font-black text-base leading-tight">+{cantidad} XP</p>
          {motivo && <p className="text-zinc-400 text-xs truncate">{motivo}</p>}
        </div>
      </div>
    ),
    { duration: 2200 }
  )
}

/**
 * Watcher global de gamificación. Montar una vez dentro de AppProvider.
 * - XP ganado → toast animado + ding + vibración
 * - Subida de rango → confetti + fanfarria + modal de level-up
 */
export function GameFeedback() {
  const { state } = useApp()
  const prevXPRef = useRef(state.xp.total)
  const [levelUp, setLevelUp] = useState<InfoRango | null>(null)

  useEffect(() => {
    const prev = prevXPRef.current
    const delta = state.xp.total - prev
    prevXPRef.current = state.xp.total
    if (delta <= 0) return

    // Deltas grandes = carga de demo/import, no acción del usuario
    const esAccionUsuario = delta <= 100
    if (!esAccionUsuario) return

    const ultimo = state.xp.historial[state.xp.historial.length - 1]
    xpToast(delta, ultimo?.motivo)
    playDing()
    vibrate(20)

    const rangoAnterior = getRangoInfo(prev)
    const rangoNuevo = getRangoInfo(state.xp.total)
    const idxAnterior = RANGOS.findIndex(r => r.rango === rangoAnterior.rango)
    const idxNuevo = RANGOS.findIndex(r => r.rango === rangoNuevo.rango)
    if (idxNuevo > idxAnterior) {
      setLevelUp(rangoNuevo)
      celebrate({ pieces: 140 })
      playFanfare()
      vibrate([40, 60, 40, 60, 80])
    }
  }, [state.xp.total, state.xp.historial])

  return (
    <>
      <Celebration />
      {levelUp && <LevelUpModal rango={levelUp} xpTotal={state.xp.total} onCerrar={() => setLevelUp(null)} />}
    </>
  )
}

function LevelUpModal({ rango, xpTotal, onCerrar }: { rango: InfoRango; xpTotal: number; onCerrar: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl p-8 text-center overflow-hidden animate-pop bg-zinc-900 border"
        style={{ borderColor: `${rango.color}50` }}
      >
        {/* Rayos girando detrás del emoji */}
        <div className="absolute inset-0 levelup-rays animate-spin-slow pointer-events-none" />

        <div className="relative">
          <p className="text-[#ffd600] text-xs font-black uppercase tracking-[0.25em] mb-4">¡Subiste de rango!</p>
          <div className="text-7xl mb-4 animate-pop-d1">{rango.emoji}</div>
          <h2 className="text-3xl font-black mb-1" style={{ color: rango.color }}>{rango.rango}</h2>
          <p className="text-zinc-400 text-sm mb-6">{formatXP(xpTotal)} XP acumulados</p>
          <JuicyButton variant="gold" fullWidth onClick={onCerrar}>
            ¡Seguir así!
          </JuicyButton>
        </div>
      </div>
    </div>
  )
}
