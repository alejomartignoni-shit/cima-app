import { subDays, subMonths, format, startOfMonth } from 'date-fns'
import type { Transaccion, DiaActivo, Deuda, EventoXP } from '../types'

function fechaDias(diasAtras: number): string {
  return format(subDays(new Date(), diasAtras), 'yyyy-MM-dd')
}

function fechaMes(mesesAtras: number, diaDelMes: number): string {
  const base = startOfMonth(subMonths(new Date(), mesesAtras))
  const d = new Date(base.getFullYear(), base.getMonth(), diaDelMes)
  return format(d, 'yyyy-MM-dd')
}

function id(): string {
  return `demo-${Math.random().toString(36).slice(2, 9)}`
}

// Current month transactions (last 30 days)
const txMesActual: Transaccion[] = [
  { id: id(), fecha: fechaDias(29), tipo: 'ingreso', categoria: 'Salario', monto: 2_300_000, nota: 'Sueldo mes actual' },
  { id: id(), fecha: fechaDias(20), tipo: 'ingreso', categoria: 'Freelance / Proyectos', monto: 480_000, nota: 'Proyecto landing page' },
  { id: id(), fecha: fechaDias(7), tipo: 'ingreso', categoria: 'Freelance / Proyectos', monto: 310_000, nota: 'Consultoría 4 sesiones' },
  { id: id(), fecha: fechaDias(3), tipo: 'ingreso', categoria: 'Ventas', monto: 95_000, nota: 'Venta notebook usada' },
  { id: id(), fecha: fechaDias(12), tipo: 'ingreso', categoria: 'Inversiones', monto: 72_000, nota: 'Renta FCI pesos' },
  { id: id(), fecha: fechaDias(1), tipo: 'ingreso', categoria: 'Otros ingresos', monto: 45_000, nota: 'Staking cripto' },

  { id: id(), fecha: fechaDias(28), tipo: 'gasto', categoria: 'Vivienda y alquiler', monto: 870_000, nota: 'Alquiler' },
  { id: id(), fecha: fechaDias(25), tipo: 'gasto', categoria: 'Servicios', monto: 19_500, nota: 'Luz' },
  { id: id(), fecha: fechaDias(24), tipo: 'gasto', categoria: 'Servicios', monto: 13_200, nota: 'Gas' },
  { id: id(), fecha: fechaDias(23), tipo: 'gasto', categoria: 'Servicios', monto: 9_800, nota: 'Internet' },
  { id: id(), fecha: fechaDias(22), tipo: 'gasto', categoria: 'Servicios', monto: 7_200, nota: 'Spotify + Netflix' },
  { id: id(), fecha: fechaDias(27), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 92_000, nota: 'Super semanal' },
  { id: id(), fecha: fechaDias(21), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 88_000, nota: 'Carrefour + verdulería' },
  { id: id(), fecha: fechaDias(14), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 79_500, nota: 'Compra semanal' },
  { id: id(), fecha: fechaDias(8), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 68_000, nota: 'Super + fiambrería' },
  { id: id(), fecha: fechaDias(5), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 45_000, nota: 'Restaurante' },
  { id: id(), fecha: fechaDias(2), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 91_000, nota: 'Compra semanal' },
  { id: id(), fecha: fechaDias(26), tipo: 'gasto', categoria: 'Transporte', monto: 16_000, nota: 'SUBE mensual' },
  { id: id(), fecha: fechaDias(18), tipo: 'gasto', categoria: 'Transporte', monto: 35_000, nota: 'Nafta' },
  { id: id(), fecha: fechaDias(9), tipo: 'gasto', categoria: 'Transporte', monto: 9_500, nota: 'Uber' },
  { id: id(), fecha: fechaDias(19), tipo: 'gasto', categoria: 'Salud', monto: 72_000, nota: 'Prepaga Osde 210' },
  { id: id(), fecha: fechaDias(11), tipo: 'gasto', categoria: 'Salud', monto: 26_000, nota: 'Médico + análisis' },
  { id: id(), fecha: fechaDias(16), tipo: 'gasto', categoria: 'Educación', monto: 58_000, nota: 'Curso React avanzado' },
  { id: id(), fecha: fechaDias(13), tipo: 'gasto', categoria: 'Entretenimiento y ocio', monto: 30_000, nota: 'Cine + palomitas' },
  { id: id(), fecha: fechaDias(6), tipo: 'gasto', categoria: 'Entretenimiento y ocio', monto: 17_000, nota: 'Juego Steam' },
  { id: id(), fecha: fechaDias(17), tipo: 'gasto', categoria: 'Ropa y accesorios', monto: 82_000, nota: 'Zapatillas Nike' },
  { id: id(), fecha: fechaDias(4), tipo: 'gasto', categoria: 'Otros', monto: 22_000, nota: 'Regalo' },
]

