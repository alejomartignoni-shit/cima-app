// Sonidos sintetizados con WebAudio — sin assets, cero peso.
// Toggle: localStorage 'cima-sonidos' = 'off' para silenciar.

let ctx: AudioContext | null = null

function ensureCtx(): AudioContext | null {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    if (!ctx) ctx = new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function sonidosActivados(): boolean {
  try {
    return localStorage.getItem('cima-sonidos') !== 'off'
  } catch {
    return true
  }
}

export function setSonidos(activados: boolean): void {
  try {
    localStorage.setItem('cima-sonidos', activados ? 'on' : 'off')
  } catch { /* storage no disponible */ }
}

function tone(freq: number, delay: number, dur: number, type: OscillatorType = 'sine', gain = 0.1): void {
  const c = ensureCtx()
  if (!c) return
  try {
    const t0 = c.currentTime + delay
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.value = freq
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012)
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
    osc.connect(g)
    g.connect(c.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.05)
  } catch { /* audio bloqueado por el navegador */ }
}

/** Ding de recompensa (XP ganado) */
export function playDing(): void {
  if (!sonidosActivados()) return
  tone(880, 0, 0.12, 'sine', 0.09)
  tone(1318.5, 0.08, 0.2, 'sine', 0.09)
}

/** Pop corto para taps de botones */
export function playPop(): void {
  if (!sonidosActivados()) return
  tone(520, 0, 0.06, 'triangle', 0.07)
}

/** Fanfarria de subida de rango / celebración */
export function playFanfare(): void {
  if (!sonidosActivados()) return
  tone(523.25, 0, 0.14, 'triangle', 0.1)    // C5
  tone(659.25, 0.11, 0.14, 'triangle', 0.1) // E5
  tone(783.99, 0.22, 0.14, 'triangle', 0.1) // G5
  tone(1046.5, 0.33, 0.34, 'triangle', 0.12) // C6
  tone(1318.5, 0.33, 0.34, 'sine', 0.06)     // E6 brillo
}

/** Vibración háptica en mobile (silencioso si no hay soporte) */
export function vibrate(patron: number | number[] = 15): void {
  try {
    navigator.vibrate?.(patron)
  } catch { /* sin soporte */ }
}
