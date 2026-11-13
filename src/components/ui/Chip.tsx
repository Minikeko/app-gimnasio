import type { ReactNode } from 'react'

interface Props {
  activo?: boolean
  onClick?: () => void
  children: ReactNode
}

export function Chip({ activo, onClick, children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        activo
          ? 'bg-indigo-600 border-indigo-500 text-white'
          : 'bg-gray-800 border-gray-700 text-gray-300'
      }`}
    >
      {children}
    </button>
  )
}
