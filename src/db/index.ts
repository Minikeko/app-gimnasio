import Dexie, { type Table } from 'dexie'
import type {
  Ejercicio, Rutina, Sesion, Record, PesoCorporal, Pasos, Ajustes
} from '../types'

export class GymDB extends Dexie {
  ejercicios!: Table<Ejercicio, string>
  rutinas!: Table<Rutina, string>
  sesiones!: Table<Sesion, string>
  records!: Table<Record, string>
  pesoCorporal!: Table<PesoCorporal, string>
  pasos!: Table<Pasos, string>
  ajustes!: Table<Ajustes, number>

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
  }
}

export const db = new GymDB()

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
      db.ejercicios.filter((e) => e.esPersonalizado).toArray(),
      db.rutinas.toArray(),
      db.sesiones.toArray(),
      db.records.toArray(),
      db.pesoCorporal.toArray(),
      db.pasos.toArray(),
      db.ajustes.toArray(),
    ])

  const backup = {
    version: 1,
    exportadoEn: new Date().toISOString(),
    datos: { ejercicios, rutinas, sesiones, records, pesoCorporal, pasos, ajustes },
  }
  return JSON.stringify(backup, null, 2)
}

export async function importarBackup(json: string): Promise<void> {
  const backup = JSON.parse(json)
  if (!backup.datos) throw new Error('Formato de backup inválido')
  const { ejercicios, rutinas, sesiones, records, pesoCorporal, pasos, ajustes } = backup.datos

  await db.transaction('rw', [
    db.ejercicios, db.rutinas, db.sesiones, db.records,
    db.pesoCorporal, db.pasos, db.ajustes
  ], async () => {
    if (ejercicios?.length) await db.ejercicios.bulkPut(ejercicios)
    if (rutinas?.length) await db.rutinas.bulkPut(rutinas)
    if (sesiones?.length) await db.sesiones.bulkPut(sesiones)
    if (records?.length) await db.records.bulkPut(records)
    if (pesoCorporal?.length) await db.pesoCorporal.bulkPut(pesoCorporal)
    if (pasos?.length) await db.pasos.bulkPut(pasos)
    if (ajustes?.length) await db.ajustes.bulkPut(ajustes)
  })
}
