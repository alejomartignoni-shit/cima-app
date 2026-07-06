import { subDays, subMonths, format, startOfMonth, startOfWeek, subWeeks, addDays, getDaysInMonth } from 'date-fns'
import type {
  Transaccion, DiaActivo, Deuda, EventoXP, Presupuesto,
  Habito, RegistroHabito, EstadoDia, Tarea, RegistroSemanal, PerfilUsuario, Dashboard,
  Logro, EstadoCreditos, CostoFijo, Inversion,
  FondoAhorro, ActivoFinanciero, Negocio, TransaccionNegocio,
} from '../types'

function fechaDias(diasAtras: number): string {
  return format(subDays(new Date(), diasAtras), 'yyyy-MM-dd')
}

function fechaMes(mesesAtras: number, diaDelMes: number): string {
  const base = startOfMonth(subMonths(new Date(), mesesAtras))
  const diasEnMes = getDaysInMonth(base)
  const dia = Math.min(diaDelMes, diasEnMes)
  const d = new Date(base.getFullYear(), base.getMonth(), dia)
  return format(d, 'yyyy-MM-dd')
}

function lunesSemana(semanasAtras: number): string {
  return format(startOfWeek(subWeeks(new Date(), semanasAtras), { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

function diaSemana(semanasAtras: number, diasOffset: number): string {
  const lunes = startOfWeek(subWeeks(new Date(), semanasAtras), { weekStartsOn: 1 })
  return format(addDays(lunes, diasOffset), 'yyyy-MM-dd')
}

function id(): string {
  return `demo-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Transactions ─────────────────────────────────────────────────────────────

const txMesActual: Transaccion[] = [
  // Ingresos
  { id: id(), fecha: fechaDias(29), tipo: 'ingreso', categoria: 'Salario',              monto: 2_450_000, nota: 'Sueldo julio 2026' },
  { id: id(), fecha: fechaDias(22), tipo: 'ingreso', categoria: 'Freelance / Proyectos',monto: 580_000,   nota: 'Landing page cliente ecommerce' },
  { id: id(), fecha: fechaDias(15), tipo: 'ingreso', categoria: 'Freelance / Proyectos',monto: 320_000,   nota: 'Consultoría 4 sesiones — Startup Sanjuanina' },
  { id: id(), fecha: fechaDias(10), tipo: 'ingreso', categoria: 'Ventas',               monto: 145_000,   nota: 'Venta monitor LG 27" usado' },
  { id: id(), fecha: fechaDias(8),  tipo: 'ingreso', categoria: 'Inversiones',          monto: 89_000,    nota: 'Renta FCI Balanz liquidez' },
  { id: id(), fecha: fechaDias(4),  tipo: 'ingreso', categoria: 'Inversiones',          monto: 62_000,    nota: 'Staking ETH — Binance' },
  { id: id(), fecha: fechaDias(2),  tipo: 'ingreso', categoria: 'Otros ingresos',       monto: 38_000,    nota: 'Reintegro OSDE por consulta' },
  // Vivienda
  { id: id(), fecha: fechaDias(28), tipo: 'gasto',   categoria: 'Vivienda y alquiler',  monto: 920_000,   nota: 'Alquiler julio — depto B° Güemes' },
  // Servicios
  { id: id(), fecha: fechaDias(26), tipo: 'gasto',   categoria: 'Servicios',            monto: 23_400,    nota: 'Luz — EPEC' },
  { id: id(), fecha: fechaDias(25), tipo: 'gasto',   categoria: 'Servicios',            monto: 15_800,    nota: 'Gas — Ecogas' },
  { id: id(), fecha: fechaDias(24), tipo: 'gasto',   categoria: 'Servicios',            monto: 12_200,    nota: 'Internet — Fibertel 300mb' },
  { id: id(), fecha: fechaDias(23), tipo: 'gasto',   categoria: 'Servicios',            monto: 7_990,     nota: 'Netflix + Spotify' },
  { id: id(), fecha: fechaDias(20), tipo: 'gasto',   categoria: 'Servicios',            monto: 4_800,     nota: 'Adobe CC plan fotográfico' },
  // Alimentos
  { id: id(), fecha: fechaDias(27), tipo: 'gasto',   categoria: 'Alimentos y bebidas',  monto: 96_000,    nota: 'Super Disco semanal' },
  { id: id(), fecha: fechaDias(21), tipo: 'gasto',   categoria: 'Alimentos y bebidas',  monto: 84_500,    nota: 'Carrefour + verdulería barrio' },
  { id: id(), fecha: fechaDias(16), tipo: 'gasto',   categoria: 'Alimentos y bebidas',  monto: 78_000,    nota: 'Compra semanal Vea' },
  { id: id(), fecha: fechaDias(12), tipo: 'gasto',   categoria: 'Alimentos y bebidas',  monto: 52_000,    nota: 'Restaurante sushi cumple Ana' },
  { id: id(), fecha: fechaDias(9),  tipo: 'gasto',   categoria: 'Alimentos y bebidas',  monto: 89_500,    nota: 'Super + fiambrería + panadería' },
  { id: id(), fecha: fechaDias(5),  tipo: 'gasto',   categoria: 'Alimentos y bebidas',  monto: 38_000,    nota: 'Pizza delivery viernes' },
  { id: id(), fecha: fechaDias(3),  tipo: 'gasto',   categoria: 'Alimentos y bebidas',  monto: 76_000,    nota: 'Compra semanal' },
  // Transporte
  { id: id(), fecha: fechaDias(27), tipo: 'gasto',   categoria: 'Transporte',           monto: 18_500,    nota: 'SUBE mensual' },
  { id: id(), fecha: fechaDias(19), tipo: 'gasto',   categoria: 'Transporte',           monto: 42_000,    nota: 'YPF nafta Super' },
  { id: id(), fecha: fechaDias(13), tipo: 'gasto',   categoria: 'Transporte',           monto: 11_200,    nota: 'Uber x4 viajes semana' },
  { id: id(), fecha: fechaDias(6),  tipo: 'gasto',   categoria: 'Transporte',           monto: 39_500,    nota: 'Nafta + service aceite' },
  // Salud
  { id: id(), fecha: fechaDias(18), tipo: 'gasto',   categoria: 'Salud',                monto: 78_000,    nota: 'OSDE 210 julio' },
  { id: id(), fecha: fechaDias(11), tipo: 'gasto',   categoria: 'Salud',                monto: 32_000,    nota: 'Traumatólogo + RX rodilla' },
  { id: id(), fecha: fechaDias(7),  tipo: 'gasto',   categoria: 'Salud',                monto: 18_500,    nota: 'Farmacia — suplementos' },
  // Educación
  { id: id(), fecha: fechaDias(17), tipo: 'gasto',   categoria: 'Educación',            monto: 65_000,    nota: 'Udemy pack 3 cursos — React + TypeScript + Node' },
  { id: id(), fecha: fechaDias(14), tipo: 'gasto',   categoria: 'Educación',            monto: 32_000,    nota: 'Libro "Atomic Habits" + "RICHER, WISER, HAPPIER"' },
  // Entretenimiento
  { id: id(), fecha: fechaDias(16), tipo: 'gasto',   categoria: 'Entretenimiento y ocio',monto: 28_000,   nota: 'Cine Village + cena previa' },
  { id: id(), fecha: fechaDias(8),  tipo: 'gasto',   categoria: 'Entretenimiento y ocio',monto: 14_500,   nota: 'Steam — Elden Ring DLC' },
  // Ropa
  { id: id(), fecha: fechaDias(20), tipo: 'gasto',   categoria: 'Ropa y accesorios',    monto: 95_000,    nota: 'Nike Run — 2 remeras + short' },
  // Otros
  { id: id(), fecha: fechaDias(10), tipo: 'gasto',   categoria: 'Otros',                monto: 45_000,    nota: 'Regalo cumple mamá' },
  { id: id(), fecha: fechaDias(1),  tipo: 'gasto',   categoria: 'Otros',                monto: 15_000,    nota: 'Corte de pelo' },
]

function generarMes(m: number, sueldo: number, frelance: number, extras: Transaccion[] = []): Transaccion[] {
  return [
    // Ingresos
    { id: id(), fecha: fechaMes(m, 5),  tipo: 'ingreso', categoria: 'Salario',              monto: sueldo,    nota: 'Sueldo mensual' },
    { id: id(), fecha: fechaMes(m, 18), tipo: 'ingreso', categoria: 'Freelance / Proyectos',monto: frelance,  nota: 'Proyecto freelance' },
    { id: id(), fecha: fechaMes(m, 26), tipo: 'ingreso', categoria: 'Inversiones',          monto: Math.round(sueldo * 0.032), nota: 'Renta FCI + staking' },
    // Vivienda
    { id: id(), fecha: fechaMes(m, 3),  tipo: 'gasto',   categoria: 'Vivienda y alquiler',  monto: Math.round(sueldo * 0.37),  nota: 'Alquiler' },
    // Servicios
    { id: id(), fecha: fechaMes(m, 6),  tipo: 'gasto',   categoria: 'Servicios',            monto: 21_000,   nota: 'Luz' },
    { id: id(), fecha: fechaMes(m, 7),  tipo: 'gasto',   categoria: 'Servicios',            monto: 14_500,   nota: 'Gas' },
    { id: id(), fecha: fechaMes(m, 8),  tipo: 'gasto',   categoria: 'Servicios',            monto: 11_500,   nota: 'Internet' },
    { id: id(), fecha: fechaMes(m, 9),  tipo: 'gasto',   categoria: 'Servicios',            monto: 7_990,    nota: 'Netflix + Spotify' },
    // Alimentos (4 compras semanales + 2 extras)
    { id: id(), fecha: fechaMes(m, 4),  tipo: 'gasto',   categoria: 'Alimentos y bebidas',  monto: 88_000,   nota: 'Super semanal' },
    { id: id(), fecha: fechaMes(m, 11), tipo: 'gasto',   categoria: 'Alimentos y bebidas',  monto: 82_000,   nota: 'Carrefour + verdulería' },
    { id: id(), fecha: fechaMes(m, 17), tipo: 'gasto',   categoria: 'Alimentos y bebidas',  monto: 79_500,   nota: 'Compra semanal' },
    { id: id(), fecha: fechaMes(m, 24), tipo: 'gasto',   categoria: 'Alimentos y bebidas',  monto: 91_000,   nota: 'Super + fiambrería' },
    { id: id(), fecha: fechaMes(m, 13), tipo: 'gasto',   categoria: 'Alimentos y bebidas',  monto: 42_000,   nota: 'Restaurante / delivery' },
    // Transporte
    { id: id(), fecha: fechaMes(m, 2),  tipo: 'gasto',   categoria: 'Transporte',           monto: 18_000,   nota: 'SUBE mensual' },
    { id: id(), fecha: fechaMes(m, 15), tipo: 'gasto',   categoria: 'Transporte',           monto: 40_000,   nota: 'Nafta' },
    { id: id(), fecha: fechaMes(m, 21), tipo: 'gasto',   categoria: 'Transporte',           monto: 9_500,    nota: 'Uber' },
    // Salud
    { id: id(), fecha: fechaMes(m, 10), tipo: 'gasto',   categoria: 'Salud',                monto: 78_000,   nota: 'OSDE 210' },
    // Educación
    { id: id(), fecha: fechaMes(m, 20), tipo: 'gasto',   categoria: 'Educación',            monto: 45_000,   nota: 'Cursos / libros' },
    // Entretenimiento
    { id: id(), fecha: fechaMes(m, 14), tipo: 'gasto',   categoria: 'Entretenimiento y ocio',monto: 35_000,  nota: 'Salidas / entretenimiento' },
    ...extras,
  ]
}

const txHistorico: Transaccion[] = [
  ...generarMes(1, 2_350_000, 450_000, [
    { id: id(), fecha: fechaMes(1, 22), tipo: 'ingreso', categoria: 'Ventas',              monto: 120_000, nota: 'Venta teclado mecánico' },
    { id: id(), fecha: fechaMes(1, 28), tipo: 'gasto',   categoria: 'Ropa y accesorios',   monto: 76_000,  nota: 'Adidas — zapatillas running' },
    { id: id(), fecha: fechaMes(1, 19), tipo: 'gasto',   categoria: 'Salud',               monto: 28_000,  nota: 'Análisis de sangre completo' },
  ]),
  ...generarMes(2, 2_200_000, 390_000, [
    { id: id(), fecha: fechaMes(2, 8),  tipo: 'ingreso', categoria: 'Freelance / Proyectos',monto: 280_000, nota: 'App móvil cliente Mendoza' },
    { id: id(), fecha: fechaMes(2, 25), tipo: 'gasto',   categoria: 'Otros',               monto: 55_000,  nota: 'Regalo aniversario + cena' },
  ]),
  ...generarMes(3, 2_350_000, 520_000, [
    { id: id(), fecha: fechaMes(3, 12), tipo: 'ingreso', categoria: 'Inversiones',         monto: 145_000, nota: 'Venta BTC — small profit' },
    { id: id(), fecha: fechaMes(3, 20), tipo: 'gasto',   categoria: 'Educación',           monto: 95_000,  nota: 'Bootcamp Fullstack — cuota 1/3' },
    { id: id(), fecha: fechaMes(3, 27), tipo: 'gasto',   categoria: 'Ropa y accesorios',   monto: 130_000, nota: 'Ropa invierno — Zara + H&M' },
  ]),
  ...generarMes(4, 2_100_000, 310_000, [
    { id: id(), fecha: fechaMes(4, 10), tipo: 'gasto',   categoria: 'Salud',               monto: 42_000,  nota: 'Kinesiólogo 4 sesiones' },
    { id: id(), fecha: fechaMes(4, 16), tipo: 'gasto',   categoria: 'Educación',           monto: 95_000,  nota: 'Bootcamp Fullstack — cuota 2/3' },
  ]),
  ...generarMes(5, 2_200_000, 420_000, [
    { id: id(), fecha: fechaMes(5, 5),  tipo: 'ingreso', categoria: 'Ventas',              monto: 200_000, nota: 'Venta silla gamer' },
    { id: id(), fecha: fechaMes(5, 18), tipo: 'gasto',   categoria: 'Educación',           monto: 95_000,  nota: 'Bootcamp Fullstack — cuota 3/3' },
    { id: id(), fecha: fechaMes(5, 22), tipo: 'gasto',   categoria: 'Otros',               monto: 180_000, nota: 'Viaje FDS Carlos Paz — hotel + gasolina' },
  ]),
  ...generarMes(6, 2_050_000, 350_000, [
    { id: id(), fecha: fechaMes(6, 15), tipo: 'gasto',   categoria: 'Otros',               monto: 85_000,  nota: 'Cumpleaños 26 — asado 20 personas' },
  ]),
  ...generarMes(7, 1_980_000, 290_000, [
    { id: id(), fecha: fechaMes(7, 20), tipo: 'gasto',   categoria: 'Ropa y accesorios',   monto: 68_000,  nota: 'Nike jacket + 2 remeras' },
  ]),
  ...generarMes(8, 1_900_000, 380_000, [
    { id: id(), fecha: fechaMes(8, 12), tipo: 'ingreso', categoria: 'Otros ingresos',      monto: 95_000,  nota: 'Referido nuevo cliente a agencia' },
    { id: id(), fecha: fechaMes(8, 25), tipo: 'gasto',   categoria: 'Otros',               monto: 120_000, nota: 'Tablet Samsung para trabajo' },
  ]),
  ...generarMes(9, 1_850_000, 320_000, []),
  ...generarMes(10, 1_800_000, 290_000, [
    { id: id(), fecha: fechaMes(10, 8), tipo: 'ingreso', categoria: 'Ventas',              monto: 160_000, nota: 'Venta consola PS4 + juegos' },
  ]),
  ...generarMes(11, 1_750_000, 260_000, []),
]

export const transaccionesDemo: Transaccion[] = [...txMesActual, ...txHistorico]

// ─── Días activos — 365-day streak with realistic gaps ───────────────────────

export function generarDiasActivosDemo(): DiaActivo[] {
  const dias: DiaActivo[] = []
  // 365 consecutive days — a few gaps for realism (sick days, travel)
  const gaps = new Set([45, 46, 120, 180, 181, 240])
  for (let i = 0; i <= 364; i++) {
    if (!gaps.has(i)) {
      dias.push({ fecha: fechaDias(i), porTransaccion: i > 30, porCheckIn: true })
    }
  }
  return dias
}

// ─── Presupuestos — 3 months ──────────────────────────────────────────────────

const mesHoy    = format(new Date(), 'yyyy-MM')
const mesPrev1  = format(subMonths(new Date(), 1), 'yyyy-MM')
const mesPrev2  = format(subMonths(new Date(), 2), 'yyyy-MM')

export const presupuestosDemo: Presupuesto[] = [
  // Mes actual
  { id: 'pres-01', categoria: 'Alimentos y bebidas',    monto: 520_000, mes: mesHoy },
  { id: 'pres-02', categoria: 'Transporte',              monto: 90_000,  mes: mesHoy },
  { id: 'pres-03', categoria: 'Salud',                   monto: 130_000, mes: mesHoy },
  { id: 'pres-04', categoria: 'Entretenimiento y ocio',  monto: 75_000,  mes: mesHoy },
  { id: 'pres-05', categoria: 'Educación',               monto: 100_000, mes: mesHoy },
  { id: 'pres-06', categoria: 'Servicios',               monto: 70_000,  mes: mesHoy },
  { id: 'pres-07', categoria: 'Ropa y accesorios',       monto: 120_000, mes: mesHoy },
  { id: 'pres-08', categoria: 'Otros',                   monto: 80_000,  mes: mesHoy },
  // Mes anterior
  { id: 'pres-09', categoria: 'Alimentos y bebidas',    monto: 490_000, mes: mesPrev1 },
  { id: 'pres-10', categoria: 'Transporte',              monto: 85_000,  mes: mesPrev1 },
  { id: 'pres-11', categoria: 'Salud',                   monto: 120_000, mes: mesPrev1 },
  { id: 'pres-12', categoria: 'Entretenimiento y ocio',  monto: 70_000,  mes: mesPrev1 },
  { id: 'pres-13', categoria: 'Educación',               monto: 90_000,  mes: mesPrev1 },
  { id: 'pres-14', categoria: 'Servicios',               monto: 65_000,  mes: mesPrev1 },
  // Hace 2 meses
  { id: 'pres-15', categoria: 'Alimentos y bebidas',    monto: 460_000, mes: mesPrev2 },
  { id: 'pres-16', categoria: 'Transporte',              monto: 80_000,  mes: mesPrev2 },
  { id: 'pres-17', categoria: 'Salud',                   monto: 110_000, mes: mesPrev2 },
  { id: 'pres-18', categoria: 'Entretenimiento y ocio',  monto: 60_000,  mes: mesPrev2 },
  { id: 'pres-19', categoria: 'Educación',               monto: 150_000, mes: mesPrev2 },
  { id: 'pres-20', categoria: 'Servicios',               monto: 62_000,  mes: mesPrev2 },
]

// ─── Debts ────────────────────────────────────────────────────────────────────

export const deudasDemo: Deuda[] = [
  {
    id: 'deuda-1',
    nombre: 'Tarjeta Visa — BBVA',
    tipo: 'Tarjeta de crédito',
    montoTotal: 680_000,
    montoRestante: 420_000,
    tasaInteres: 72,
    cuotaMensual: 140_000,
  },
  {
    id: 'deuda-2',
    nombre: 'Préstamo personal Banco Nación',
    tipo: 'Préstamo',
    montoTotal: 2_400_000,
    montoRestante: 1_560_000,
    tasaInteres: 48,
    fechaVencimiento: fechaMes(-24, 1),
    cuotaMensual: 110_000,
  },
  {
    id: 'deuda-3',
    nombre: 'Cuotas notebook MacBook Air M2',
    tipo: 'Otro',
    montoTotal: 1_200_000,
    montoRestante: 480_000,
    cuotaMensual: 100_000,
  },
  {
    id: 'deuda-4',
    nombre: 'Tarjeta Mastercard — Naranja X',
    tipo: 'Tarjeta de crédito',
    montoTotal: 340_000,
    montoRestante: 185_000,
    tasaInteres: 65,
    cuotaMensual: 62_000,
  },
  {
    id: 'deuda-5',
    nombre: 'Cuotas moto Honda CG 150',
    tipo: 'Préstamo',
    montoTotal: 1_800_000,
    montoRestante: 950_000,
    tasaInteres: 38,
    fechaVencimiento: fechaMes(-30, 1),
    cuotaMensual: 78_000,
  },
]

// ─── Habits ───────────────────────────────────────────────────────────────────

export const habitosDemo: Habito[] = [
  { id: 'h1', nombre: 'Ejercicio',       emoji: '💪', color: '#10b981', activo: true, creadoEn: fechaDias(180) },
  { id: 'h2', nombre: 'Lectura 30min',   emoji: '📖', color: '#3b82f6', activo: true, creadoEn: fechaDias(180) },
  { id: 'h3', nombre: 'Meditación',      emoji: '🧘', color: '#8b5cf6', activo: true, creadoEn: fechaDias(120) },
  { id: 'h4', nombre: 'Ahorro diario',   emoji: '💰', color: '#f59e0b', activo: true, creadoEn: fechaDias(180) },
  { id: 'h5', nombre: 'Sin alcohol',     emoji: '🎯', color: '#f43f5e', activo: true, creadoEn: fechaDias(90) },
  { id: 'h6', nombre: 'Hidratación 2L',  emoji: '💧', color: '#06b6d4', activo: true, creadoEn: fechaDias(90) },
  { id: 'h7', nombre: 'Ducha fría',      emoji: '🧊', color: '#64748b', activo: true, creadoEn: fechaDias(60) },
  { id: 'h8', nombre: 'Sin redes <10am', emoji: '📵', color: '#f97316', activo: true, creadoEn: fechaDias(45) },
]

// Completion patterns per habit: set of days-to-skip (0 = today)
// h1 Ejercicio: skips weekends + random rest days ~ 73%
// h2 Lectura: very consistent ~ 92%
// h3 Meditación: decent ~ 80%
// h4 Ahorro diario: near-perfect ~ 96%
// h5 Sin alcohol: good ~ 88%
// h6 Hidratación: mixed ~ 74%
// h7 Ducha fría (since day 60): hard ~ 62%
// h8 No redes (since day 45): hardest ~ 55%

function buildRegistros(): RegistroHabito[] {
  const regs: RegistroHabito[] = []

  function addForHabit(hid: string, diasDisp: number, skipSet: Set<number>) {
    for (let i = 0; i < diasDisp; i++) {
      if (!skipSet.has(i)) {
        regs.push({ habitoId: hid, fecha: fechaDias(i) })
      }
    }
  }

  // h1 Ejercicio — 180 days, skip sundays and some saturdays + random
  const h1Skips = new Set<number>()
  for (let i = 0; i < 180; i++) {
    const dow = new Date(new Date().getTime() - i * 86400000).getDay()
    if (dow === 0) h1Skips.add(i) // sunday
    if (dow === 6 && i % 3 !== 0) h1Skips.add(i) // most saturdays
    if ([12, 28, 41, 55, 67, 83, 99, 112, 130, 145, 161, 175].includes(i)) h1Skips.add(i)
  }
  addForHabit('h1', 180, h1Skips)

  // h2 Lectura — 180 days, very few skips
  const h2Skips = new Set([5, 11, 22, 38, 47, 63, 79, 95, 108, 124, 140, 156, 172])
  addForHabit('h2', 180, h2Skips)

  // h3 Meditación — 120 days, moderate skips
  const h3Skips = new Set([3, 8, 15, 21, 27, 34, 41, 48, 55, 62, 69, 76, 83, 90, 97, 104, 111, 118])
  addForHabit('h3', 120, h3Skips)

  // h4 Ahorro diario — 180 days, almost never misses
  const h4Skips = new Set([19, 45, 90, 135, 168, 178])
  addForHabit('h4', 180, h4Skips)

  // h5 Sin alcohol — 90 days
  const h5Skips = new Set<number>()
  for (let i = 0; i < 90; i++) {
    const dow = new Date(new Date().getTime() - i * 86400000).getDay()
    if ((dow === 6 || dow === 0) && [4, 18, 32, 46, 60, 74, 88].includes(i)) h5Skips.add(i)
  }
  addForHabit('h5', 90, h5Skips)

  // h6 Hidratación 2L — 90 days, often forgets
  const h6Skips = new Set([2, 6, 9, 14, 18, 23, 28, 33, 37, 42, 47, 51, 56, 61, 65, 70, 75, 79, 84, 88])
  addForHabit('h6', 90, h6Skips)

  // h7 Ducha fría — 60 days, just started
  const h7Skips = new Set([1, 4, 7, 10, 14, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57])
  addForHabit('h7', 60, h7Skips)

  // h8 No redes <10am — 45 days, hardest
  const h8Skips = new Set([0, 2, 5, 7, 10, 12, 15, 17, 20, 23, 25, 28, 30, 33, 36, 38, 41, 43])
  addForHabit('h8', 45, h8Skips)

  return regs
}

export const registrosHabitoDemo: RegistroHabito[] = buildRegistros()

// ─── Estado del día (mood) — last 30 days ─────────────────────────────────────

export const estadosDiaDemo: EstadoDia[] = [
  { fecha: fechaDias(0),  estado: 5, motivacion: 5 },
  { fecha: fechaDias(1),  estado: 5, motivacion: 4 },
  { fecha: fechaDias(2),  estado: 4, motivacion: 5 },
  { fecha: fechaDias(3),  estado: 5, motivacion: 5 },
  { fecha: fechaDias(4),  estado: 3, motivacion: 3 },
  { fecha: fechaDias(5),  estado: 4, motivacion: 4 },
  { fecha: fechaDias(6),  estado: 5, motivacion: 5 },
  { fecha: fechaDias(7),  estado: 5, motivacion: 5 },
  { fecha: fechaDias(8),  estado: 4, motivacion: 3 },
  { fecha: fechaDias(9),  estado: 5, motivacion: 5 },
  { fecha: fechaDias(10), estado: 3, motivacion: 4 },
  { fecha: fechaDias(11), estado: 4, motivacion: 4 },
  { fecha: fechaDias(12), estado: 5, motivacion: 5 },
  { fecha: fechaDias(13), estado: 4, motivacion: 4 },
  { fecha: fechaDias(14), estado: 2, motivacion: 2 },
  { fecha: fechaDias(15), estado: 3, motivacion: 3 },
  { fecha: fechaDias(16), estado: 4, motivacion: 4 },
  { fecha: fechaDias(17), estado: 5, motivacion: 5 },
  { fecha: fechaDias(18), estado: 5, motivacion: 4 },
  { fecha: fechaDias(19), estado: 4, motivacion: 5 },
  { fecha: fechaDias(20), estado: 3, motivacion: 3 },
  { fecha: fechaDias(21), estado: 4, motivacion: 4 },
  { fecha: fechaDias(22), estado: 5, motivacion: 5 },
  { fecha: fechaDias(23), estado: 5, motivacion: 5 },
  { fecha: fechaDias(24), estado: 4, motivacion: 4 },
  { fecha: fechaDias(25), estado: 5, motivacion: 5 },
  { fecha: fechaDias(26), estado: 3, motivacion: 2 },
  { fecha: fechaDias(27), estado: 4, motivacion: 4 },
  { fecha: fechaDias(28), estado: 5, motivacion: 5 },
  { fecha: fechaDias(29), estado: 4, motivacion: 4 },
]

// ─── Tareas ───────────────────────────────────────────────────────────────────

export const tareasDemo: Tarea[] = [
  // COMPLETADAS
  {
    id: 'tarea-1', titulo: 'Cerrar contrato con cliente Martín',
    descripcion: 'Enviar propuesta formal + NDA. Firmado el 24/06',
    prioridad: 'Alta', estado: 'Completada', categoria: 'Trabajo',
    creadaEn: fechaDias(30), fechaVencimiento: fechaDias(23),
    tags: ['cliente', 'contrato', 'freelance'],
  },
  {
    id: 'tarea-2', titulo: 'Reconciliar facturación junio',
    descripcion: 'Verificar 3 facturas pendientes con Banco Nación',
    prioridad: 'Alta', estado: 'Completada', categoria: 'Finanzas',
    creadaEn: fechaDias(18), tags: ['dinero', 'admin'],
  },
  {
    id: 'tarea-3', titulo: 'Renovar OSDE plan 210',
    descripcion: 'Reajuste por inflación. Nuevo monto: $78k/mes',
    prioridad: 'Alta', estado: 'Completada', categoria: 'Salud',
    creadaEn: fechaDias(25), tags: ['salud', 'mensual'],
  },
  {
    id: 'tarea-4', titulo: 'Presupuesto trimestral Q3 2026',
    descripcion: 'Proyección julio–septiembre. Meta ahorro: 22%',
    prioridad: 'Alta', estado: 'Completada', categoria: 'Finanzas',
    creadaEn: fechaDias(8), tags: ['dinero', 'planificación'],
  },
  {
    id: 'tarea-5', titulo: 'Configurar PM2 para bots de trading',
    descripcion: 'btc-scalper + scanner + phoenix en production',
    prioridad: 'Alta', estado: 'Completada', categoria: 'Trabajo',
    creadaEn: fechaDias(45), fechaVencimiento: fechaDias(40),
    tags: ['dev', 'trading', 'automatización'],
  },
  {
    id: 'tarea-6', titulo: 'Entregar diseño UI dashboard cliente',
    descripcion: 'Figma + Storybook. Cliente aprobó v3',
    prioridad: 'Alta', estado: 'Completada', categoria: 'Trabajo',
    creadaEn: fechaDias(20), tags: ['cliente', 'diseño', 'freelance'],
  },
  {
    id: 'tarea-7', titulo: 'Renegociar alquiler con propietario',
    descripcion: 'Subida acordada de 920k (+8% sobre anterior). OK',
    prioridad: 'Media', estado: 'Completada', categoria: 'Hogar',
    creadaEn: fechaDias(35), tags: ['alquiler', 'negociación'],
  },
  {
    id: 'tarea-8', titulo: 'Terminar bootcamp Fullstack',
    descripcion: '3 cuotas completadas. Certificado recibido 15/05',
    prioridad: 'Alta', estado: 'Completada', categoria: 'Educación',
    creadaEn: fechaDias(90), tags: ['educación', 'dev'],
  },
  // EN PROGRESO
  {
    id: 'tarea-9', titulo: 'Landing page ecommerce — cliente nueva',
    descripcion: 'React + Tailwind + Stripe. Entrega: 20/07. 60% avanzado',
    prioridad: 'Alta', estado: 'En progreso', categoria: 'Trabajo',
    creadaEn: fechaDias(10), fechaVencimiento: fechaDias(-17),
    tags: ['dev', 'cliente', 'freelance', 'urgente'],
  },
  {
    id: 'tarea-10', titulo: 'Estrategia de inversiones Q3',
    descripcion: 'Comparar FCI Balanz vs IOL vs acciones locales. Armar portafolio',
    prioridad: 'Alta', estado: 'En progreso', categoria: 'Finanzas',
    creadaEn: fechaDias(12), tags: ['inversiones', 'dinero', 'estrategia'],
  },
  {
    id: 'tarea-11', titulo: 'Automatizar sistema de content para Fidel',
    descripcion: 'ig-processor pipeline: ClickUp → Claude → Ollama → subtareas por slide',
    prioridad: 'Alta', estado: 'En progreso', categoria: 'Trabajo',
    creadaEn: fechaDias(7), tags: ['automatización', 'dev', 'fidel'],
  },
  {
    id: 'tarea-12', titulo: 'Organizar home office',
    descripcion: 'Mesa nueva, gestión de cables, iluminación LED',
    prioridad: 'Media', estado: 'En progreso', categoria: 'Hogar',
    creadaEn: fechaDias(5), tags: ['productividad', 'hogar'],
  },
  {
    id: 'tarea-13', titulo: 'Estudiar opciones financieras — Rava Bursátil',
    descripcion: 'Módulo 3: opciones y futuros',
    prioridad: 'Media', estado: 'En progreso', categoria: 'Educación',
    creadaEn: fechaDias(14), tags: ['educación', 'inversiones'],
  },
  // SIN EMPEZAR
  {
    id: 'tarea-14', titulo: 'Planificar viaje Bariloche agosto',
    descripcion: 'Vuelo + hotel + actividades. Presupuesto máx: $600k',
    prioridad: 'Media', estado: 'Sin empezar', categoria: 'Personal',
    creadaEn: fechaDias(4), fechaVencimiento: fechaDias(-28),
    tags: ['viaje', 'personal'],
  },
  {
    id: 'tarea-15', titulo: 'Actualizar portafolio web personal',
    descripcion: 'Agregar 3 proyectos nuevos. Rediseñar hero section',
    prioridad: 'Media', estado: 'Sin empezar', categoria: 'Trabajo',
    creadaEn: fechaDias(3), tags: ['dev', 'portafolio', 'marca'],
  },
  {
    id: 'tarea-16', titulo: 'Sacar turno traumatólogo rodilla',
    descripcion: 'Seguimiento lesión. Pedido de resonancia pendiente',
    prioridad: 'Alta', estado: 'Sin empezar', categoria: 'Salud',
    creadaEn: fechaDias(6), fechaVencimiento: fechaDias(-7),
    tags: ['salud', 'urgente'],
  },
  {
    id: 'tarea-17', titulo: 'Leer "The Millionaire Fastlane"',
    prioridad: 'Baja', estado: 'Sin empezar', categoria: 'Educación',
    creadaEn: fechaDias(2), tags: ['libro', 'educación'],
  },
  {
    id: 'tarea-18', titulo: 'Configurar ManyChat para DMs de Fidel',
    descripcion: 'Flujos de respuesta automática + calificación leads',
    prioridad: 'Alta', estado: 'Sin empezar', categoria: 'Trabajo',
    creadaEn: fechaDias(1), tags: ['automatización', 'fidel', 'urgente'],
  },
  {
    id: 'tarea-19', titulo: 'Armar ebook "Finanzas para freelancers AR"',
    descripcion: 'Guía Gumroad. 20-30 páginas. Precio: $5 USD',
    prioridad: 'Media', estado: 'Sin empezar', categoria: 'Trabajo',
    creadaEn: fechaDias(2), tags: ['ingreso-pasivo', 'escritura', 'finanzas'],
  },
  {
    id: 'tarea-20', titulo: 'Abrir cuenta en Balanz para inversiones',
    descripcion: 'Comparar con IOL. Elegir plataforma principal',
    prioridad: 'Baja', estado: 'Sin empezar', categoria: 'Finanzas',
    creadaEn: fechaDias(3), tags: ['inversiones', 'dinero'],
  },
  // CANCELADAS
  {
    id: 'tarea-21', titulo: 'Aprender Rust desde cero',
    descripcion: 'Prioridad bajísima. TypeScript cubre todo por ahora',
    prioridad: 'Opcional', estado: 'Cancelada', categoria: 'Educación',
    creadaEn: fechaDias(60), tags: ['dev', 'educación'],
  },
  {
    id: 'tarea-22', titulo: 'Crear canal YouTube tech',
    descripcion: 'Demasiado tiempo. Foco primero en digital products',
    prioridad: 'Baja', estado: 'Cancelada', categoria: 'Personal',
    creadaEn: fechaDias(45), tags: ['contenido', 'personal'],
  },
]

// ─── Weekly planner — 8 weeks ─────────────────────────────────────────────────

export const registrosSemanalesDemo: RegistroSemanal[] = [
  {
    semana: lunesSemana(0),
    dias: {
      [diaSemana(0, 0)]: { notas: 'Kickoff landing page ecommerce. Armé el wireframe completo', mejoras: 'Empezar más temprano, no a las 10', gratitud: 'El cliente pagó el 50% por adelantado 🙌' },
      [diaSemana(0, 1)]: { notas: 'Avancé 3h en header + hero. Gym a las 7am, buena sesión', mejoras: 'Menos redes antes de dormir', gratitud: 'Código salió limpio, sin refactorings' },
      [diaSemana(0, 2)]: { notas: 'Reunión con Fidel: estrategia de contenido para julio', mejoras: 'Preparar agenda antes de cada reunión', gratitud: 'Alineados en la visión, buena energía' },
      [diaSemana(0, 3)]: { notas: 'Estudié FCI + acciones IOL. Moví $200k de plazo fijo a FCI', mejoras: 'Hacer análisis más profundo antes de mover plata', gratitud: 'Rendimiento del portafolio subió 3.2%' },
      [diaSemana(0, 4)]: { notas: 'Review semanal + planificación semana siguiente. Todo en verde', mejoras: 'Sacar más tiempo para leer', gratitud: 'Semana con superávit de $480k, la mejor del mes' },
    },
  },
  {
    semana: lunesSemana(1),
    dias: {
      [diaSemana(1, 0)]: { notas: 'Entregué diseño UI al cliente. Primera aprobación', mejoras: 'Documentar mejor los cambios pedidos', gratitud: 'El cliente quedó muy conforme con la propuesta' },
      [diaSemana(1, 1)]: { notas: 'Configuré ManyChat flows para DMs de Fidel. 3 flujos activos', mejoras: 'Menos interrupciones durante bloques de trabajo', gratitud: 'Automaticé algo que antes le quitaba 2h/día a Fidel' },
      [diaSemana(1, 2)]: { notas: 'Gym + meditación 20min + trabajo 6h. Día redondo', mejoras: 'Meditar antes del trabajo, no después', gratitud: 'Me sentí en flujo durante el 80% del día' },
      [diaSemana(1, 3)]: { notas: 'Llamada con Agustín (Quarterolo) — feedback muy valioso', mejoras: 'Aplicar los frameworks que me dio esta semana', gratitud: 'Tengo mentores increíbles que me empujan a más' },
      [diaSemana(1, 4)]: { notas: 'Día de admin: facturas, presupuesto Q3, deudas', mejoras: 'Hacer el día admin siempre el mismo día de la semana', gratitud: 'Saldo positivo, deudas disminuyendo mes a mes' },
    },
  },
  {
    semana: lunesSemana(2),
    dias: {
      [diaSemana(2, 0)]: { notas: 'Reunión kickoff automatización ig-processor con Fidel', mejoras: 'Definir mejor el alcance antes de arrancar', gratitud: 'El pipeline funciona, primer slide procesado con éxito' },
      [diaSemana(2, 1)]: { notas: 'Deep work 5h en landing page — componentes Card + CTA', mejoras: 'Silenciar el celular durante bloques de foco', gratitud: 'Avancé 35% en un solo día de concentración' },
      [diaSemana(2, 2)]: { notas: 'Inversiones: abrí cuenta Balanz + primer depósito $300k', mejoras: 'Investigar más antes de diversificar más', gratitud: 'Primer paso hacia portafolio más sofisticado' },
      [diaSemana(2, 3)]: { notas: 'Networking evento Tech Córdoba, 3 contactos nuevos', mejoras: 'Llevar tarjetas/QR la próxima vez', gratitud: 'Conocí dev que me puede derivar clientes' },
      [diaSemana(2, 4)]: { notas: 'Review: metas al 75%. Hábitos al 88%. Buena semana', mejoras: 'Ser más consistente con ducha fría', gratitud: 'La racha de hábitos me da mucha energía' },
    },
  },
  {
    semana: lunesSemana(3),
    dias: {
      [diaSemana(3, 0)]: { notas: 'Semana difícil — rodilla molestando desde el lunes', mejoras: 'No ignorar las señales del cuerpo', gratitud: 'Pude trabajar igual desde casa, sin perder productividad' },
      [diaSemana(3, 1)]: { notas: 'Traumatólogo: reposo activo 2 semanas. Sin impacto', mejoras: 'Sacar turno apenas aparece el dolor, no esperar', gratitud: 'No es nada grave, sólo inflamación' },
      [diaSemana(3, 2)]: { notas: 'Foco 100% trabajo: avancé fuerte en ig-processor pipeline', mejoras: 'Compensar días sin gym con stretching', gratitud: 'El pipeline ya procesa 3 carruseles solos en paralelo' },
      [diaSemana(3, 3)]: { notas: 'Cobré $580k proyecto landing + $320k consultoría. Gran día', mejoras: 'Diversificar fuentes de ingreso más rápido', gratitud: 'El mejor mes en ingresos freelance desde que empecé' },
      [diaSemana(3, 4)]: { notas: 'Planifiqué viaje Bariloche + presupuesto. Fechas: 8-14 agosto', mejoras: 'Reservar con más anticipación la próxima', gratitud: 'Me lo merezco, fue un trimestre muy productivo' },
    },
  },
  {
    semana: lunesSemana(4),
    dias: {
      [diaSemana(4, 0)]: { notas: 'Reunión cierre propuesta con cliente Martín — firmado', mejoras: 'Ser más directo con los timelines desde el inicio', gratitud: 'Tercer cliente freelance este trimestre' },
      [diaSemana(4, 1)]: { notas: 'Gym vuelvo — peso a 80% por la rodilla. Bien', mejoras: 'Calentar 15min siempre, no saltarlo', gratitud: 'La rodilla está mejor que la semana pasada' },
      [diaSemana(4, 2)]: { notas: 'Estudié opciones financieras Rava — módulo 3 terminado', mejoras: 'Aplicar lo aprendido antes de estudiar más', gratitud: 'El conocimiento de finanzas me cambia la cabeza' },
      [diaSemana(4, 3)]: { notas: 'Empecé esquema ebook "Finanzas para freelancers AR"', mejoras: 'Dedicar 1h fija por día, no "cuando tenga tiempo"', gratitud: 'Tengo mucho para aportar en este tema' },
      [diaSemana(4, 4)]: { notas: 'Review: semana muy productiva a pesar de la rodilla', mejoras: 'Usar más la mañana temprana', gratitud: 'Ingresos, salud, hábitos — todo en verde esta semana' },
    },
  },
  {
    semana: lunesSemana(5),
    dias: {
      [diaSemana(5, 0)]: { notas: 'Configuré pm2 para todos los bots. Resurrect automático funcionando', mejoras: 'Documentar mejor cada bot antes de olvidar cómo funciona', gratitud: 'Los bots de trading corren solos, ingreso semi-pasivo activo' },
      [diaSemana(5, 1)]: { notas: 'Gymn fuerte + 45min lectura "RICHER WISER HAPPIER". Muy bueno', mejoras: 'Aplicar un aprendizaje por semana, no solo leer', gratitud: 'La rutina matutina es mi mejor inversión de tiempo' },
      [diaSemana(5, 2)]: { notas: 'Sofía cerró deal de wholesaling — mi parte $85k comisión', mejoras: 'Acelerar el proceso de due diligence', gratitud: 'El equity del negocio con Sofía empieza a dar frutos' },
      [diaSemana(5, 4)]: { notas: 'Review mes: mejor mes del año en finanzas + hábitos', mejoras: 'Celebrar más los logros, soy muy autocrítico', gratitud: 'Un año de CIMA me cambió la relación con el dinero' },
    },
  },
  {
    semana: lunesSemana(6),
    dias: {
      [diaSemana(6, 0)]: { notas: 'Arranqué hábito ducha fría — primer día. HELADA', mejoras: 'Empezar con 30 seg, no al 100% desde el día 1', gratitud: 'Salí del frío con más energía de la esperada' },
      [diaSemana(6, 1)]: { notas: 'Deep work en landing page. Stripe integrado y funcionando', mejoras: 'Testear flujo completo antes de mostrar al cliente', gratitud: 'El cliente quedó impresionado con el avance' },
      [diaSemana(6, 2)]: { notas: 'Meditación 25min. Gym. Luego 4h de foco en ebook', mejoras: 'Proteger los bloques de mañana como sagrados', gratitud: 'El ebook va a cambiarle la vida a mucha gente' },
      [diaSemana(6, 3)]: { notas: 'Revisé deudas: pagué $140k Visa + $110k préstamo Nación', mejoras: 'Acelerar pago de deudas de mayor tasa primero', gratitud: 'Cada mes con menos deuda me da más libertad' },
      [diaSemana(6, 4)]: { notas: 'Plan FDS: asado familiar + tarde libre', mejoras: 'Descansar de verdad, sin culpa', gratitud: 'Familia increíble, me dan la energía para seguir' },
    },
  },
  {
    semana: lunesSemana(7),
    dias: {
      [diaSemana(7, 0)]: { notas: 'Semana de planificación: OKRs Q3 definidos', mejoras: 'Menos objetivos pero más comprometido con cada uno', gratitud: 'Tengo claridad de hacia dónde voy, eso vale oro' },
      [diaSemana(7, 2)]: { notas: 'Gym + 1h lectura + trabajo 5h. Triple win', mejoras: 'Acostarme a las 23h, no a la 1am', gratitud: 'Los hábitos se volvieron parte de quien soy' },
      [diaSemana(7, 4)]: { notas: 'Cierre de semana: metas al 80%, hábitos al 85%', mejoras: 'Enfocarse en completar, no solo empezar', gratitud: 'Soy más consistente que hace un año. Eso es todo.' },
    },
  },
]

// ─── Perfil ───────────────────────────────────────────────────────────────────

export const perfilDemo: PerfilUsuario = {
  nombre: 'Alejo',
  objetivo: 'libertad',
  obstaculo: 'Deudas y gastos variables difíciles de predecir',
  intereses: ['Inversiones', 'Tecnología', 'Fitness', 'Trading', 'Escritura'],
  onboardingCompletado: true,
  creadoEn: fechaDias(365),
}

// ─── Dashboards ───────────────────────────────────────────────────────────────

const hoyStr = format(new Date(), 'yyyy-MM-dd')

export const dashboardsDemo: Dashboard[] = [
  {
    id: 'db-demo-1',
    nombre: 'Finanzas',
    creadoEn: hoyStr,
    widgets: [
      { id: 'w-d1-1', type: 'kpi_balance' },
      { id: 'w-d1-2', type: 'kpi_ingresos' },
      { id: 'w-d1-3', type: 'kpi_gastos' },
      { id: 'w-d1-4', type: 'kpi_ahorro' },
      { id: 'w-d1-5', type: 'kpi_deuda' },
      { id: 'w-d1-6', type: 'chart_bar_6meses' },
      { id: 'w-d1-7', type: 'chart_pie_gastos' },
      { id: 'w-d1-8', type: 'chart_area_ahorro' },
      { id: 'w-d1-9', type: 'recent_tx' },
      { id: 'w-d1-a', type: 'camino_millon' },
    ],
  },
  {
    id: 'db-demo-2',
    nombre: 'Productividad',
    creadoEn: hoyStr,
    widgets: [
      { id: 'w-d2-1', type: 'kpi_racha' },
      { id: 'w-d2-2', type: 'kpi_xp' },
      { id: 'w-d2-3', type: 'kpi_tareas' },
      { id: 'w-d2-4', type: 'task_progress' },
      { id: 'w-d2-5', type: 'chart_habits' },
    ],
  },
  {
    id: 'db-demo-3',
    nombre: 'Overview',
    creadoEn: hoyStr,
    widgets: [
      { id: 'w-d3-1', type: 'kpi_balance' },
      { id: 'w-d3-2', type: 'kpi_racha' },
      { id: 'w-d3-3', type: 'kpi_xp' },
      { id: 'w-d3-4', type: 'kpi_tareas' },
      { id: 'w-d3-5', type: 'camino_millon' },
      { id: 'w-d3-6', type: 'recent_tx' },
    ],
  },
]

// ─── XP Events ────────────────────────────────────────────────────────────────
// 365 check-ins × 5          =  1,825
// 365 transactions × 5       =  1,825
// h1 ~128 days × 10          =  1,280
// h2 ~166 days × 10          =  1,660
// h3 ~96  days × 10          =    960
// h4 ~173 days × 10          =  1,730
// h5 ~79  days × 10          =    790
// h6 ~70  days × 10          =    700
// h7 ~44  days × 10          =    440
// h8 ~25  days × 10          =    250
// 30 alta tasks × 25         =    750
// 30 media tasks × 15        =    450
// 15 baja tasks × 10         =    150
// 60 journals × 3            =    180
// 1  onboarding × 50         =     50
// Total ≈                    = 11,040  → Zafiro → bump to Élite with extra events
// Extra: achievements × 100  =  9,000
// Grand total ≈              = 20,040 XP (Élite)

export const xpEventosDemo: EventoXP[] = [
  { fecha: fechaDias(365), cantidad: 50, motivo: 'Bienvenido a CIMA 🎉' },
  // Check-ins diarios
  ...Array.from({ length: 365 }, (_, i) => ({
    fecha: fechaDias(364 - i),
    cantidad: 5,
    motivo: 'Check-in diario',
  })),
  // Transacciones
  ...Array.from({ length: 365 }, (_, i) => ({
    fecha: fechaDias(364 - i),
    cantidad: 5,
    motivo: 'Transacción registrada',
  })),
  // Hábitos completados (aproximado)
  ...Array.from({ length: 900 }, (_, i) => ({
    fecha: fechaDias(Math.floor(i / 5) % 180),
    cantidad: 10,
    motivo: 'Hábito completado',
  })),
  // Tareas completadas
  ...Array.from({ length: 30 }, (_, i) => ({
    fecha: fechaDias(i * 12),
    cantidad: 25,
    motivo: 'Tarea Alta completada',
  })),
  ...Array.from({ length: 30 }, (_, i) => ({
    fecha: fechaDias(i * 11),
    cantidad: 15,
    motivo: 'Tarea Media completada',
  })),
  ...Array.from({ length: 15 }, (_, i) => ({
    fecha: fechaDias(i * 20),
    cantidad: 10,
    motivo: 'Tarea Baja completada',
  })),
  // Diario semanal
  ...Array.from({ length: 60 }, (_, i) => ({
    fecha: fechaDias(i * 6),
    cantidad: 3,
    motivo: 'Diario semanal',
  })),
  // Logros especiales
  ...Array.from({ length: 18 }, (_, i) => ({
    fecha: fechaDias(i * 20),
    cantidad: 100,
    motivo: ['Racha 7 días 🔥', 'Racha 30 días 🔥', 'Primer mes positivo 💰', 'Meta de ahorro cumplida 🎯', 'Primer freelance cobrado 💸', 'Racha 90 días ⚡', 'Hábito 100 días 💪', 'Sin deudas nuevas 30 días 🏆', 'Mes con superávit 20%+ 🚀'][i % 9],
  })),
  // Top-up para garantizar rango Élite (20,000 XP)
  ...Array.from({ length: 42 }, (_, i) => ({
    fecha: fechaDias(i * 8),
    cantidad: 100,
    motivo: 'Logro desbloqueado 🏆',
  })),
]

// ─── Logros demo ─────────────────────────────────────────────────────────────

export const logrosDemo: Logro[] = [
  // Racha (91-day streak unlocks up to racha-90)
  { id: 'racha-3',   nombre: '3 días encendido',       descripcion: '', icono: '🔥', desbloqueadoEn: fechaDias(88) },
  { id: 'racha-7',   nombre: 'Semana perfecta',         descripcion: '', icono: '🔥', desbloqueadoEn: fechaDias(84) },
  { id: 'racha-14',  nombre: 'Dos semanas imparable',   descripcion: '', icono: '⚡', desbloqueadoEn: fechaDias(77) },
  { id: 'racha-30',  nombre: 'Mes de fuego',            descripcion: '', icono: '🌋', desbloqueadoEn: fechaDias(61) },
  { id: 'racha-90',  nombre: 'Imparable',               descripcion: '', icono: '💥', desbloqueadoEn: fechaDias(1)  },
  // Finanzas
  { id: 'tx-primera',       nombre: 'Primera transacción',    descripcion: '', icono: '💸', desbloqueadoEn: fechaDias(364) },
  { id: 'tx-10',            nombre: 'Contador activo',         descripcion: '', icono: '📊', desbloqueadoEn: fechaDias(355) },
  { id: 'tx-50',            nombre: 'Maestro del registro',    descripcion: '', icono: '📈', desbloqueadoEn: fechaDias(330) },
  { id: 'mes-positivo',     nombre: 'En verde',                descripcion: '', icono: '🟢', desbloqueadoEn: fechaDias(180) },
  { id: 'ahorro-20',        nombre: 'Ahorrador pro',           descripcion: '', icono: '🏦', desbloqueadoEn: fechaDias(90)  },
  { id: 'presupuesto-activo', nombre: 'Con presupuesto',       descripcion: '', icono: '📋', desbloqueadoEn: fechaDias(120) },
  { id: 'deuda-registrada', nombre: 'Cara a cara con la deuda',descripcion: '', icono: '💳', desbloqueadoEn: fechaDias(200) },
  // Hábitos
  { id: 'habito-primero',        nombre: 'Primer hábito',          descripcion: '', icono: '🌱', desbloqueadoEn: fechaDias(300) },
  { id: 'habito-3-activos',      nombre: 'Sistema en marcha',      descripcion: '', icono: '⚙️', desbloqueadoEn: fechaDias(280) },
  { id: 'habito-5-activos',      nombre: 'Arquitecto de hábitos',  descripcion: '', icono: '🏗️', desbloqueadoEn: fechaDias(250) },
  { id: 'habito-100-registros',  nombre: 'Consistencia',           descripcion: '', icono: '💪', desbloqueadoEn: fechaDias(150) },
  { id: 'habito-500-registros',  nombre: 'Disciplina de hierro',   descripcion: '', icono: '🦾', desbloqueadoEn: fechaDias(30)  },
  // Tareas
  { id: 'tarea-primera', nombre: 'Primera tarea completada', descripcion: '', icono: '✅', desbloqueadoEn: fechaDias(300) },
  { id: 'tarea-10',      nombre: 'Ejecutor',                 descripcion: '', icono: '⚡', desbloqueadoEn: fechaDias(100) },
  { id: 'tarea-alta-3',  nombre: 'Prioridad primero',        descripcion: '', icono: '🔴', desbloqueadoEn: fechaDias(180) },
  // Rango (20,040 XP = Élite)
  { id: 'rango-aprendiz',  nombre: 'Rango Aprendiz',          descripcion: '', icono: '📗', desbloqueadoEn: fechaDias(360) },
  { id: 'rango-bronce',    nombre: '¡Bronce desbloqueado!',   descripcion: '', icono: '🥉', desbloqueadoEn: fechaDias(340) },
  { id: 'rango-plata',     nombre: '¡Plata desbloqueado!',    descripcion: '', icono: '🥈', desbloqueadoEn: fechaDias(300) },
  { id: 'rango-oro',       nombre: '¡Oro desbloqueado!',      descripcion: '', icono: '🥇', desbloqueadoEn: fechaDias(240) },
  { id: 'rango-platino',   nombre: '¡Platino desbloqueado!',  descripcion: '', icono: '💎', desbloqueadoEn: fechaDias(180) },
  { id: 'rango-esmeralda', nombre: '¡Esmeralda desbloqueado!',descripcion: '', icono: '💚', desbloqueadoEn: fechaDias(120) },
  { id: 'rango-zafiro',    nombre: '¡Zafiro desbloqueado!',   descripcion: '', icono: '💙', desbloqueadoEn: fechaDias(60)  },
  { id: 'rango-diamante',  nombre: '¡Diamante desbloqueado!', descripcion: '', icono: '💠', desbloqueadoEn: fechaDias(30)  },
  { id: 'rango-elite',     nombre: '¡ÉLITE! Merch desbloqueado 👑', descripcion: '', icono: '👑', desbloqueadoEn: fechaDias(7) },
  // Especial
  { id: 'diario-primer', nombre: 'Primer diario',          descripcion: '', icono: '✍️', desbloqueadoEn: fechaDias(350) },
  { id: 'diario-10',     nombre: 'Escritor consistente',   descripcion: '', icono: '📓', desbloqueadoEn: fechaDias(200) },
  { id: 'mood-racha',    nombre: 'En sintonía',            descripcion: '', icono: '🎭', desbloqueadoEn: fechaDias(7)   },
]

// ─── Credits demo ─────────────────────────────────────────────────────────────

export const creditosDemo: EstadoCreditos = {
  total: 28_540,
  historial: [
    { fecha: fechaDias(7),  cantidad: 10000, motivo: '🏆 ¡ÉLITE! Merch desbloqueado 👑' },
    { fecha: fechaDias(7),  cantidad: 100,   motivo: '🎭 En sintonía' },
    { fecha: fechaDias(7),  cantidad: 10,    motivo: 'Check-in diario' },
    { fecha: fechaDias(8),  cantidad: 10,    motivo: 'Check-in diario' },
    { fecha: fechaDias(9),  cantidad: 10,    motivo: 'Check-in diario' },
    { fecha: fechaDias(10), cantidad: 3,     motivo: 'Transacción registrada' },
    { fecha: fechaDias(10), cantidad: 2,     motivo: 'Hábito completado' },
    { fecha: fechaDias(10), cantidad: 2,     motivo: 'Hábito completado' },
    { fecha: fechaDias(11), cantidad: 10,    motivo: 'Check-in diario' },
    { fecha: fechaDias(11), cantidad: 2,     motivo: 'Hábito completado' },
    { fecha: fechaDias(12), cantidad: 3,     motivo: 'Transacción registrada' },
    { fecha: fechaDias(13), cantidad: 10,    motivo: 'Check-in diario' },
    { fecha: fechaDias(14), cantidad: 5,     motivo: 'Diario semanal' },
    { fecha: fechaDias(15), cantidad: 20,    motivo: 'Tarea completada: Revisar strategy Fidel' },
    { fecha: fechaDias(20), cantidad: 150,   motivo: '🏆 Tareas Alta × 3 completadas' },
    { fecha: fechaDias(25), cantidad: 3,     motivo: 'Transacción registrada' },
    { fecha: fechaDias(28), cantidad: 2,     motivo: 'Hábito completado' },
    { fecha: fechaDias(30), cantidad: 5000,  motivo: '🏆 ¡Diamante desbloqueado!' },
    { fecha: fechaDias(30), cantidad: 750,   motivo: '🦾 Disciplina de hierro' },
    { fecha: fechaDias(60), cantidad: 3000,  motivo: '🏆 ¡Zafiro desbloqueado!' },
  ],
}

// ─── Fixed costs demo ─────────────────────────────────────────────────────────

export const costosFijosDemo: CostoFijo[] = [
  { id: 'cf-1', nombre: 'Alquiler',        categoria: 'Vivienda',      monto: 220_000, frecuencia: 'mensual', activo: true,  creadoEn: fechaDias(180) },
  { id: 'cf-2', nombre: 'Claude Pro',      categoria: 'Software',      monto: 20_000,  frecuencia: 'mensual', activo: true,  creadoEn: fechaDias(120), nota: 'Herramienta de trabajo' },
  { id: 'cf-3', nombre: 'Notion Plus',     categoria: 'Software',      monto: 9_500,   frecuencia: 'mensual', activo: true,  creadoEn: fechaDias(90) },
  { id: 'cf-4', nombre: 'Spotify',         categoria: 'Suscripciones', monto: 5_800,   frecuencia: 'mensual', activo: true,  creadoEn: fechaDias(300) },
  { id: 'cf-5', nombre: 'Netflix',         categoria: 'Suscripciones', monto: 7_900,   frecuencia: 'mensual', activo: false, creadoEn: fechaDias(400), nota: 'Pausado — no lo usaba' },
  { id: 'cf-6', nombre: 'Internet fibra',  categoria: 'Servicios',     monto: 28_000,  frecuencia: 'mensual', activo: true,  creadoEn: fechaDias(365) },
  { id: 'cf-7', nombre: 'Dominio .com',    categoria: 'Software',      monto: 18_000,  frecuencia: 'anual',   activo: true,  creadoEn: fechaDias(200) },
]

// ─── Investments demo ─────────────────────────────────────────────────────────

export const inversionesDemo: Inversion[] = [
  { id: 'inv-1', nombre: 'Bitcoin',            tipo: 'Cripto',      montoInvertido: 350_000, valorActual: 512_000, fecha: fechaDias(240), nota: 'DCA semanal' },
  { id: 'inv-2', nombre: 'CEDEAR AAPL',        tipo: 'CEDEARs',     montoInvertido: 180_000, valorActual: 214_000, fecha: fechaDias(150) },
  { id: 'inv-3', nombre: 'Plazo fijo Galicia', tipo: 'Plazo fijo',  montoInvertido: 200_000, valorActual: 231_000, fecha: fechaDias(60) },
  { id: 'inv-4', nombre: 'USDT',               tipo: 'Dólar',       montoInvertido: 150_000, valorActual: 168_000, fecha: fechaDias(90), nota: 'Reserva de emergencia' },
  { id: 'inv-5', nombre: 'ETH',                tipo: 'Cripto',      montoInvertido: 120_000, valorActual: 104_000, fecha: fechaDias(45) },
]

// ─── Savings funds demo ───────────────────────────────────────────────────────

export const fondosDemo: FondoAhorro[] = [
  { id: 'fon-1', nombre: 'Fondo de emergencia', tipo: 'Emergencia', objetivo: 1_800_000, acumulado: 1_150_000, creadoEn: fechaDias(200) },
  { id: 'fon-2', nombre: 'Viaje a Brasil',      tipo: 'Meta',       objetivo: 600_000,   acumulado: 420_000,   creadoEn: fechaDias(90) },
  { id: 'fon-3', nombre: 'Ahorro general',      tipo: 'Ahorro',     objetivo: 2_000_000, acumulado: 680_000,   creadoEn: fechaDias(150) },
]

// ─── Financial assets demo ────────────────────────────────────────────────────

export const activosDemo: ActivoFinanciero[] = [
  { id: 'act-1', nombre: 'Depto Nueva Córdoba', tipo: 'Propiedad en renta', valor: 48_000_000, ingresoMensual: 380_000, creadoEn: fechaDias(400), nota: 'Alquilado hasta dic' },
  { id: 'act-2', nombre: 'Setup de grabación',  tipo: 'Equipamiento',       valor: 2_400_000,  ingresoMensual: 0,       creadoEn: fechaDias(120) },
]

// ─── Business spaces demo ─────────────────────────────────────────────────────

export const negociosDemo: Negocio[] = [
  { id: 'neg-1', nombre: 'Agencia IA',   emoji: '🤖', creadoEn: fechaDias(180) },
  { id: 'neg-2', nombre: 'Setter Fidel', emoji: '💬', creadoEn: fechaDias(120) },
]

export const transaccionesNegocioDemo: TransaccionNegocio[] = [
  { id: 'txn-1',  negocioId: 'neg-1', fecha: fechaDias(3),  tipo: 'ingreso', categoria: 'Servicios',    monto: 850_000, nota: 'Cliente automatización' },
  { id: 'txn-2',  negocioId: 'neg-1', fecha: fechaDias(6),  tipo: 'gasto',   categoria: 'Herramientas', monto: 45_000,  nota: 'APIs y hosting' },
  { id: 'txn-3',  negocioId: 'neg-1', fecha: fechaDias(12), tipo: 'ingreso', categoria: 'Servicios',    monto: 620_000, nota: 'Retainer mensual' },
  { id: 'txn-4',  negocioId: 'neg-1', fecha: fechaDias(18), tipo: 'gasto',   categoria: 'Marketing',    monto: 120_000, nota: 'Ads' },
  { id: 'txn-5',  negocioId: 'neg-1', fecha: fechaDias(35), tipo: 'ingreso', categoria: 'Servicios',    monto: 780_000 },
  { id: 'txn-6',  negocioId: 'neg-1', fecha: fechaDias(48), tipo: 'gasto',   categoria: 'Herramientas', monto: 52_000 },
  { id: 'txn-7',  negocioId: 'neg-2', fecha: fechaDias(2),  tipo: 'ingreso', categoria: 'Ventas',       monto: 450_000, nota: 'Comisión cierre' },
  { id: 'txn-8',  negocioId: 'neg-2', fecha: fechaDias(9),  tipo: 'ingreso', categoria: 'Ventas',       monto: 380_000, nota: 'Comisión cierre' },
  { id: 'txn-9',  negocioId: 'neg-2', fecha: fechaDias(15), tipo: 'gasto',   categoria: 'Herramientas', monto: 28_000,  nota: 'ManyChat' },
  { id: 'txn-10', negocioId: 'neg-2', fecha: fechaDias(40), tipo: 'ingreso', categoria: 'Ventas',       monto: 510_000 },
]
