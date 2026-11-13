import type { Equipment, MuscleGroup } from '../types'

export const MUSCULOS: Record<MuscleGroup, string> = {
  pecho: 'Pecho',
  dorsales: 'Dorsales',
  espalda: 'Espalda media',
  lumbar: 'Lumbar',
  trapecio: 'Trapecio',
  hombros: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  antebrazos: 'Antebrazos',
  abdomen: 'Abdomen',
  gluteos: 'Glúteos',
  cuadriceps: 'Cuádriceps',
  isquiotibiales: 'Isquiotibiales',
  gemelos: 'Gemelos',
  aductores: 'Aductores',
  abductores: 'Abductores',
}

export const EQUIPOS: Record<Equipment, string> = {
  maquina: 'Máquina',
  mancuerna: 'Mancuerna',
  barra: 'Barra',
  polea: 'Polea',
  pesoCorporal: 'Peso corporal',
  kettlebell: 'Kettlebell',
  bandas: 'Bandas',
  multipower: 'Multipower / Smith',
  trx: 'TRX',
  otro: 'Otro',
}

export const LISTA_MUSCULOS = Object.keys(MUSCULOS) as MuscleGroup[]
export const LISTA_EQUIPOS = Object.keys(EQUIPOS) as Equipment[]
