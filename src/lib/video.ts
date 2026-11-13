import type { VideoPlataforma } from '../types'

export interface VideoInfo {
  plataforma: VideoPlataforma
  /** URL para incrustar en un iframe; null si la plataforma no lo permite */
  embed: string | null
  /** ID de YouTube, para comprobar si el vídeo sigue existiendo */
  youtubeId?: string
  url: string
}

export function analizarVideo(url: string): VideoInfo {
  const u = url.trim()
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/)
  if (m) {
    return {
      plataforma: 'youtube',
      youtubeId: m[1],
      embed: `https://www.youtube-nocookie.com/embed/${m[1]}?playsinline=1&rel=0&loop=1&playlist=${m[1]}`,
      url: u,
    }
  }
  m = u.match(/tiktok\.com\/.*\/video\/(\d+)/)
  if (m) return { plataforma: 'tiktok', embed: `https://www.tiktok.com/embed/v2/${m[1]}`, url: u }
  if (/tiktok\.com/.test(u)) return { plataforma: 'tiktok', embed: null, url: u }
  m = u.match(/instagram\.com\/(?:[\w.]+\/)?(?:reel|reels|p|tv)\/([\w-]+)/)
  if (m) return { plataforma: 'instagram', embed: `https://www.instagram.com/reel/${m[1]}/embed`, url: u }
  return { plataforma: 'otro', embed: null, url: u }
}

export function esUrlValida(url: string): boolean {
  try {
    const p = new URL(url.trim())
    return p.protocol === 'https:' || p.protocol === 'http:'
  } catch {
    return false
  }
}

export function busquedaYoutube(nombre: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${nombre} técnica correcta shorts`)}`
}

/**
 * YouTube devuelve una miniatura genérica de 120x90 cuando el vídeo no existe.
 * Devuelve false si el vídeo se ha borrado, true si existe y null si no se puede comprobar (sin conexión).
 */
export function comprobarYoutube(id: string): Promise<boolean | null> {
  if (!navigator.onLine) return Promise.resolve(null)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img.naturalWidth > 120)
    img.onerror = () => resolve(null)
    img.src = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
  })
}

export const NOMBRE_PLATAFORMA: Record<VideoPlataforma, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  otro: 'enlace',
}
