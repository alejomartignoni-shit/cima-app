import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react'

interface TiltCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  maxTilt?: number
}

export function TiltCard({ children, className = '', style, maxTilt = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transition = 'transform 0.1s ease-out'
    el.style.transform = `perspective(900px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) translateY(-4px)`
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    el.style.transform = ''
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ ...style, willChange: 'transform' }}
    >
      {children}
    </div>
  )
}
