import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Minus, Plus, X } from 'lucide-react'
import type { Ejercicio, EjercicioRutina } from '../../types'
import { Miniatura } from '../ejercicio/Ilustracion'
import { aKg, DESCANSOS, formatoDescansoCorto, mostrarPeso, type Unidad } from '../../lib/unidades'

export type ItemRutina = EjercicioRutina & { uid: string }

interface Props {
  item: ItemRutina
  ejercicio?: Ejercicio
  unidad: Unidad
  onChange: (cambios: Partial<EjercicioRutina>) => void
  onQuitar: () => void
}

const caja = 'w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-center text-sm focus:outline-none focus:border-indigo-500'

export function FilaEjercicio({ item, ejercicio, unidad, onChange, onQuitar }: Props) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.uid })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`bg-gray-800 border rounded-2xl p-3 ${isDragging ? 'border-indigo-500 shadow-2xl relative z-10 opacity-90' : 'border-gray-700'}`}
    >
      <div className="flex items-center gap-2 select-none">
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label="Arrastrar para reordenar"
          className="p-2 -ml-2 text-gray-500 touch-none cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={22} />
        </button>
        {ejercicio && <Miniatura ejercicio={ejercicio} />}
        <p className="flex-1 min-w-0 font-semibold leading-tight line-clamp-2">
          {ejercicio?.nombre ?? 'Ejercicio borrado'}
        </p>
        <button onClick={onQuitar} aria-label="Quitar de la rutina" className="p-2 -mr-1 text-gray-500 hover:text-red-400">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-3">
        <label className="text-[11px] text-gray-400 text-center">
          Series
          <div className="flex items-center mt-1 bg-gray-900 border border-gray-700 rounded-lg">
            <button type="button" aria-label="Menos series" className="px-1.5 py-2 text-gray-400" onClick={() => onChange({ series: Math.max(1, item.series - 1) })}>
              <Minus size={14} />
            </button>
            <span className="flex-1 text-center text-sm text-white font-semibold">{item.series}</span>
            <button type="button" aria-label="Más series" className="px-1.5 py-2 text-gray-400" onClick={() => onChange({ series: Math.min(20, item.series + 1) })}>
              <Plus size={14} />
            </button>
          </div>
        </label>
        <label className="text-[11px] text-gray-400 text-center">
          Reps
          <input
            value={item.repeticiones}
            onChange={(e) => onChange({ repeticiones: e.target.value })}
            placeholder="10"
            className={`${caja} mt-1`}
          />
        </label>
        <label className="text-[11px] text-gray-400 text-center">
          Peso ({unidad})
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={item.pesoObjetivoKg ? mostrarPeso(item.pesoObjetivoKg, unidad) : ''}
            onChange={(e) => onChange({ pesoObjetivoKg: aKg(Number(e.target.value) || 0, unidad) })}
            placeholder="—"
            className={`${caja} mt-1`}
          />
        </label>
        <label className="text-[11px] text-gray-400 text-center">
          Descanso
          <select
            value={item.descansoSegundos}
            onChange={(e) => onChange({ descansoSegundos: Number(e.target.value) })}
            className={`${caja} mt-1 px-0`}
          >
            {[...new Set([...DESCANSOS, item.descansoSegundos])].sort((a, b) => a - b).map((s) => (
              <option key={s} value={s}>{formatoDescansoCorto(s)}</option>
            ))}
          </select>
        </label>
      </div>
    </li>
  )
}
