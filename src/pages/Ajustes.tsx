import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Download, Upload, ShieldCheck, ShieldAlert } from 'lucide-react'
import { db, exportarBackup, importarBackup } from '../db'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { estaPersistido, pedirAlmacenamientoPersistente } from '../lib/almacenamiento'
import { claveDia } from '../lib/fechas'
import { ImagenesSinConexion } from '../components/ajustes/ImagenesSinConexion'

export function Ajustes() {
  const ajustes = useLiveQuery(() => db.ajustes.get(1))
  const [persistido, setPersistido] = useState<boolean | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    estaPersistido().then(setPersistido)
  }, [])

  async function exportar() {
    const json = await exportarBackup()
    const nombre = `gymtracker-backup-${claveDia()}.json`
    const file = new File([json], nombre, { type: 'application/json' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Copia de seguridad GymTracker' })
        return
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }
    }
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = nombre
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!confirm('Se combinarán los datos del archivo con los actuales. ¿Continuar?')) return
    try {
      await importarBackup(await file.text())
      setMensaje('Copia importada correctamente ✔')
    } catch (err) {
      setMensaje(`Error al importar: ${(err as Error).message}`)
    }
  }

  async function persistir() {
    setPersistido(await pedirAlmacenamientoPersistente())
  }

  if (!ajustes) return null

  return (
    <>
      <PageHeader title="Ajustes" />
      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <Card>
          <h2 className="font-semibold mb-3">Unidades de peso</h2>
          <div className="grid grid-cols-2 gap-2">
            {(['kg', 'lb'] as const).map((u) => (
              <button
                key={u}
                onClick={() => db.ajustes.update(1, { unidades: u })}
                className={`py-3 rounded-xl font-semibold ${
                  ajustes.unidades === u ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold mb-1">Copia de seguridad</h2>
          <p className="text-sm text-gray-400 mb-3">
            Exporta un archivo JSON con todos tus datos. En iPhone podrás guardarlo en Archivos o iCloud.
            Sirve también para pasar los datos a otro móvil.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={exportar} className="flex items-center justify-center gap-2">
              <Download size={18} /> Exportar
            </Button>
            <Button variant="secondary" onClick={() => inputRef.current?.click()} className="flex items-center justify-center gap-2">
              <Upload size={18} /> Importar
            </Button>
          </div>
          <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={importar} />
          {mensaje && <p className="text-sm mt-3 text-gray-300">{mensaje}</p>}
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            {persistido ? (
              <ShieldCheck className="text-emerald-400 shrink-0" size={24} />
            ) : (
              <ShieldAlert className="text-amber-400 shrink-0" size={24} />
            )}
            <div className="flex-1">
              <h2 className="font-semibold">Almacenamiento permanente</h2>
              <p className="text-sm text-gray-400 mt-1">
                {persistido
                  ? 'Activado: el navegador no borrará tus datos.'
                  : 'Pide al navegador que no borre tus datos. En iPhone funciona mejor tras añadir la app a la pantalla de inicio.'}
              </p>
              {!persistido && (
                <Button size="sm" variant="secondary" className="mt-3" onClick={persistir}>
                  Activar
                </Button>
              )}
            </div>
          </div>
        </Card>

        <ImagenesSinConexion />

        <p className="text-center text-xs text-gray-600 pt-2">
          GymTracker v{__APP_VERSION__} · Ejercicios e imágenes de free-exercise-db
        </p>
      </main>
    </>
  )
}
