export type MuscleGroup =
  | 'pecho' | 'dorsales' | 'espalda' | 'hombros' | 'biceps' | 'triceps'
  | 'antebrazos' | 'abdomen' | 'lumbar' | 'trapecio'
  | 'gluteos' | 'cuadriceps' | 'isquiotibiales' | 'gemelos' | 'aductores' | 'abductores'

export type Equipment =
  | 'maquina' | 'mancuerna' | 'barra' | 'polea' | 'pesoCorporal'
  | 'kettlebell' | 'bandas' | 'multipower' | 'trx' | 'otro'

export type VideoPlataforma = 'youtube' | 'tiktok' | 'instagram' | 'otro'

export interface Ejercicio {
  id: string
  nombre: string
  nombreOriginal?: string
  musculoPrincipal: MuscleGroup
  musculosSecundarios: MuscleGroup[]
  equipamiento: Equipment
  nivel?: string
  instrucciones: string[]
  erroresComunes: string[]
  idioma: 'es' | 'en'
  /** Rutas relativas a la base de imágenes de free-exercise-db */
  imagenes: string[]
  /** Foto propia en data URL (JPEG comprimido) */
  foto?: string
  videoUrl?: string
  esPersonalizado: boolean
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

export interface RecordPersonal {
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
