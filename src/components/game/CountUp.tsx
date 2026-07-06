import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}

/** Número que anima hacia su nuevo valor (estilo balance de wallet) */
export function CountUp({ value, format, duration = 900, className }: CountUpProps) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    prevRef.current = value
    if (from === to) return

    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  const rounded = Math.round(display)
  return <span className={className}>{format ? format(rounded) : rounded}</span>
}
