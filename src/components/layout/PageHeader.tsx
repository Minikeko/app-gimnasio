import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  subtitle?: string
  back?: boolean
  /** Si devuelve false, no se vuelve atrás */
  onBack?: () => boolean
  action?: ReactNode
}

export function PageHeader({ title, subtitle, back, onBack, action }: Props) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 safe-top">
      <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
        {back && (
          <button
            onClick={() => {
              if (!onBack || onBack()) navigate(-1)
            }}
            aria-label="Volver"
            className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white truncate leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  )
}
