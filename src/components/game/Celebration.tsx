import { useEffect, useState } from 'react'

const EVENTO_CELEBRAR = 'cima:celebrate'

/** Dispara una lluvia de confetti desde cualquier lugar de la app */
export function celebrate(opts?: { pieces?: number }): void {
  window.dispatchEvent(new CustomEvent(EVENTO_CELEBRAR, { detail: opts }))
}

interface Pieza {
  id: number
  left: number      // %
  size: number      // px
  color: string
  circulo: boolean
  dur: number       // s
  delay: number     // s
  sway: number      // px
  spin: number      // deg
}

const COLORES = ['#ffd600', '#ff9500', '#10b981', '#7c5cfc', '#ab9ff2', '#ffffff', '#34d399']

function generarPiezas(n: number): Pieza[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 6 + Math.random() * 7,
    color: COLORES[Math.floor(Math.random() * COLORES.length)],
    circulo: Math.random() > 0.5,
    dur: 1.8 + Math.random() * 1.4,
    delay: Math.random() * 0.35,
    sway: (Math.random() - 0.5) * 220,
    spin: (Math.random() - 0.5) * 1080,
  }))
}

interface Rafaga {
  id: number
  piezas: Pieza[]
}

/** Overlay global de confetti. Montar una sola vez (GameFeedback lo incluye). */
export function Celebration() {
  const [rafagas, setRafagas] = useState<Rafaga[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const id = Date.now() + Math.random()
      const n = (e as CustomEvent).detail?.pieces ?? 80
      setRafagas(r => [...r, { id, piezas: generarPiezas(n) }])
      setTimeout(() => setRafagas(r => r.filter(x => x.id !== id)), 3800)
    }
    window.addEventListener(EVENTO_CELEBRAR, handler)
    return () => window.removeEventListener(EVENTO_CELEBRAR, handler)
  }, [])

  if (rafagas.length === 0) return null

  return (
    <>
      {rafagas.map(rafaga =>
        rafaga.piezas.map(p => (
          <div
            key={`${rafaga.id}-${p.id}`}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.circulo ? p.size : p.size * 0.45,
              background: p.color,
              borderRadius: p.circulo ? '9999px' : '2px',
              '--dur': `${p.dur}s`,
              '--delay': `${p.delay}s`,
              '--sway': `${p.sway}px`,
              '--spin': `${p.spin}deg`,
            } as React.CSSProperties}
          />
        ))
      )}
    </>
  )
}
