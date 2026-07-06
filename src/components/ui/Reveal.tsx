import { useEffect, useRef, type ReactNode } from 'react'

type Direction = 'up' | 'left' | 'right' | 'scale'

interface RevealProps {
  children: ReactNode
  direction?: Direction
  delay?: number
  className?: string
  once?: boolean
}

export function Reveal({ children, direction = 'up', delay = 0, className = '', once = true }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('reveal-visible')
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('reveal-visible')
          if (once) observer.disconnect()
        } else if (!once) {
          el.classList.remove('reveal-visible')
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once])

  return (
    <div
      ref={ref}
      className={`reveal-${direction} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
