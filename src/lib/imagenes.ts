import { useEffect, useState } from 'react'
import { db } from '../db'

export const BASE_IMAGENES = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

export function urlImagen(ruta: string): string {
  return /^(https?:|data:)/.test(ruta) ? ruta : BASE_IMAGENES + ruta
}

async function descargar(url: string): Promise<Blob> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const blob = await res.blob()
  await db.imagenes.put({ url, blob })
  return blob
}

/** Devuelve una URL mostrable: la copia guardada si existe; si no, la descarga y la guarda. */
export function useImagen(ruta: string | undefined): string | undefined {
  const [src, setSrc] = useState<string>()

  useEffect(() => {
    if (!ruta) return
    const url = urlImagen(ruta)
    if (url.startsWith('data:')) {
      setSrc(url)
      return
    }
    let objeto: string | undefined
    let cancelado = false
    ;(async () => {
      const guardada = await db.imagenes.get(url)
      let blob = guardada?.blob
      if (!blob) {
        try {
          blob = await descargar(url)
        } catch {
          if (!cancelado) setSrc(undefined)
          return
        }
      }
      if (cancelado) return
      objeto = URL.createObjectURL(blob)
      setSrc(objeto)
    })()
    return () => {
      cancelado = true
      if (objeto) URL.revokeObjectURL(objeto)
    }
  }, [ruta])

  return src
}

export async function contarImagenesGuardadas(): Promise<number> {
  return db.imagenes.count()
}

/** Descarga todas las imágenes de la biblioteca que aún no estén guardadas. */
export async function descargarTodas(
  onProgreso: (hechas: number, total: number) => void,
  senal?: AbortSignal
): Promise<{ ok: number; fallidas: number }> {
  const rutas = (await db.ejercicios.toArray()).flatMap((e) => e.imagenes).map(urlImagen)
  const guardadas = new Set(await db.imagenes.toCollection().primaryKeys())
  const pendientes = rutas.filter((u) => !guardadas.has(u))
  let hechas = 0
  let fallidas = 0
  const total = pendientes.length
  onProgreso(0, total)

  const cola = [...pendientes]
  async function trabajador() {
    while (cola.length && !senal?.aborted) {
      const url = cola.shift()!
      try {
        await descargar(url)
      } catch {
        fallidas++
      }
      onProgreso(++hechas, total)
    }
  }
  await Promise.all(Array.from({ length: 6 }, trabajador))
  return { ok: hechas - fallidas, fallidas }
}

/** Reduce una foto a 800 px de lado como máximo y la devuelve en JPEG (data URL). */
export async function comprimirFoto(file: File, max = 800): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const escala = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.8)
}
