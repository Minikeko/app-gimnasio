import { DIAS_CORTOS } from '../../lib/fechas'

export const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0]

interface Props {
  dias: number[]
  onChange?: (dias: number[]) => void
  color?: string
}

/** Fila L M X J V S D. Si recibe onChange, es editable. */
export function DiasSemana({ dias, onChange, color = '#6366f1' }: Props) {
  const editable = !!onChange
  return (
    <div className={`flex ${editable ? 'gap-2' : 'gap-1'}`}>
      {ORDEN_SEMANA.map((d) => {
        const activo = dias.includes(d)
        const clase = editable
          ? 'w-10 h-10 rounded-full text-sm font-bold'
          : 'w-6 h-6 rounded-full text-[11px] font-bold'
        const estilo = activo ? { backgroundColor: color, color: '#fff' } : undefined
        const contenido = DIAS_CORTOS[d]
        return editable ? (
          <button
            key={d}
            type="button"
            aria-pressed={activo}
            onClick={() => onChange(activo ? dias.filter((x) => x !== d) : [...dias, d])}
            className={`${clase} ${activo ? '' : 'bg-gray-700 text-gray-400'}`}
            style={estilo}
          >
            {contenido}
          </button>
        ) : (
          <span
            key={d}
            className={`${clase} flex items-center justify-center ${activo ? '' : 'bg-gray-700/60 text-gray-500'}`}
            style={estilo}
          >
            {contenido}
          </span>
        )
      })}
    </div>
  )
}
