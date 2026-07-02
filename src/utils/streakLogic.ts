import { differenceInCalendarDays, parseISO, subDays, format } from 'date-fns'
import type { DiaActivo, Transaccion } from '../types'

export function esDiaActivo(fecha: string, diasActivos: DiaActivo[], transacciones: Transaccion[]): boolean {
  const tieneDiaActivo = diasActivos.some(d => d.fecha === fecha)
  const tieneTransaccion = transacciones.some(t => t.fecha === fecha)
  return tieneDiaActivo || tieneTransaccion
}

export function calcularRacha(diasActivos: DiaActivo[], transacciones: Transaccion[]): number {
  const hoy = new Date()
  let racha = 0
  let diaActual = hoy

  while (true) {
    const fechaStr = format(diaActual, 'yyyy-MM-dd')
    if (esDiaActivo(fechaStr, diasActivos, transacciones)) {
      racha++
      diaActual = subDays(diaActual, 1)
    } else {
      break
    }
  }

  return racha
}

export function calcularRachaMaxima(diasActivos: DiaActivo[], transacciones: Transaccion[]): number {
  const todasFechas = new Set<string>([
    ...diasActivos.map(d => d.fecha),
    ...transacciones.map(t => t.fecha),
  ])

  if (todasFechas.size === 0) return 0

  const fechasOrdenadas = Array.from(todasFechas).sort()
  let maxRacha = 1
  let rachaActual = 1

  for (let i = 1; i < fechasOrdenadas.length; i++) {
    const diff = differenceInCalendarDays(
      parseISO(fechasOrdenadas[i]),
      parseISO(fechasOrdenadas[i - 1])
    )
    if (diff === 1) {
      rachaActual++
      if (rachaActual > maxRacha) maxRacha = rachaActual
    } else {
      rachaActual = 1
    }
  }

  return maxRacha
}

export function obtenerUltimos30Dias(diasActivos: DiaActivo[], transacciones: Transaccion[]): Array<{ fecha: string; activo: boolean }> {
  const resultado: Array<{ fecha: string; activo: boolean }> = []
  const hoy = new Date()

  for (let i = 29; i >= 0; i--) {
    const fecha = format(subDays(hoy, i), 'yyyy-MM-dd')
    resultado.push({
      fecha,
      activo: esDiaActivo(fecha, diasActivos, transacciones),
    })
  }

  return resultado
}

export function checkInHechoHoy(ultimoCheckIn: string | null): boolean {
  if (!ultimoCheckIn) return false
  return ultimoCheckIn === format(new Date(), 'yyyy-MM-dd')
}
