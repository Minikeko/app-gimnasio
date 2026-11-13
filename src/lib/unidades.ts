import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export type Unidad = 'kg' | 'lb'

const LB_POR_KG = 2.20462

export function useUnidad(): Unidad {
  return useLiveQuery(() => db.ajustes.get(1))?.unidades ?? 'kg'
}

/** Convierte kg guardados a la unidad elegida, redondeando a 0,5 */
export function mostrarPeso(kg: number, u: Unidad): number {
  const v = u === 'lb' ? kg * LB_POR_KG : kg
  return Math.round(v * 2) / 2
}

export function aKg(valor: number, u: Unidad): number {
  return u === 'lb' ? valor / LB_POR_KG : valor
}

export function formatoDescanso(seg: number): string {
  const m = Math.floor(seg / 60)
  const s = seg % 60
  if (!m) return `${s} s`
  return s ? `${m}:${String(s).padStart(2, '0')} min` : `${m} min`
}

/** Formato m:ss para espacios estrechos */
export function formatoDescansoCorto(seg: number): string {
  return `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`
}

export const DESCANSOS = [30, 45, 60, 75, 90, 120, 150, 180, 240, 300]
