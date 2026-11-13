export type MuscleGroup =
  | 'pecho' | 'espalda' | 'hombros' | 'biceps' | 'triceps'
  | 'antebrazos' | 'abdomen' | 'oblicuos' | 'lumbar'
  | 'gluteos' | 'cuadriceps' | 'isquiotibiales' | 'gemelos' | 'aductores' | 'trapecio'

export type Equipment =
  | 'maquina' | 'mancuerna' | 'barra' | 'polea' | 'pesoCorporal'
  | 'kettlebell' | 'bandas' | 'multipower' | 'trx' | 'banco' | 'otro'

export type VideoPlataforma = 'youtube' | 'tiktok' | 'instagram' | 'custom'

export interface Ejercicio {
  id: string
  nombre: string
  nombreOriginal?: string
  musculoPrincipal: MuscleGroup
  musculosSecundarios: MuscleGroup[]
  equipamiento: Equipment[]
  instrucciones: string
  erroresComunes: string
  imagenInicioUrl: string
  imagenFinUrl: string
  imagenInicioB64?: string
  imagenFinB64?: string
  videoUrl: string
  videoUrlPersonalizado?: string
  videoPlataforma: VideoPlataforma
  esPersonalizado: boolean
  fuente: 'wger' | 'free-exercise-db' | 'custom'
  wgerId?: number
  creadoEn: Date
}

export interface EjercicioRutina {
  ejercicioId: string
  orden: number
  series: number
  repeticiones: string
  pesoObjetivoKg: number
  descansoSegundos: number
  notas: string
}

export interface Rutina {
  id: string
  nombre: string
  diasSemana: number[]
  ejercicios: EjercicioRutina[]
  color: string
  creadaEn: Date
  actualizadaEn: Date
}

export interface SerieRealizada {
  ejercicioId: string
  numeroSerie: number
  pesoKg: number
  repeticiones: number
  completada: boolean
  timestamp: Date
}

export interface Sesion {
  id: string
  rutinaId: string
  rutinaNombre: string
  fecha: Date
  duracionMinutos: number
  series: SerieRealizada[]
  notas: string
  completada: boolean
}

export interface Record {
  ejercicioId: string
  fecha: Date
  pesoMaximoKg: number
  repsEnMaximo: number
  estimado1RM: number
}

export interface PesoCorporal {
  id: string
  fecha: Date
  pesoKg: number
  notas: string
}

export interface Pasos {
  fecha: string
  pasos: number
  fuente: 'healthconnect' | 'manual'
}

export interface Ajustes {
  id: 1
  unidades: 'kg' | 'lb'
  objetivoPasos: number
  notifRutinaDiaria: boolean
  notifHora: string
  notifDescansoMuscular: boolean
  notifDiasSinEntrenar: number
  temaOscuro: boolean
  almacenamientoPersistenteSolicitado: boolean
  primeraVez: boolean
}

export interface SesionActiva {
  rutinaId: string
  rutinaNombre: string
  iniciada: Date
  seriesCompletadas: SerieRealizada[]
  ejercicioActualIndex: number
}
