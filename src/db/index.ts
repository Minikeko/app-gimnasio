import Dexie, { type Table } from 'dexie'
import type {
  Ejercicio, Rutina, Sesion, RecordPersonal, PesoCorporal, Pasos, Ajustes
} from '../types'

export interface ImagenGuardada {
  url: string
  blob: Blob
}

export interface Meta {
  clave: string
  valor: unknown
}

export class GymDB extends Dexie {
  ejercicios!: Table<Ejercicio, string>
  rutinas!: Table<Rutina, string>
  sesiones!: Table<Sesion, string>
  records!: Table<RecordPersonal, string>
  pesoCorporal!: Table<PesoCorporal, string>
  pasos!: Table<Pasos, string>
  ajustes!: Table<Ajustes, number>
  imagenes!: Table<ImagenGuardada, string>
  meta!: Table<Meta, string>

  constructor() {
    super('GymTrackerDB')
    this.version(1).stores({
      ejercicios: 'id, musculoPrincipal, fuente',
      rutinas: 'id, creadaEn',
      sesiones: 'id, rutinaId, fecha, completada',
      records: 'ejercicioId, fecha',
      pesoCorporal: 'id, fecha',
      pasos: 'fecha',
      ajustes: 'id',
    })
    this.version(2).stores({
      ejercicios: 'id, musculoPrincipal, equipamiento',
      imagenes: 'url',
      meta: 'clave',
    })
  }
}

export const db = new GymDB()

/** Cambiar al regenerar src/data/ejercicios.json para que se recarguen */
const VERSION_EJERCICIOS = 1

export async function cargarEjercicios() {
  const meta = await db.meta.get('versionEjercicios')
  if (meta?.valor === VERSION_EJERCICIOS) return
  const { default: base } = await import('../data/ejercicios.json')
  await db.transaction('rw', db.ejercicios, db.meta, async () => {
    const existentes = new Map((await db.ejercicios.toArray()).map((e) => [e.id, e]))
    await db.ejercicios.bulkPut(
      (base as Omit<Ejercicio, 'esPersonalizado'>[]).map((e) => {
        const previo = existentes.get(e.id)
        return { ...e, esPersonalizado: false, videoUrl: previo?.videoUrl, foto: previo?.foto }
      })
    )
    await db.meta.put({ clave: 'versionEjercicios', valor: VERSION_EJERCICIOS })
  })
}

export async function initAjustes() {
  const existing = await db.ajustes.get(1)
  if (!existing) {
    await db.ajustes.put({
      id: 1,
      unidades: 'kg',
      objetivoPasos: 8000,
      notifRutinaDiaria: false,
      notifHora: '08:00',
      notifDescansoMuscular: true,
      notifDiasSinEntrenar: 3,
      temaOscuro: true,
      almacenamientoPersistenteSolicitado: false,
      primeraVez: true,
    })
  }
}

export async function exportarBackup(): Promise<string> {
  const [ejercicios, rutinas, sesiones, records, pesoCorporal, pasos, ajustes] =
    await Promise.all([
      db.ejercicios.filter((e) => e.esPersonalizado || !!e.videoUrl || !!e.foto).toArray(),
      db.rutinas.toArray(),
      db.sesiones.toArray(),
      db.records.toArray(),
      db.pesoCorporal.toArray(),
      db.pasos.toArray(),
      db.ajustes.toArray(),
    ])

  const backup = {
    app: 'GymTracker',
    version: 1,
    exportadoEn: new Date().toISOString(),
    datos: { ejercicios, rutinas, sesiones, records, pesoCorporal, pasos, ajustes },
  }
  return JSON.stringify(backup)
}

const CAMPOS_FECHA: Record<string, string[]> = {
  rutinas: ['creadaEn', 'actualizadaEn'],
  sesiones: ['fecha'],
  records: ['fecha'],
  pesoCorporal: ['fecha'],
}

function revivirFechas<T>(tabla: string, filas: T[]): T[] {
  const campos = CAMPOS_FECHA[tabla]
  if (!campos) return filas
  return filas.map((f) => {
    const copia = { ...f } as { [k: string]: unknown }
    for (const c of campos) if (typeof copia[c] === 'string') copia[c] = new Date(copia[c] as string)
    if (tabla === 'sesiones' && Array.isArray(copia.series)) {
      copia.series = (copia.series as { timestamp: string }[]).map((s) => ({ ...s, timestamp: new Date(s.timestamp) }))
    }
    return copia as T
  })
}

export async function importarBackup(json: string): Promise<void> {
  const backup = JSON.parse(json)
  if (!backup?.datos) throw new Error('El archivo no es una copia de GymTracker')
  const d = backup.datos

  await db.transaction('rw', [
    db.ejercicios, db.rutinas, db.sesiones, db.records,
    db.pesoCorporal, db.pasos, db.ajustes
  ], async () => {
    if (d.ejercicios?.length) {
      for (const e of d.ejercicios as Ejercicio[]) {
        const actual = await db.ejercicios.get(e.id)
        await db.ejercicios.put(actual && !e.esPersonalizado ? { ...actual, videoUrl: e.videoUrl, foto: e.foto } : e)
      }
    }
    if (d.rutinas?.length) await db.rutinas.bulkPut(revivirFechas('rutinas', d.rutinas))
    if (d.sesiones?.length) await db.sesiones.bulkPut(revivirFechas('sesiones', d.sesiones))
    if (d.records?.length) await db.records.bulkPut(revivirFechas('records', d.records))
    if (d.pesoCorporal?.length) await db.pesoCorporal.bulkPut(revivirFechas('pesoCorporal', d.pesoCorporal))
    if (d.pasos?.length) await db.pasos.bulkPut(d.pasos)
    if (d.ajustes?.length) await db.ajustes.bulkPut(d.ajustes)
  })
}
