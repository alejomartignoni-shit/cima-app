import { subDays, format } from 'date-fns'
import type { Transaccion, DiaActivo } from '../types'

function fecha(diasAtras: number): string {
  return format(subDays(new Date(), diasAtras), 'yyyy-MM-dd')
}

function id(): string {
  return `demo-${Math.random().toString(36).slice(2, 9)}`
}

export const transaccionesDemo: Transaccion[] = [
  // Ingresos
  { id: id(), fecha: fecha(29), tipo: 'ingreso', categoria: 'Salario', monto: 2_100_000, nota: 'Sueldo junio' },
  { id: id(), fecha: fecha(15), tipo: 'ingreso', categoria: 'Salario', monto: 2_100_000, nota: 'Sueldo julio' },
  { id: id(), fecha: fecha(20), tipo: 'ingreso', categoria: 'Freelance / Proyectos', monto: 450_000, nota: 'Proyecto landing page' },
  { id: id(), fecha: fecha(7), tipo: 'ingreso', categoria: 'Freelance / Proyectos', monto: 280_000, nota: 'Mentoría 4 sesiones' },
  { id: id(), fecha: fecha(3), tipo: 'ingreso', categoria: 'Ventas', monto: 95_000, nota: 'Venta notebook usada' },
  { id: id(), fecha: fecha(12), tipo: 'ingreso', categoria: 'Inversiones', monto: 68_500, nota: 'Renta FCI pesos' },
  { id: id(), fecha: fecha(1), tipo: 'ingreso', categoria: 'Otros ingresos', monto: 40_000, nota: 'Dividendo cripto staking' },

  // Gastos — Vivienda
  { id: id(), fecha: fecha(28), tipo: 'gasto', categoria: 'Vivienda y alquiler', monto: 820_000, nota: 'Alquiler junio' },
  { id: id(), fecha: fecha(1), tipo: 'gasto', categoria: 'Vivienda y alquiler', monto: 820_000, nota: 'Alquiler julio' },

  // Gastos — Servicios
  { id: id(), fecha: fecha(25), tipo: 'gasto', categoria: 'Servicios', monto: 18_500, nota: 'Luz' },
  { id: id(), fecha: fecha(24), tipo: 'gasto', categoria: 'Servicios', monto: 12_800, nota: 'Gas' },
  { id: id(), fecha: fecha(23), tipo: 'gasto', categoria: 'Servicios', monto: 9_200, nota: 'Internet fibra óptica' },
  { id: id(), fecha: fecha(22), tipo: 'gasto', categoria: 'Servicios', monto: 6_400, nota: 'Spotify + Netflix' },

  // Gastos — Alimentos
  { id: id(), fecha: fecha(27), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 87_500, nota: 'Super Jumbo semanal' },
  { id: id(), fecha: fecha(21), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 92_000, nota: 'Carrefour + verdulería' },
  { id: id(), fecha: fecha(14), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 76_300, nota: 'Compra semanal' },
  { id: id(), fecha: fecha(8), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 65_800, nota: 'Disco + fiambrería' },
  { id: id(), fecha: fecha(5), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 43_200, nota: 'Restaurante cumpleaños' },
  { id: id(), fecha: fecha(2), tipo: 'gasto', categoria: 'Alimentos y bebidas', monto: 88_700, nota: 'Compra semanal' },

  // Gastos — Transporte
  { id: id(), fecha: fecha(26), tipo: 'gasto', categoria: 'Transporte', monto: 15_000, nota: 'Carga SUBE mensual' },
  { id: id(), fecha: fecha(18), tipo: 'gasto', categoria: 'Transporte', monto: 32_500, nota: 'Nafta' },
  { id: id(), fecha: fecha(9), tipo: 'gasto', categoria: 'Transporte', monto: 8_400, nota: 'Uber viajes semana' },

  // Gastos — Salud
  { id: id(), fecha: fecha(19), tipo: 'gasto', categoria: 'Salud', monto: 68_000, nota: 'Prepaga Osde 210' },
  { id: id(), fecha: fecha(11), tipo: 'gasto', categoria: 'Salud', monto: 24_500, nota: 'Turno médico + análisis' },

  // Gastos — Educación
  { id: id(), fecha: fecha(16), tipo: 'gasto', categoria: 'Educación', monto: 55_000, nota: 'Curso React avanzado' },

  // Gastos — Entretenimiento
  { id: id(), fecha: fecha(13), tipo: 'gasto', categoria: 'Entretenimiento y ocio', monto: 28_000, nota: 'Entradas cine + palomitas' },
  { id: id(), fecha: fecha(6), tipo: 'gasto', categoria: 'Entretenimiento y ocio', monto: 15_200, nota: 'Juego Steam' },

  // Gastos — Ropa
  { id: id(), fecha: fecha(17), tipo: 'gasto', categoria: 'Ropa y accesorios', monto: 78_000, nota: 'Zapatillas Nike' },
  { id: id(), fecha: fecha(10), tipo: 'gasto', categoria: 'Ropa y accesorios', monto: 42_500, nota: 'Remeras x3 + pantalón' },

  // Gastos — Otros
  { id: id(), fecha: fecha(4), tipo: 'gasto', categoria: 'Otros', monto: 19_800, nota: 'Regalo cumpleaños' },
]

export function generarDiasActivosDemo(): DiaActivo[] {
  const dias: DiaActivo[] = []
  const fechasConTransacciones = new Set(transaccionesDemo.map(t => t.fecha))

  // Agregar algunos días con solo check-in (sin transacción)
  const diasCheckIn = [4, 6, 10, 13, 17, 22, 26]
  diasCheckIn.forEach(d => {
    const f = fecha(d)
    if (!fechasConTransacciones.has(f)) {
      dias.push({ fecha: f, porTransaccion: false, porCheckIn: true })
    }
  })

  return dias
}
