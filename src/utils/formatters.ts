import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const formatoARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const formatoNumero = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatearMonto(monto: number): string {
  return formatoARS.format(monto)
}

export function formatearNumero(n: number): string {
  return formatoNumero.format(n)
}

export function formatearFecha(fechaISO: string): string {
  return format(parseISO(fechaISO), 'dd/MM/yyyy')
}

export function formatearFechaCorta(fechaISO: string): string {
  return format(parseISO(fechaISO), 'dd/MM')
}

export function formatearFechaLarga(fechaISO: string): string {
  return format(parseISO(fechaISO), "EEEE d 'de' MMMM", { locale: es })
}

export function formatearMes(mesISO: string): string {
  return format(parseISO(`${mesISO}-01`), 'MMMM yyyy', { locale: es })
}

export function hoy(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function mesActual(): string {
  return format(new Date(), 'yyyy-MM')
}

export function porcentaje(valor: number, total: number): number {
  if (total === 0) return 0
  return Math.round((valor / total) * 100)
}
