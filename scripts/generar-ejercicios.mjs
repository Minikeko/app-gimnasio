// Genera src/data/ejercicios.json a partir de free-exercise-db (licencia Unlicense)
// Uso: node scripts/generar-ejercicios.mjs [ruta-local-exercises.json]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const FUENTE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
export const BASE_IMAGENES = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

const origen = process.argv[2]
  ? JSON.parse(readFileSync(process.argv[2], 'utf8'))
  : await (await fetch(FUENTE)).json()

const nombres = JSON.parse(readFileSync(join(raiz, 'scripts/nombres-es.json'), 'utf8'))
const contenido = JSON.parse(readFileSync(join(raiz, 'scripts/contenido-es.json'), 'utf8'))

const MUSCULOS = {
  abdominals: 'abdomen', abductors: 'abductores', adductors: 'aductores', biceps: 'biceps',
  calves: 'gemelos', chest: 'pecho', forearms: 'antebrazos', glutes: 'gluteos',
  hamstrings: 'isquiotibiales', lats: 'dorsales', 'lower back': 'lumbar', 'middle back': 'espalda',
  neck: 'trapecio', quadriceps: 'cuadriceps', shoulders: 'hombros', traps: 'trapecio', triceps: 'triceps',
}

const EQUIPOS = {
  barbell: 'barra', 'e-z curl bar': 'barra', dumbbell: 'mancuerna', cable: 'polea', machine: 'maquina',
  'body only': 'pesoCorporal', kettlebells: 'kettlebell', bands: 'bandas',
}

function equipamiento(x) {
  if (/smith/i.test(x.name)) return 'multipower'
  if (/suspended|straps/i.test(x.name)) return 'trx'
  return EQUIPOS[x.equipment] ?? 'otro'
}

const faltan = []
const salida = origen
  .filter((x) => ['strength', 'powerlifting'].includes(x.category) && x.equipment !== 'foam roll' && x.images.length === 2)
  .map((x) => {
    const nombre = nombres[x.name]
    if (!nombre) faltan.push(x.name)
    const es = contenido[x.name]
    const musculoPrincipal = MUSCULOS[x.primaryMuscles[0]]
    const secundarios = [...new Set([...x.primaryMuscles.slice(1), ...x.secondaryMuscles].map((m) => MUSCULOS[m]))]
      .filter((m) => m && m !== musculoPrincipal)
    return {
      id: `fedb-${x.id}`,
      nombre: nombre ?? x.name,
      nombreOriginal: x.name,
      musculoPrincipal,
      musculosSecundarios: secundarios,
      equipamiento: equipamiento(x),
      nivel: x.level,
      instrucciones: es ? es.pasos : x.instructions,
      erroresComunes: es ? es.errores : [],
      idioma: es ? 'es' : 'en',
      imagenes: x.images,
    }
  })
  .sort((a, b) => (a.idioma === b.idioma ? a.nombre.localeCompare(b.nombre, 'es') : a.idioma === 'es' ? -1 : 1))

const sinUsar = Object.keys(contenido).filter((k) => !salida.some((e) => e.nombreOriginal === k))
if (faltan.length) console.warn('Sin traducción de nombre:', faltan)
if (sinUsar.length) console.warn('Contenido en español sin ejercicio:', sinUsar)

mkdirSync(join(raiz, 'src/data'), { recursive: true })
writeFileSync(join(raiz, 'src/data/ejercicios.json'), JSON.stringify(salida))
console.log(`${salida.length} ejercicios (${salida.filter((e) => e.idioma === 'es').length} con instrucciones en español)`)
