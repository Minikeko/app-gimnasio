import type { Ejercicio, Equipment, MuscleGroup } from '../types'

export function normalizar(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export interface Filtros {
  q?: string
  musculo?: MuscleGroup | null
  equipo?: Equipment | null
  soloMios?: boolean
}

export function filtrarEjercicios(todos: Ejercicio[], { q = '', musculo, equipo, soloMios }: Filtros): Ejercicio[] {
  const palabras = normalizar(q).split(/\s+/).filter(Boolean)
  return todos
    .filter((e) => {
      if (musculo && e.musculoPrincipal !== musculo && !e.musculosSecundarios.includes(musculo)) return false
      if (equipo && e.equipamiento !== equipo) return false
      if (soloMios && !e.esPersonalizado) return false
      if (!palabras.length) return true
      const es = normalizar(e.nombre)
      const en = normalizar(e.nombreOriginal ?? '')
      return palabras.every((p) => es.includes(p)) || palabras.every((p) => en.includes(p))
    })
    .sort((a, b) => {
      if (musculo && (a.musculoPrincipal === musculo) !== (b.musculoPrincipal === musculo)) {
        return a.musculoPrincipal === musculo ? -1 : 1
      }
      if (a.esPersonalizado !== b.esPersonalizado) return a.esPersonalizado ? -1 : 1
      if (a.idioma !== b.idioma) return a.idioma === 'es' ? -1 : 1
      return a.nombre.localeCompare(b.nombre, 'es')
    })
}
