import type { Rango, EstadoXP, EventoXP } from '../types'
import { parseISO } from 'date-fns'

// ─── Rango thresholds ─────────────────────────────────────────────────────────

export interface InfoRango {
  rango: Rango
  emoji: string
  color: string   // hex
  minXP: number
  maxXP: number | null
}

export const RANGOS: InfoRango[] = [
  { rango: 'Bronce',   emoji: '🥉', color: '#cd7f32', minXP: 0,     maxXP: 499   },
  { rango: 'Plata',    emoji: '🥈', color: '#a8a9ad', minXP: 500,   maxXP: 1999  },
  { rango: 'Oro',      emoji: '🥇', color: '#ffd700', minXP: 2000,  maxXP: 4999  },
  { rango: 'Platino',  emoji: '💎', color: '#00b4d8', minXP: 5000,  maxXP: 9999  },
  { rango: 'Diamante', emoji: '💠', color: '#a855f7', minXP: 10000, maxXP: 19999 },
  { rango: 'Élite',    emoji: '👑', color: '#10b981', minXP: 20000, maxXP: null  },
]

export function getRangoInfo(xpTotal: number): InfoRango {
  for (let i = RANGOS.length - 1; i >= 0; i--) {
    if (xpTotal >= RANGOS[i].minXP) return RANGOS[i]
  }
  return RANGOS[0]
}

export function getProgresoRango(xpTotal: number): {
  actual: InfoRango
  siguiente: InfoRango | null
  porcentaje: number
  xpEnRango: number
  xpParaSiguiente: number | null
} {
  const actual = getRangoInfo(xpTotal)
  const idxActual = RANGOS.findIndex(r => r.rango === actual.rango)
  const siguiente = idxActual < RANGOS.length - 1 ? RANGOS[idxActual + 1] : null

  if (!siguiente) {
    return { actual, siguiente: null, porcentaje: 100, xpEnRango: xpTotal - actual.minXP, xpParaSiguiente: null }
  }

  const xpEnRango = xpTotal - actual.minXP
  const xpTotalRango = siguiente.minXP - actual.minXP
  const porcentaje = Math.min(100, Math.round((xpEnRango / xpTotalRango) * 100))

  return {
    actual,
    siguiente,
    porcentaje,
    xpEnRango,
    xpParaSiguiente: siguiente.minXP - xpTotal,
  }
}

// ─── Temporada ────────────────────────────────────────────────────────────────

export interface Temporada {
  id: string
  nombre: string
  inicio: string // YYYY-MM-DD
  fin: string    // YYYY-MM-DD
  emoji: string
}

const NOMBRES_Q: Record<string, { nombre: string; emoji: string }> = {
  Q1: { nombre: 'Arranque',  emoji: '🌱' },
  Q2: { nombre: 'Momentum',  emoji: '⚡' },
  Q3: { nombre: 'Cima',      emoji: '🏔️' },
  Q4: { nombre: 'Cierre',    emoji: '🎯' },
}

export function getTemporadaActual(): Temporada {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  let q: string, inicio: string, fin: string
  if (month <= 3)  { q = 'Q1'; inicio = `${year}-01-01`; fin = `${year}-03-31` }
  else if (month <= 6) { q = 'Q2'; inicio = `${year}-04-01`; fin = `${year}-06-30` }
  else if (month <= 9) { q = 'Q3'; inicio = `${year}-07-01`; fin = `${year}-09-30` }
  else { q = 'Q4'; inicio = `${year}-10-01`; fin = `${year}-12-31` }

  const { nombre, emoji } = NOMBRES_Q[q]
  return { id: `${year}-${q}`, nombre: `${nombre} ${year}`, inicio, fin, emoji }
}

export function getXPTemporada(xp: EstadoXP, temporada: Temporada): number {
  return xp.historial
    .filter(e => e.fecha >= temporada.inicio && e.fecha <= temporada.fin)
    .reduce((s, e) => s + e.cantidad, 0)
}

export function getProgresoTemporada(temporada: Temporada): number {
  const inicio = parseISO(temporada.inicio).getTime()
  const fin    = parseISO(temporada.fin).getTime()
  const ahora  = Date.now()
  if (ahora >= fin)   return 100
  if (ahora <= inicio) return 0
  return Math.round(((ahora - inicio) / (fin - inicio)) * 100)
}

// ─── XP event helpers ─────────────────────────────────────────────────────────

export const XP_MOTIVOS: Record<string, { cantidad: number; label: string }> = {
  transaccion:     { cantidad: 5,  label: 'Transacción registrada' },
  habito:          { cantidad: 10, label: 'Hábito completado' },
  checkin:         { cantidad: 5,  label: 'Check-in diario' },
  tarea_alta:      { cantidad: 25, label: 'Tarea Alta completada' },
  tarea_media:     { cantidad: 15, label: 'Tarea Media completada' },
  tarea_baja:      { cantidad: 10, label: 'Tarea Baja completada' },
  tarea_opcional:  { cantidad: 5,  label: 'Tarea Opcional completada' },
  diario_semanal:  { cantidad: 3,  label: 'Diario semanal' },
  onboarding:      { cantidad: 50, label: 'Bienvenido a CIMA 🎉' },
}

export function crearEventoXP(clave: keyof typeof XP_MOTIVOS, fecha: string): EventoXP {
  const { cantidad, label } = XP_MOTIVOS[clave]
  return { fecha, cantidad, motivo: label }
}

export function agregarXP(xp: EstadoXP, evento: EventoXP): EstadoXP {
  const historial = [...xp.historial, evento].slice(-100)
  return { total: xp.total + evento.cantidad, historial }
}

export function formatXP(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}