// Helper to build a month of transactions at a given scale
function generarMes(mesesAtras: number, escalaIngreso: number = 1): Transaccion[] {
  return [
    { id: id(), fecha: fechaMes(mesesAtras, 5), tipo: 'ingreso', categoria: 'Salario', monto: Math.round(2_100_000 * escalaIngreso), nota: 'Sueldo' },
    { id: id(), fecha: fechaMes(mesesAtras, 18), tipo: 'ingreso', categoria: 'Freelance / Proyectos', monto: Math.round(380_000 * escalaIngreso), nota: 'Freelance' },
    { id: id(), fecha: fechaMes(mesesAtras, 25), tipo: 'ingreso', categoria: 'Inversiones', monto: Math.round(55_000 * escalaIngreso), nota: 'Inversión' },

    { id: id(), fecha: fechaMes(mesesAtras, 3), tipo: 'gasto', categoria: 'Vivienda y alquiler', monto: Math.round(820_000 * escalaIngreso), nota: 'Alquiler' },
    { id: id(), fecha: fechaMes(mesesAtras, 6), tipo: 'gasto', categoria: 'Servicios', monto: 42_000, nota: 'Servicios del mes' },
    { id: id(), fecha: fechaMes(mesesAtras, 8), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 350_000, nota: 'Alimentación mensual' },
    { id: id(), fecha: fechaMes(mesesAtras, 10), tipo: 'gasto', categoria: 'Transporte', monto: 60_000, nota: 'Transporte' },
    { id: id(), fecha: fechaMes(mesesAtras, 12), tipo: 'gasto', categoria: 'Salud', monto: 72_000, nota: 'Prepaga' },
    { id: id(), fecha: fechaMes(mesesAtras, 20), tipo: 'gasto', categoria: 'Educación', monto: 50_000, nota: 'Cursos' },
    { id: id(), fecha: fechaMes(mesesAtras, 22), tipo: 'gasto', categoria: 'Entretenimiento y ocio', monto: 45_000, nota: 'Ocio' },
  ]
}

// Build 11 months of historical data (meses 1 through 11)
const txHistorico: Transaccion[] = [
  ...generarMes(1, 0.92),
  ...generarMes(2, 0.88),
  ...generarMes(3, 0.95),
  ...generarMes(4, 0.85),
  ...generarMes(5, 0.90),
  ...generarMes(6, 0.82),
  ...generarMes(7, 0.78),
  ...generarMes(8, 0.80),
  ...generarMes(9, 0.75),
  ...generarMes(10, 0.72),
  ...generarMes(11, 0.70),
]

export const transaccionesDemo: Transaccion[] = [...txMesActual, ...txHistorico]

export function generarDiasActivosDemo(): DiaActivo[] {
  const dias: DiaActivo[] = []
  const fechasConTransacciones = new Set(transaccionesDemo.map(t => t.fecha))

  // Add some check-in-only days
  const diasCheckIn = [4, 6, 10, 13, 17, 22, 26, 33, 40, 48, 55, 62]
  diasCheckIn.forEach(d => {
    const f = fechaDias(d)
    if (!fechasConTransacciones.has(f)) {
      dias.push({ fecha: f, porTransaccion: false, porCheckIn: true })
    }
  })

  return dias
}

export const deudasDemo: Deuda[] = [
  {
    id: 'deuda-demo-1',
    nombre: 'Tarjeta Visa',
    tipo: 'Tarjeta de crédito',
    montoTotal: 450_000,
    montoRestante: 280_000,
    tasaInteres: 72,
    cuotaMensual: 95_000,
  },
  {
    id: 'deuda-demo-2',
    nombre: 'Préstamo personal banco',
    tipo: 'Préstamo',
    montoTotal: 1_200_000,
    montoRestante: 850_000,
    tasaInteres: 48,
    fechaVencimiento: fechaMes(-18, 1), // 18 meses en el futuro
    cuotaMensual: 72_000,
  },
  {
    id: 'deuda-demo-3',
    nombre: 'Cuotas notebook',
    tipo: 'Otro',
    montoTotal: 320_000,
    montoRestante: 160_000,
    cuotaMensual: 32_000,
  },
]

export const xpEventosDemo: EventoXP[] = [
  { fecha: fechaDias(0), cantidad: 50, motivo: 'Bienvenido a CIMA 🎉' },
  ...Array.from({ length: 30 }, (_, i) => ({
    fecha: fechaDias(29 - i),
    cantidad: 5,
    motivo: 'Check-in diario',
  })),
  ...Array.from({ length: 20 }, (_, i) => ({
    fecha: fechaDias(29 - i * 1),
    cantidad: 5,
    motivo: 'Transacción registrada',
  })),
  ...Array.from({ length: 15 }, (_, i) => ({
    fecha: fechaDias(20 - i),
    cantidad: 10,
    motivo: 'Hábito completado',
  })),
]
